import admin, { db } from "../firebase.config.js";

/**
 * @typedef {Object} Subject
 * @property {string} subjectName
 * @property {string} teacherName
 * @property {string} color
 * @property {string} icon
 * @property {number} totalClasses
 * @property {string} classTime
 * @property {string} [classEndTime]
 * @property {string} semester
 * @property {number} year
 * @property {string} collegePeriod
 * @property {string[]} [daysOfWeek]
 * @property {FirebaseFirestore.Timestamp} createdAt
 * @property {FirebaseFirestore.Timestamp} updatedAt
 */

/**
 * Cria uma nova matéria para um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} subjectData - Dados da matéria
 * @returns {Promise<{id: string, ...Subject}>} - Matéria criada com ID
 */
export async function createSubject(userId, subjectData) {
  try {
    // Normalizar dados e adicionar timestamps
    const normalizedData = {
      subjectName: subjectData.subjectName,
      teacherName: subjectData.teacherName,
      color: subjectData.color,
      icon: subjectData.icon,
      totalClasses: subjectData.totalClasses,
      classTime: subjectData.classTime,
      classEndTime: subjectData.classEndTime || "",
      semester: subjectData.semester,
      year: subjectData.year,
      collegePeriod: subjectData.collegePeriod,
      daysOfWeek: subjectData.daysOfWeek || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .add(normalizedData);

    // Buscar o documento criado para obter os timestamps do servidor
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data();

    return {
      id: docRef.id,
      ...createdData,
    };
  } catch (error) {
    console.error("Error in createSubject service:", error);
    throw new Error("Failed to create subject in database");
  }
}

/**
 * Busca todas as matérias de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Subject[]>} - Array de matérias
 */
export async function getSubjects(userId) {
  try {
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .get();

    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return subjects;
  } catch (error) {
    console.error("Error in getSubjects service:", error);
    throw new Error("Failed to fetch subjects from database");
  }
}

/**
 * Atualiza uma matéria existente
 * @param {string} userId - ID do usuário
 * @param {string} subjectId - ID da matéria
 * @param {Object} updates - Dados a serem atualizados
 * @returns {Promise<void>}
 */
export async function updateSubject(userId, subjectId, updates) {
  try {
    // Remover campos que não devem ser atualizados
    const { id, createdAt, ...validUpdates } = updates;

    // Sempre atualizar o timestamp de atualização
    const dataToUpdate = {
      ...validUpdates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .doc(subjectId)
      .update(dataToUpdate);
  } catch (error) {
    console.error("Error in updateSubject service:", error);
    throw new Error("Failed to update subject in database");
  }
}

/**
 * Deleta uma matéria
 * @param {string} userId - ID do usuário
 * @param {string} subjectId - ID da matéria
 * @returns {Promise<void>}
 */
export async function deleteSubject(userId, subjectId) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .collection("subjects")
      .doc(subjectId)
      .delete();
  } catch (error) {
    console.error("Error in deleteSubject service:", error);
    throw new Error("Failed to delete subject from database");
  }
}
