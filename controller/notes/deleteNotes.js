import * as noteService from "../../services/noteService.js";

/**
 * Controller para deletar uma anotação
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function deleteNoteController(req, res) {
  try {
    // Suportar formato antigo (body) e novo (params)
    const userId = req.body.id || req.user?.uid;
    const noteId = req.params.noteId || req.body.noteId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!noteId) {
      return res.status(400).json({ error: "Note ID is required" });
    }

    // Chamar service para deletar note (com await!)
    await noteService.deleteNote(userId, noteId);

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteNoteController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
