import admin, { db } from "../firebase.config.js";
import { calculateIsOverdue } from "../utils/validation/taskValidation.js";

/**
 * @typedef {Object} Task
 * @property {string} title
 * @property {string} type - assignment, exam, quiz, presentation, project, other
 * @property {string} status - pending, delivered, completed
 * @property {string} subjectId
 * @property {string} [subjectName]
 * @property {number} dueOn - Data no formato YYYYMMDD
 * @property {string} [notes]
 * @property {boolean} [isOverdue]
 * @property {FirebaseFirestore.Timestamp} createdAt
 * @property {FirebaseFirestore.Timestamp} updatedAt
 */

/**
 * Cria uma nova task para um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} taskData - Dados da task
 * @returns {Promise<{id: string, ...Task}>} - Task criada com ID
 */
export async function createTask(userId, taskData) {
  try {
    // Calcular isOverdue se não foi fornecido
    const isOverdue = taskData.isOverdue !== undefined 
      ? taskData.isOverdue 
      : calculateIsOverdue(taskData.dueOn, taskData.status);

    // Normalizar dados e adicionar timestamps
    const normalizedData = {
      title: taskData.title,
      type: taskData.type,
      status: taskData.status,
      subjectId: taskData.subjectId,
      subjectName: taskData.subjectName || "",
      dueOn: taskData.dueOn,
      notes: taskData.notes || "",
      isOverdue: isOverdue,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .add(normalizedData);

    // Buscar o documento criado para obter os timestamps do servidor
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data();

    return {
      id: docRef.id,
      ...createdData,
    };
  } catch (error) {
    console.error("Error in createTask service:", error);
    throw new Error("Failed to create task in database");
  }
}

/**
 * Busca tasks de um usuário com filtros opcionais
 * @param {string} userId - ID do usuário
 * @param {Object} filters - Filtros opcionais
 * @param {string} [filters.subjectId] - Filtrar por matéria
 * @param {string} [filters.status] - Filtrar por status
 * @param {string} [filters.type] - Filtrar por tipo
 * @param {boolean} [filters.isOverdue] - Filtrar por atraso
 * @param {number} [filters.dueOnStart] - Data inicial (YYYYMMDD)
 * @param {number} [filters.dueOnEnd] - Data final (YYYYMMDD)
 * @returns {Promise<Task[]>} - Array de tasks
 */
export async function getTasks(userId, filters = {}) {
  try {
    let query = db
      .collection("users")
      .doc(userId)
      .collection("tasks");

    // Aplicar filtros
    if (filters.subjectId) {
      query = query.where("subjectId", "==", filters.subjectId);
    }

    if (filters.status) {
      query = query.where("status", "==", filters.status);
    }

    if (filters.type) {
      query = query.where("type", "==", filters.type);
    }

    if (filters.isOverdue !== undefined) {
      query = query.where("isOverdue", "==", filters.isOverdue);
    }

    // Filtros de data (range)
    if (filters.dueOnStart) {
      query = query.where("dueOn", ">=", filters.dueOnStart);
    }

    if (filters.dueOnEnd) {
      query = query.where("dueOn", "<=", filters.dueOnEnd);
    }

    // Ordenar por data de vencimento (mais próximo primeiro)
    // TEMPORARIAMENTE COMENTADO: Requer índice composto no Firestore
    // Descomente depois de criar o índice no Firebase Console
    // query = query.orderBy("dueOn", "asc");

    const snapshot = await query.get();

    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Recalcular isOverdue em tempo real
      const isOverdue = calculateIsOverdue(data.dueOn, data.status);
      
      return {
        id: doc.id,
        ...data,
        isOverdue, // Atualizar com valor calculado
      };
    });

    // Ordenar por dueOn no JavaScript (fallback enquanto índice não está pronto)
    tasks.sort((a, b) => a.dueOn - b.dueOn);

    return tasks;
  } catch (error) {
    console.error("Error in getTasks service:", error);
    throw new Error("Failed to fetch tasks from database");
  }
}

/**
 * Atualiza uma task existente
 * @param {string} userId - ID do usuário
 * @param {string} taskId - ID da task
 * @param {Object} updates - Dados a serem atualizados
 * @returns {Promise<void>}
 */
export async function updateTask(userId, taskId, updates) {
  try {
    // Remover campos que não devem ser atualizados
    const { id, createdAt, ...validUpdates } = updates;

    // Recalcular isOverdue se status ou dueOn foram alterados
    if (validUpdates.status !== undefined || validUpdates.dueOn !== undefined) {
      // Buscar dados atuais para ter contexto completo
      const taskRef = db
        .collection("users")
        .doc(userId)
        .collection("tasks")
        .doc(taskId);
      
      const taskDoc = await taskRef.get();
      if (taskDoc.exists) {
        const currentData = taskDoc.data();
        const newStatus = validUpdates.status || currentData.status;
        const newDueOn = validUpdates.dueOn || currentData.dueOn;
        
        validUpdates.isOverdue = calculateIsOverdue(newDueOn, newStatus);
      }
    }

    // Sempre atualizar o timestamp de atualização
    const dataToUpdate = {
      ...validUpdates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .doc(taskId)
      .update(dataToUpdate);
  } catch (error) {
    console.error("Error in updateTask service:", error);
    throw new Error("Failed to update task in database");
  }
}

/**
 * Deleta uma task
 * @param {string} userId - ID do usuário
 * @param {string} taskId - ID da task
 * @returns {Promise<void>}
 */
export async function deleteTask(userId, taskId) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .doc(taskId)
      .delete();
  } catch (error) {
    console.error("Error in deleteTask service:", error);
    throw new Error("Failed to delete task from database");
  }
}

/**
 * Busca uma task específica pelo ID
 * @param {string} userId - ID do usuário
 * @param {string} taskId - ID da task
 * @returns {Promise<Task|null>} - Task encontrada ou null
 */
export async function getTaskById(userId, taskId) {
  try {
    const taskDoc = await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .doc(taskId)
      .get();

    if (!taskDoc.exists) {
      return null;
    }

    const data = taskDoc.data();
    const isOverdue = calculateIsOverdue(data.dueOn, data.status);

    return {
      id: taskDoc.id,
      ...data,
      isOverdue,
    };
  } catch (error) {
    console.error("Error in getTaskById service:", error);
    throw new Error("Failed to fetch task from database");
  }
}
