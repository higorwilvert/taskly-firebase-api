/**
 * @typedef {Object} Note
 * @property {string} title - Título da anotação
 * @property {string} content - Conteúdo da anotação
 * @property {string} subjectId - ID da matéria associada
 * @property {string} [subjectName] - Nome da matéria (denormalizado)
 * @property {boolean} [pinned] - Se a anotação está fixada
 */

/**
 * Valida os campos obrigatórios para criação de uma anotação
 * @param {Object} note - Dados da anotação a ser validada
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateCreateNotePayload(note) {
  const errors = [];

  if (!note) {
    errors.push("Note data is required");
    return { valid: false, errors };
  }

  // Validação de campos obrigatórios
  if (!note.title || typeof note.title !== "string" || note.title.trim() === "") {
    errors.push("title is required and must be a non-empty string");
  }

  if (!note.content || typeof note.content !== "string" || note.content.trim() === "") {
    errors.push("content is required and must be a non-empty string");
  }

  if (!note.subjectId || typeof note.subjectId !== "string" || note.subjectId.trim() === "") {
    errors.push("subjectId is required and must be a non-empty string");
  }

  // Validação de campos opcionais (se fornecidos)
  if (note.subjectName !== undefined && note.subjectName !== null && note.subjectName !== "") {
    if (typeof note.subjectName !== "string") {
      errors.push("subjectName must be a string");
    }
  }

  if (note.pinned !== undefined && note.pinned !== null) {
    if (typeof note.pinned !== "boolean") {
      errors.push("pinned must be a boolean");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida os campos para atualização de uma anotação
 * Permite campos parciais, mas valida os tipos se fornecidos
 * @param {Object} updates - Dados a serem atualizados
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateUpdateNotePayload(updates) {
  const errors = [];

  if (!updates || Object.keys(updates).length === 0) {
    errors.push("At least one field must be provided for update");
    return { valid: false, errors };
  }

  // Validação de tipos para campos fornecidos
  if (updates.title !== undefined) {
    if (typeof updates.title !== "string" || updates.title.trim() === "") {
      errors.push("title must be a non-empty string");
    }
  }

  if (updates.content !== undefined) {
    if (typeof updates.content !== "string" || updates.content.trim() === "") {
      errors.push("content must be a non-empty string");
    }
  }

  if (updates.subjectId !== undefined) {
    if (typeof updates.subjectId !== "string" || updates.subjectId.trim() === "") {
      errors.push("subjectId must be a non-empty string");
    }
  }

  if (updates.subjectName !== undefined && updates.subjectName !== null && updates.subjectName !== "") {
    if (typeof updates.subjectName !== "string") {
      errors.push("subjectName must be a string");
    }
  }

  if (updates.pinned !== undefined && updates.pinned !== null) {
    if (typeof updates.pinned !== "boolean") {
      errors.push("pinned must be a boolean");
    }
  }

  // Não permitir atualização de campos de sistema
  if (updates.createdAt !== undefined) {
    errors.push("createdAt cannot be updated");
  }

  if (updates.id !== undefined) {
    errors.push("id cannot be updated");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
