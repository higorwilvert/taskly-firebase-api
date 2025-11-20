import * as subjectService from "../../services/subjectService.js";

/**
 * Controller para buscar todas as matérias de um usuário
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getSubjectsController(req, res) {
  try {
    const userId = req.query.userId || 
                   req.headers['x-user-id'] || 
                   req.user?.uid;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param: GET /subjects?userId=YOUR_USER_ID"
      });
    }

    const subjects = await subjectService.getSubjects(userId);

    return res.status(200).json({
      subjects: subjects,
      // Manter compatibilidade com código antigo
      newSubject: subjects,
    });
  } catch (error) {
    console.error("Error in getSubjectsController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}