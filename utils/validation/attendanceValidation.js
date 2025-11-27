/**
 * @typedef {Object} Attendance
 * @property {string} date - Data da aula no formato YYYY-MM-DD (ex: "2025-11-26")
 * @property {string} status - Status: present, absent, late, justified
 * @property {string} subjectId - ID da matéria associada
 * @property {string} [subjectName] - Nome da matéria (denormalizado)
 * @property {string} [notes] - Observações sobre a presença/falta
 */

// Valores válidos para status
const VALID_STATUSES = ["present", "absent", "late", "justified"];

/**
 * Valida se uma data está no formato YYYY-MM-DD
 * @param {string} date - Data no formato YYYY-MM-DD
 * @returns {boolean}
 */
function isValidDateFormat(date) {
  if (typeof date !== "string") return false;
  
  // Regex para YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Tentar criar uma data válida
  const [year, month, day] = date.split("-").map(Number);
  
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Validação básica de dias por mês
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return false;
  
  // Validar se é uma data real (ex: não aceitar 2025-02-30)
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  return true;
}

/**
 * Valida os campos obrigatórios para criação/atualização de um registro de presença
 * @param {Object} attendance - Dados da presença a ser validada
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateAttendancePayload(attendance) {
  const errors = [];

  if (!attendance) {
    errors.push("Attendance data is required");
    return { valid: false, errors };
  }

  // Validação de campos obrigatórios
  if (!attendance.date || typeof attendance.date !== "string" || attendance.date.trim() === "") {
    errors.push("date is required and must be a non-empty string");
  } else if (!isValidDateFormat(attendance.date)) {
    errors.push("date must be in YYYY-MM-DD format (ex: 2025-11-26)");
  }

  if (!attendance.status || typeof attendance.status !== "string") {
    errors.push("status is required and must be a string");
  } else if (!VALID_STATUSES.includes(attendance.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  // subjectId é obrigatório (será passado via URL, mas validamos no payload também)
  if (attendance.subjectId !== undefined && attendance.subjectId !== null) {
    if (typeof attendance.subjectId !== "string" || attendance.subjectId.trim() === "") {
      errors.push("subjectId must be a non-empty string");
    }
  }

  // Validação de campos opcionais (se fornecidos)
  if (attendance.subjectName !== undefined && attendance.subjectName !== null && attendance.subjectName !== "") {
    if (typeof attendance.subjectName !== "string") {
      errors.push("subjectName must be a string");
    }
  }

  if (attendance.notes !== undefined && attendance.notes !== null && attendance.notes !== "") {
    if (typeof attendance.notes !== "string") {
      errors.push("notes must be a string");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida os campos para atualização de um registro de presença
 * Permite campos parciais, mas valida os tipos se fornecidos
 * @param {Object} updates - Dados a serem atualizados
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateUpdateAttendancePayload(updates) {
  const errors = [];

  if (!updates || Object.keys(updates).length === 0) {
    errors.push("At least one field must be provided for update");
    return { valid: false, errors };
  }

  // Validação de tipos para campos fornecidos
  if (updates.date !== undefined) {
    if (typeof updates.date !== "string" || updates.date.trim() === "") {
      errors.push("date must be a non-empty string");
    } else if (!isValidDateFormat(updates.date)) {
      errors.push("date must be in YYYY-MM-DD format (ex: 2025-11-26)");
    }
  }

  if (updates.status !== undefined) {
    if (typeof updates.status !== "string") {
      errors.push("status must be a string");
    } else if (!VALID_STATUSES.includes(updates.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
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

  if (updates.notes !== undefined && updates.notes !== null && updates.notes !== "") {
    if (typeof updates.notes !== "string") {
      errors.push("notes must be a string");
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

/**
 * Valida filtros de busca de presença
 * @param {Object} filters - Filtros de busca
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateAttendanceFilters(filters) {
  const errors = [];

  if (filters.status !== undefined) {
    if (typeof filters.status !== "string") {
      errors.push("status filter must be a string");
    } else if (!VALID_STATUSES.includes(filters.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
  }

  if (filters.dateStart !== undefined) {
    if (typeof filters.dateStart !== "string" || !isValidDateFormat(filters.dateStart)) {
      errors.push("dateStart must be in YYYY-MM-DD format");
    }
  }

  if (filters.dateEnd !== undefined) {
    if (typeof filters.dateEnd !== "string" || !isValidDateFormat(filters.dateEnd)) {
      errors.push("dateEnd must be in YYYY-MM-DD format");
    }
  }

  if (filters.limit !== undefined) {
    const limit = parseInt(filters.limit);
    if (isNaN(limit) || limit <= 0) {
      errors.push("limit must be a positive number");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
