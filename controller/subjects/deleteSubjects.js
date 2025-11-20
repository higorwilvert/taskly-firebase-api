import * as subjectService from "../../services/subjectService.js";

/**
 * Controller para deletar uma matéria
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function deleteSubjectController(req, res) {
  try {
    // Suportar formato antigo (body) e novo (params)
    const userId = req.body.id || req.user?.uid;
    const subjectId = req.params.subjectId || req.body.subjectId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    // Chamar service para deletar matéria (com await!)
    await subjectService.deleteSubject(userId, subjectId);

    return res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteSubjectController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

