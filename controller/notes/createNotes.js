import * as noteService from "../../services/noteService.js";
import { validateCreateNotePayload } from "../../utils/validation/noteValidation.js";

/**
 * Controller para criar uma nova anotação
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function createNoteController(req, res) {
  try {
    const { id, note } = req.body;

    // TODO: Futuramente usar req.user.uid de um middleware de autenticação
    const userId = id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!note) {
      return res.status(400).json({ error: "Note data is required" });
    }

    // Validar payload
    const validation = validateCreateNotePayload(note);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Chamar service para criar note
    const createdNote = await noteService.createNote(userId, note);

    return res.status(201).json({
      message: "Note created successfully",
      note: createdNote,
    });
  } catch (error) {
    console.error("Error in createNoteController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
