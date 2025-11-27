import { db } from "../firebase.config.js";
import { calculateIsOverdue } from "../utils/validation/taskValidation.js";

/**
 * @typedef {Object} DashboardOverview
 * @property {Object[]} upcomingTasks - Próximas tarefas pendentes
 * @property {Object} tasksSummary - Resumo geral de tarefas
 * @property {Object[]} subjectsSummary - Resumo por disciplina
 * @property {Object} attendanceSummary - Resumo geral de presenças
 */

/**
 * Obtém a data atual no formato YYYYMMDD
 * @returns {number}
 */
function getCurrentDateInt() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return parseInt(`${year}${month}${day}`);
}

/**
 * Busca resumo completo do dashboard para um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} options - Opções adicionais
 * @param {number} [options.upcomingLimit=5] - Quantidade de próximas tarefas a retornar
 * @returns {Promise<DashboardOverview>}
 */
export async function getDashboardOverview(userId, options = {}) {
  try {
    const upcomingLimit = options.upcomingLimit || 5;

    // Buscar todos os dados necessários em paralelo
    const [tasksSnapshot, subjectsSnapshot] = await Promise.all([
      db.collection("users").doc(userId).collection("tasks").get(),
      db.collection("users").doc(userId).collection("subjects").get(),
    ]);

    // Processar tasks
    const currentDate = getCurrentDateInt();
    const tasks = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      const isOverdue = calculateIsOverdue(data.dueOn, data.status);
      return {
        id: doc.id,
        ...data,
        isOverdue,
      };
    });

    // Calcular resumo de tarefas
    const tasksSummary = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      delivered: tasks.filter((t) => t.status === "delivered").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => t.isOverdue && t.status === "pending").length,
    };

    // Buscar próximas tarefas pendentes (não atrasadas, ordenadas por data)
    const upcomingTasks = tasks
      .filter((t) => t.status === "pending" && !t.isOverdue)
      .sort((a, b) => a.dueOn - b.dueOn)
      .slice(0, upcomingLimit)
      .map((t) => ({
        id: t.id,
        title: t.title,
        subjectId: t.subjectId,
        subjectName: t.subjectName || "",
        type: t.type,
        status: t.status,
        dueOn: t.dueOn,
        isOverdue: t.isOverdue,
      }));

    // Processar subjects e buscar dados de attendance para cada um
    const subjects = subjectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Buscar attendance de todas as matérias em paralelo
    const attendancePromises = subjects.map(async (subject) => {
      try {
        const attendanceSnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("subjects")
          .doc(subject.id)
          .collection("attendance")
          .get();

        const attendanceRecords = attendanceSnapshot.docs.map((doc) => doc.data());

        return {
          subjectId: subject.id,
          records: attendanceRecords,
        };
      } catch (error) {
        console.error(`Error fetching attendance for subject ${subject.id}:`, error);
        return {
          subjectId: subject.id,
          records: [],
        };
      }
    });

    const attendanceData = await Promise.all(attendancePromises);

    // Criar mapa de attendance por matéria
    const attendanceBySubject = {};
    attendanceData.forEach((data) => {
      attendanceBySubject[data.subjectId] = data.records;
    });

    // Calcular resumo por disciplina
    const subjectsSummary = subjects.map((subject) => {
      const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
      const pendingTasks = subjectTasks.filter((t) => t.status === "pending").length;

      const attendanceRecords = attendanceBySubject[subject.id] || [];
      const totalClasses = attendanceRecords.length;
      const absences = attendanceRecords.filter((a) => a.status === "absent").length;
      const presences = attendanceRecords.filter((a) => a.status === "present").length;
      const lates = attendanceRecords.filter((a) => a.status === "late").length;
      const justified = attendanceRecords.filter((a) => a.status === "justified").length;

      // Calcular se está em risco (mais de 25% de faltas)
      let isAtRisk = false;
      let attendanceRate = 0;

      if (totalClasses > 0) {
        // Taxa de presença = (presenças + atrasos) / total
        attendanceRate = parseFloat(
          (((presences + lates) / totalClasses) * 100).toFixed(2)
        );
        
        // Risco se taxa de presença < 75% (ou seja, mais de 25% de faltas)
        isAtRisk = attendanceRate < 75;
      }

      return {
        subjectId: subject.id,
        subjectName: subject.subjectName,
        color: subject.color,
        icon: subject.icon,
        pendingTasks: pendingTasks,
        attendance: {
          totalClasses: totalClasses,
          absences: absences,
          presences: presences,
          lates: lates,
          justified: justified,
          attendanceRate: attendanceRate,
          isAtRisk: isAtRisk,
        },
      };
    });

    // Calcular resumo geral de attendance
    let totalClassesAll = 0;
    let totalAbsences = 0;
    let totalPresences = 0;
    let totalLates = 0;
    let totalJustified = 0;

    Object.values(attendanceBySubject).forEach((records) => {
      records.forEach((record) => {
        totalClassesAll++;
        switch (record.status) {
          case "absent":
            totalAbsences++;
            break;
          case "present":
            totalPresences++;
            break;
          case "late":
            totalLates++;
            break;
          case "justified":
            totalJustified++;
            break;
        }
      });
    });

    const overallAttendanceRate =
      totalClassesAll > 0
        ? parseFloat((((totalPresences + totalLates) / totalClassesAll) * 100).toFixed(2))
        : 0;

    const attendanceSummary = {
      totalClasses: totalClassesAll,
      absences: totalAbsences,
      presences: totalPresences,
      lates: totalLates,
      justified: totalJustified,
      attendanceRate: overallAttendanceRate,
    };

    // Retornar overview completo
    return {
      upcomingTasks,
      tasksSummary,
      subjectsSummary,
      attendanceSummary,
    };
  } catch (error) {
    console.error("Error in getDashboardOverview service:", error);
    throw new Error("Failed to fetch dashboard overview from database");
  }
}

/**
 * Busca apenas o resumo de tarefas
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>}
 */
export async function getTasksSummary(userId) {
  try {
    const tasksSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .get();

    const tasks = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      const isOverdue = calculateIsOverdue(data.dueOn, data.status);
      return {
        id: doc.id,
        ...data,
        isOverdue,
      };
    });

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      delivered: tasks.filter((t) => t.status === "delivered").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter((t) => t.isOverdue && t.status === "pending").length,
    };
  } catch (error) {
    console.error("Error in getTasksSummary service:", error);
    throw new Error("Failed to fetch tasks summary from database");
  }
}

/**
 * Busca apenas próximas tarefas
 * @param {string} userId - ID do usuário
 * @param {number} [limit=5] - Quantidade de tarefas a retornar
 * @returns {Promise<Object[]>}
 */
export async function getUpcomingTasks(userId, limit = 5) {
  try {
    const tasksSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .where("status", "==", "pending")
      .get();

    const tasks = tasksSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const isOverdue = calculateIsOverdue(data.dueOn, data.status);
        return {
          id: doc.id,
          ...data,
          isOverdue,
        };
      })
      .filter((t) => !t.isOverdue) // Apenas tarefas não atrasadas
      .sort((a, b) => a.dueOn - b.dueOn) // Ordenar por data
      .slice(0, limit) // Limitar quantidade
      .map((t) => ({
        id: t.id,
        title: t.title,
        subjectId: t.subjectId,
        subjectName: t.subjectName || "",
        type: t.type,
        status: t.status,
        dueOn: t.dueOn,
        isOverdue: t.isOverdue,
      }));

    return tasks;
  } catch (error) {
    console.error("Error in getUpcomingTasks service:", error);
    throw new Error("Failed to fetch upcoming tasks from database");
  }
}
