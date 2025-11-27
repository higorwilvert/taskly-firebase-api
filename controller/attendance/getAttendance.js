import * as attendanceService from "../../services/attendanceService.js";
import { validateAttendanceFilters } from "../../utils/validation/attendanceValidation.js";

/**
 * Controller para buscar todos os registros de presença de uma matéria
 * Suporta filtros via query params
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getAttendanceController(req, res) {
  try {
    const userId = req.query.userId || 
                req.headers['x-user-id'] || 
                req.user?.uid;
    
    const subjectId = req.params.subjectId || req.query.subjectId;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param: GET /subjects/:subjectId/attendance?userId=YOUR_USER_ID"
      });
    }

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    // Extrair filtros opcionais
    const filters = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.dateStart) {
      filters.dateStart = req.query.dateStart;
    }

    if (req.query.dateEnd) {
      filters.dateEnd = req.query.dateEnd;
    }

    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit);
    }

    // Validar filtros
    const validation = validateAttendanceFilters(filters);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Invalid filters",
        details: validation.errors,
      });
    }

    // Chamar service para buscar registros de presença
    const attendance = await attendanceService.getAttendanceBySubject(userId, subjectId, filters);

    return res.status(200).json({
      attendance: attendance,
      count: attendance.length,
    });
  } catch (error) {
    console.error("Error in getAttendanceController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller para buscar um registro de presença específico por data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getAttendanceByDateController(req, res) {
  try {
    const userId = req.query.userId || 
                req.headers['x-user-id'] || 
                req.user?.uid;
    
    const subjectId = req.params.subjectId;
    const date = req.params.date;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param"
      });
    }

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Chamar service para buscar registro
    const attendance = await attendanceService.getAttendanceByDate(userId, subjectId, date);

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    return res.status(200).json({
      attendance: attendance,
    });
  } catch (error) {
    console.error("Error in getAttendanceByDateController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller para buscar estatísticas de presença de uma matéria
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getAttendanceStatsController(req, res) {
  try {
    const userId = req.query.userId || 
                req.headers['x-user-id'] || 
                req.user?.uid;
    
    const subjectId = req.params.subjectId;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param"
      });
    }

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    // Chamar service para calcular estatísticas
    const stats = await attendanceService.getAttendanceStats(userId, subjectId);

    return res.status(200).json({
      stats: stats,
    });
  } catch (error) {
    console.error("Error in getAttendanceStatsController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
