import * as attendanceService from "../../services/attendanceService.js";
import { validateAttendancePayload } from "../../utils/validation/attendanceValidation.js";

/**
 * Controller para criar ou atualizar um registro de presença (upsert)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function upsertAttendanceController(req, res) {
  try {
    const userId = req.body.id || req.user?.uid;
    const subjectId = req.params.subjectId || req.body.subjectId;
    const attendance = req.body.attendance || req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    if (!attendance) {
      return res.status(400).json({ error: "Attendance data is required" });
    }

    // Adicionar subjectId ao payload se não estiver presente
    attendance.subjectId = subjectId;

    // Validar payload
    const validation = validateAttendancePayload(attendance);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Chamar service para criar/atualizar presença
    const result = await attendanceService.upsertAttendance(userId, subjectId, attendance);

    return res.status(200).json({
      message: "Attendance saved successfully",
      attendance: result,
    });
  } catch (error) {
    console.error("Error in upsertAttendanceController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
