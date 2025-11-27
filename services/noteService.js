import admin, { db } from "../firebase.config.js";

/**
 * @typedef {Object} Note
 * @property {string} title - Título da anotação
 * @property {string} content - Conteúdo da anotação
 * @property {string} subjectId - ID da matéria associada
 * @property {string} [subjectName] - Nome da matéria (denormalizado)
 * @property {boolean} [pinned] - Se a anotação está fixada
 * @property {FirebaseFirestore.Timestamp} createdAt
 * @property {FirebaseFirestore.Timestamp} updatedAt
 */

/**
 * Cria uma nova anotação para um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} noteData - Dados da anotação
 * @returns {Promise<{id: string, ...Note}>} - Anotação criada com ID
 */
export async function createNote(userId, noteData) {
  try {
    // Normalizar dados e adicionar timestamps
    const normalizedData = {
      title: noteData.title,
      content: noteData.content,
      subjectId: noteData.subjectId,
      subjectName: noteData.subjectName || "",
      pinned: noteData.pinned || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db
      .collection("users")
      .doc(userId)
      .collection("notes")
      .add(normalizedData);

    // Buscar o documento criado para obter os timestamps do servidor
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data();

    return {
      id: docRef.id,
      ...createdData,
    };
  } catch (error) {
    console.error("Error in createNote service:", error);
    throw new Error("Failed to create note in database");
  }
}

/**
 * Busca anotações de um usuário com filtros opcionais
 * @param {string} userId - ID do usuário
 * @param {Object} filters - Filtros opcionais
 * @param {string} [filters.subjectId] - Filtrar por matéria
 * @param {boolean} [filters.pinned] - Filtrar por anotações fixadas
 * @param {string} [filters.search] - Buscar no título ou conteúdo
 * @returns {Promise<Note[]>} - Array de anotações
 */
export async function getNotes(userId, filters = {}) {
  try {
    let query = db
      .collection("users")
      .doc(userId)
      .collection("notes");

    // Aplicar filtros
    if (filters.subjectId) {
      query = query.where("subjectId", "==", filters.subjectId);
    }

    if (filters.pinned !== undefined) {
      query = query.where("pinned", "==", filters.pinned);
    }

    const snapshot = await query.get();

    let notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtro de busca textual (feito no JavaScript, pois Firestore não tem full-text search nativo)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      notes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar: fixadas primeiro, depois por data de atualização (mais recente primeiro)
    notes.sort((a, b) => {
      // Fixadas vêm primeiro
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Se ambas fixadas ou ambas não fixadas, ordenar por updatedAt
      const timeA = a.updatedAt?.toMillis() || 0;
      const timeB = b.updatedAt?.toMillis() || 0;
      return timeB - timeA; // Mais recente primeiro
    });

    return notes;
  } catch (error) {
    console.error("Error in getNotes service:", error);
    throw new Error("Failed to fetch notes from database");
  }
}

/**
 * Busca uma anotação específica pelo ID
 * @param {string} userId - ID do usuário
 * @param {string} noteId - ID da anotação
 * @returns {Promise<Note|null>} - Anotação encontrada ou null
 */
export async function getNoteById(userId, noteId) {
  try {
    const noteDoc = await db
      .collection("users")
      .doc(userId)
      .collection("notes")
      .doc(noteId)
      .get();

    if (!noteDoc.exists) {
      return null;
    }

    return {
      id: noteDoc.id,
      ...noteDoc.data(),
    };
  } catch (error) {
    console.error("Error in getNoteById service:", error);
    throw new Error("Failed to fetch note from database");
  }
}

/**
 * Atualiza uma anotação existente
 * @param {string} userId - ID do usuário
 * @param {string} noteId - ID da anotação
 * @param {Object} updates - Dados a serem atualizados
 * @returns {Promise<void>}
 */
export async function updateNote(userId, noteId, updates) {
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
      .collection("notes")
      .doc(noteId)
      .update(dataToUpdate);
  } catch (error) {
    console.error("Error in updateNote service:", error);
    throw new Error("Failed to update note in database");
  }
}

/**
 * Deleta uma anotação
 * @param {string} userId - ID do usuário
 * @param {string} noteId - ID da anotação
 * @returns {Promise<void>}
 */
export async function deleteNote(userId, noteId) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .collection("notes")
      .doc(noteId)
      .delete();
  } catch (error) {
    console.error("Error in deleteNote service:", error);
    throw new Error("Failed to delete note from database");
  }
}
