import * as subjectService from "../../services/subjectService.js";
import { validateUpdateSubjectPayload } from "../../utils/validation/subjectValidation.js";

/**
 * Controller para atualizar uma matéria existente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function updateSubjectController(req, res) {
  try {
    // Suportar formato antigo (body) e novo (params)
    const userId = req.body.id || req.user?.uid;
    const subjectId = req.params.subjectId || req.body.subject?.id || req.body.subjectId;
    const updates = req.body.subject || req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    // Criar objeto de updates limpo (remover campos de controle)
    const { id, subject, ...cleanUpdates } = updates;

    // Validar payload
    const validation = validateUpdateSubjectPayload(cleanUpdates);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Chamar service para atualizar matéria
    await subjectService.updateSubject(userId, subjectId, cleanUpdates);

    return res.status(200).json({
      message: "Subject updated successfully",
    });
  } catch (error) {
    console.error("Error in updateSubjectController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
