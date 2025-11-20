/**
 * @typedef {Object} Subject
 * @property {string} subjectName - Nome da matéria
 * @property {string} teacherName - Nome do professor
 * @property {string} color - Cor da matéria (hex ou nome)
 * @property {string} icon - Ícone da matéria
 * @property {number} totalClasses - Total de aulas
 * @property {string} classTime - Horário de início da aula
 * @property {string} [classEndTime] - Horário de término da aula (opcional)
 * @property {string} semester - Semestre (ex: "2025/1")
 * @property {number} year - Ano (ex: 2025)
 * @property {string} collegePeriod - Período da faculdade (ex: "3º período")
 * @property {string[]} [daysOfWeek] - Dias da semana (opcional)
 */

/**
 * Valida os campos obrigatórios para criação de uma matéria
 * @param {Object} subject - Dados da matéria a ser validada
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateCreateSubjectPayload(subject) {
  const errors = [];

  if (!subject) {
    errors.push("Subject data is required");
    return { valid: false, errors };
  }

  // Validação de campos obrigatórios
  if (!subject.subjectName || typeof subject.subjectName !== "string" || subject.subjectName.trim() === "") {
    errors.push("subjectName is required and must be a non-empty string");
  }

  if (!subject.teacherName || typeof subject.teacherName !== "string" || subject.teacherName.trim() === "") {
    errors.push("teacherName is required and must be a non-empty string");
  }

  if (!subject.color || typeof subject.color !== "string" || subject.color.trim() === "") {
    errors.push("color is required and must be a non-empty string");
  }

  if (!subject.icon || typeof subject.icon !== "string" || subject.icon.trim() === "") {
    errors.push("icon is required and must be a non-empty string");
  }

  if (subject.totalClasses === undefined || subject.totalClasses === null) {
    errors.push("totalClasses is required");
  } else if (typeof subject.totalClasses !== "number" || subject.totalClasses < 0) {
    errors.push("totalClasses must be a non-negative number");
  }

  if (!subject.classTime || typeof subject.classTime !== "string" || subject.classTime.trim() === "") {
    errors.push("classTime is required and must be a non-empty string");
  }

  if (!subject.semester || typeof subject.semester !== "string" || subject.semester.trim() === "") {
    errors.push("semester is required and must be a non-empty string");
  }

  if (subject.year === undefined || subject.year === null) {
    errors.push("year is required");
  } else if (typeof subject.year !== "number" || subject.year < 1900 || subject.year > 2100) {
    errors.push("year must be a valid number between 1900 and 2100");
  }

  if (!subject.collegePeriod || typeof subject.collegePeriod !== "string" || subject.collegePeriod.trim() === "") {
    errors.push("collegePeriod is required and must be a non-empty string");
  }

  // Validação de campos opcionais (se fornecidos)
  if (subject.classEndTime !== undefined && subject.classEndTime !== null && subject.classEndTime !== "") {
    if (typeof subject.classEndTime !== "string") {
      errors.push("classEndTime must be a string");
    }
  }

  if (subject.daysOfWeek !== undefined && subject.daysOfWeek !== null) {
    if (!Array.isArray(subject.daysOfWeek)) {
      errors.push("daysOfWeek must be an array");
    } else if (subject.daysOfWeek.length > 0) {
      const validDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
      const invalidDays = subject.daysOfWeek.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        errors.push(`daysOfWeek contains invalid days: ${invalidDays.join(", ")}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida os campos para atualização de uma matéria
 * Permite campos parciais, mas valida os tipos se fornecidos
 * @param {Object} updates - Dados a serem atualizados
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateUpdateSubjectPayload(updates) {
  const errors = [];

  if (!updates || Object.keys(updates).length === 0) {
    errors.push("At least one field must be provided for update");
    return { valid: false, errors };
  }

  // Validação de tipos para campos fornecidos
  if (updates.subjectName !== undefined) {
    if (typeof updates.subjectName !== "string" || updates.subjectName.trim() === "") {
      errors.push("subjectName must be a non-empty string");
    }
  }

  if (updates.teacherName !== undefined) {
    if (typeof updates.teacherName !== "string" || updates.teacherName.trim() === "") {
      errors.push("teacherName must be a non-empty string");
    }
  }

  if (updates.color !== undefined) {
    if (typeof updates.color !== "string" || updates.color.trim() === "") {
      errors.push("color must be a non-empty string");
    }
  }

  if (updates.icon !== undefined) {
    if (typeof updates.icon !== "string" || updates.icon.trim() === "") {
      errors.push("icon must be a non-empty string");
    }
  }

  if (updates.totalClasses !== undefined) {
    if (typeof updates.totalClasses !== "number" || updates.totalClasses < 0) {
      errors.push("totalClasses must be a non-negative number");
    }
  }

  if (updates.classTime !== undefined) {
    if (typeof updates.classTime !== "string" || updates.classTime.trim() === "") {
      errors.push("classTime must be a non-empty string");
    }
  }

  if (updates.classEndTime !== undefined && updates.classEndTime !== null && updates.classEndTime !== "") {
    if (typeof updates.classEndTime !== "string") {
      errors.push("classEndTime must be a string");
    }
  }

  if (updates.semester !== undefined) {
    if (typeof updates.semester !== "string" || updates.semester.trim() === "") {
      errors.push("semester must be a non-empty string");
    }
  }

  if (updates.year !== undefined) {
    if (typeof updates.year !== "number" || updates.year < 1900 || updates.year > 2100) {
      errors.push("year must be a valid number between 1900 and 2100");
    }
  }

  if (updates.collegePeriod !== undefined) {
    if (typeof updates.collegePeriod !== "string" || updates.collegePeriod.trim() === "") {
      errors.push("collegePeriod must be a non-empty string");
    }
  }

  if (updates.daysOfWeek !== undefined && updates.daysOfWeek !== null) {
    if (!Array.isArray(updates.daysOfWeek)) {
      errors.push("daysOfWeek must be an array");
    } else if (updates.daysOfWeek.length > 0) {
      const validDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
      const invalidDays = updates.daysOfWeek.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        errors.push(`daysOfWeek contains invalid days: ${invalidDays.join(", ")}`);
      }
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
