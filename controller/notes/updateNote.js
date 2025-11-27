import * as noteService from "../../services/noteService.js";
import { validateUpdateNotePayload } from "../../utils/validation/noteValidation.js";

/**
 * Controller para atualizar uma anotação existente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function updateNoteController(req, res) {
  try {
    // Suportar formato antigo (body) e novo (params)
    const userId = req.body.id || req.user?.uid;
    const noteId = req.params.noteId || req.body.note?.id || req.body.noteId;
    const updates = req.body.note || req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!noteId) {
      return res.status(400).json({ error: "Note ID is required" });
    }

    // Criar objeto de updates limpo (remover campos de controle)
    const { id, note, ...cleanUpdates } = updates;

    // Validar payload
    const validation = validateUpdateNotePayload(cleanUpdates);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Chamar service para atualizar note
    await noteService.updateNote(userId, noteId, cleanUpdates);

    return res.status(200).json({
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("Error in updateNoteController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
