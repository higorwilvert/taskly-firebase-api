import admin, { db } from "../firebase.config.js";

/**
 * @typedef {Object} Attendance
 * @property {string} date - Data da aula no formato YYYY-MM-DD (ex: "2025-11-26")
 * @property {string} status - Status: present, absent, late, justified
 * @property {string} subjectId - ID da matéria associada
 * @property {string} [subjectName] - Nome da matéria (denormalizado)
 * @property {string} [notes] - Observações sobre a presença/falta
 * @property {FirebaseFirestore.Timestamp} createdAt
 * @property {FirebaseFirestore.Timestamp} updatedAt
 */

/**
 * Cria ou atualiza um registro de presença (upsert)
 * Usa a data como ID do documento para garantir unicidade
 * @param {string} userId - ID do usuário
 * @param {string} subjectId - ID da matéria
 * @param {Object} attendanceData - Dados da presença
 * @returns {Promise<{id: string, ...Attendance}>} - Registro criado/atualizado com ID
 */
export async function upsertAttendance(userId, subjectId, attendanceData) {
  try {
    const { date } = attendanceData;

    // Usar a data como ID do documento para garantir unicidade
    const attendanceRef = db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .doc(subjectId)
      .collection("attendance")
      .doc(date);

    // Verificar se já existe
    const existingDoc = await attendanceRef.get();
    const isUpdate = existingDoc.exists;

    // Preparar dados normalizados
    const normalizedData = {
      date: attendanceData.date,
      status: attendanceData.status,
      subjectId: subjectId, // Redundante, mas útil para consultas
      subjectName: attendanceData.subjectName || "",
      notes: attendanceData.notes || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Se está criando, adicionar createdAt
    if (!isUpdate) {
      normalizedData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Criar ou atualizar
    await attendanceRef.set(normalizedData, { merge: true });

    // Buscar o documento atualizado para obter os timestamps do servidor
    const updatedDoc = await attendanceRef.get();
    const updatedData = updatedDoc.data();

    return {
      id: attendanceRef.id,
      ...updatedData,
    };
  } catch (error) {
    console.error("Error in upsertAttendance service:", error);
    throw new Error("Failed to upsert attendance in database");
  }
}

/**
 * Busca registros de presença de uma matéria com filtros opcionais
 * @param {string} userId - ID do usuário
 * @param {string} subjectId - ID da matéria
 * @param {Object} filters - Filtros opcionais
 * @param {string} [filters.status] - Filtrar por status (present, absent, late, justified)
 * @param {string} [filters.dateStart] - Data inicial no formato YYYY-MM-DD
 * @param {string} [filters.dateEnd] - Data final no formato YYYY-MM-DD
 * @param {number} [filters.limit] - Limitar quantidade de resultados
 * @returns {Promise<Attendance[]>} - Array de registros de presença
 */
export async function getAttendanceBySubject(userId, subjectId, filters = {}) {
  try {
    let query = db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .doc(subjectId)
      .collection("attendance");

    // Aplicar filtros
    if (filters.status) {
      query = query.where("status", "==", filters.status);
    }

    // Filtros de data (range)
    if (filters.dateStart) {
      query = query.where("date", ">=", filters.dateStart);
    }

    if (filters.dateEnd) {
      query = query.where("date", "<=", filters.dateEnd);
    }

    // Ordenar por data (mais recente primeiro)
    query = query.orderBy("date", "desc");

    // Limitar resultados se especificado
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();

    const attendance = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return attendance;
  } catch (error) {
    console.error("Error in getAttendanceBySubject service:", error);
    throw new Error("Failed to fetch attendance from database");
  }
}

/**
 * Busca um registro de presença específico pela data
 * @param {string} userId - ID do usuário
 * @param {string} subjectId - ID da matéria
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {Promise<Attendance|null>} - Registro encontrado ou null
 */
export async function getAttendanceByDate(userId, subjectId, date) {
  try {
    const attendanceDoc = await db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .doc(subjectId)
      .collection("attendance")
      .doc(date)
      .get();

    if (!attendanceDoc.exists) {
      return null;
    }

    return {
      id: attendanceDoc.id,
      ...attendanceDoc.data(),
    };
  } catch (error) {
    console.error("Error in getAttendanceByDate service:", error);
    throw new Error("Failed to fetch attendance from database");
  }
}

/**
 * Deleta um registro de presença
 * @param {string} userId - ID do usuário
 * @param {string} subjectId - ID da matéria
 * @param {string} date - Data no formato YYYY-MM-DD (usado como ID)
 * @returns {Promise<void>}
 */
export async function deleteAttendance(userId, subjectId, date) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .doc(subjectId)
      .collection("attendance")
      .doc(date)
      .delete();
  } catch (error) {
    console.error("Error in deleteAttendance service:", error);
    throw new Error("Failed to delete attendance from database");
  }
}

/**
 * Calcula estatísticas de presença para uma matéria
 * @param {string} userId - ID do usuário
 * @param {string} subjectId - ID da matéria
 * @returns {Promise<Object>} - Estatísticas de presença
 */
export async function getAttendanceStats(userId, subjectId) {
  try {
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .doc(subjectId)
      .collection("attendance")
      .get();

    const stats = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      justified: 0,
      attendanceRate: 0,
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      switch (data.status) {
        case "present":
          stats.present++;
          break;
        case "absent":
          stats.absent++;
          break;
        case "late":
          stats.late++;
          break;
        case "justified":
          stats.justified++;
          break;
      }
    });

    // Calcular taxa de presença (present + late) / total
    if (stats.total > 0) {
      stats.attendanceRate = ((stats.present + stats.late) / stats.total * 100).toFixed(2);
    }

    return stats;
  } catch (error) {
    console.error("Error in getAttendanceStats service:", error);
    throw new Error("Failed to calculate attendance stats");
  }
}
