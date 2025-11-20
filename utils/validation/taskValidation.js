/**
 * @typedef {Object} Task
 * @property {string} title - Título da tarefa
 * @property {string} type - Tipo: assignment, exam, quiz, presentation, project, other
 * @property {string} status - Status: pending, delivered, completed
 * @property {string} subjectId - ID da matéria associada
 * @property {string} [subjectName] - Nome da matéria (denormalizado)
 * @property {number} dueOn - Data limite no formato YYYYMMDD (ex: 20251130)
 * @property {string} [notes] - Anotações complementares
 * @property {boolean} [isOverdue] - Se está em atraso
 */

// Valores válidos para enums
const VALID_TYPES = ["assignment", "exam", "quiz", "presentation", "project", "other"];
const VALID_STATUSES = ["pending", "delivered", "completed"];

/**
 * Valida se uma data no formato YYYYMMDD é válida
 * @param {number} dueOn - Data no formato YYYYMMDD
 * @returns {boolean}
 */
function isValidDueOn(dueOn) {
  if (typeof dueOn !== "number") return false;
  
  const dueOnStr = String(dueOn);
  if (dueOnStr.length !== 8) return false;
  
  const year = parseInt(dueOnStr.substring(0, 4));
  const month = parseInt(dueOnStr.substring(4, 6));
  const day = parseInt(dueOnStr.substring(6, 8));
  
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Validação básica de dias por mês
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return false;
  
  return true;
}

/**
 * Valida os campos obrigatórios para criação de uma tarefa
 * @param {Object} task - Dados da tarefa a ser validada
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateCreateTaskPayload(task) {
  const errors = [];

  if (!task) {
    errors.push("Task data is required");
    return { valid: false, errors };
  }

  // Validação de campos obrigatórios
  if (!task.title || typeof task.title !== "string" || task.title.trim() === "") {
    errors.push("title is required and must be a non-empty string");
  }

  if (!task.type || typeof task.type !== "string") {
    errors.push("type is required and must be a string");
  } else if (!VALID_TYPES.includes(task.type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(", ")}`);
  }

  if (!task.status || typeof task.status !== "string") {
    errors.push("status is required and must be a string");
  } else if (!VALID_STATUSES.includes(task.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (!task.subjectId || typeof task.subjectId !== "string" || task.subjectId.trim() === "") {
    errors.push("subjectId is required and must be a non-empty string");
  }

  if (task.dueOn === undefined || task.dueOn === null) {
    errors.push("dueOn is required");
  } else if (!isValidDueOn(task.dueOn)) {
    errors.push("dueOn must be a valid date in YYYYMMDD format (ex: 20251130)");
  }

  // Validação de campos opcionais (se fornecidos)
  if (task.subjectName !== undefined && task.subjectName !== null && task.subjectName !== "") {
    if (typeof task.subjectName !== "string") {
      errors.push("subjectName must be a string");
    }
  }

  if (task.notes !== undefined && task.notes !== null && task.notes !== "") {
    if (typeof task.notes !== "string") {
      errors.push("notes must be a string");
    }
  }

  if (task.isOverdue !== undefined && task.isOverdue !== null) {
    if (typeof task.isOverdue !== "boolean") {
      errors.push("isOverdue must be a boolean");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida os campos para atualização de uma tarefa
 * Permite campos parciais, mas valida os tipos se fornecidos
 * @param {Object} updates - Dados a serem atualizados
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateUpdateTaskPayload(updates) {
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

  if (updates.type !== undefined) {
    if (typeof updates.type !== "string") {
      errors.push("type must be a string");
    } else if (!VALID_TYPES.includes(updates.type)) {
      errors.push(`type must be one of: ${VALID_TYPES.join(", ")}`);
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

  if (updates.dueOn !== undefined) {
    if (!isValidDueOn(updates.dueOn)) {
      errors.push("dueOn must be a valid date in YYYYMMDD format (ex: 20251130)");
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

  if (updates.isOverdue !== undefined && updates.isOverdue !== null) {
    if (typeof updates.isOverdue !== "boolean") {
      errors.push("isOverdue must be a boolean");
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
 * Calcula se uma tarefa está em atraso
 * @param {number} dueOn - Data limite no formato YYYYMMDD
 * @param {string} status - Status da tarefa
 * @returns {boolean}
 */
export function calculateIsOverdue(dueOn, status) {
  // Se já foi entregue ou completada, não está em atraso
  if (status === "delivered" || status === "completed") {
    return false;
  }

  // Obter data atual no formato YYYYMMDD
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentDay = String(now.getDate()).padStart(2, "0");
  const currentDateInt = parseInt(`${currentYear}${currentMonth}${currentDay}`);

  // Comparar com a data limite
  return dueOn < currentDateInt;
}
