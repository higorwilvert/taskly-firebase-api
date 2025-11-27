import * as attendanceService from "../../services/attendanceService.js";

/**
 * Controller para deletar um registro de presença
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function deleteAttendanceController(req, res) {
  try {
    const userId = req.body.id || req.user?.uid;
    const subjectId = req.params.subjectId;
    const date = req.params.date;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Chamar service para deletar presença
    await attendanceService.deleteAttendance(userId, subjectId, date);

    return res.status(200).json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAttendanceController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
