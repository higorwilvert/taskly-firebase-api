import * as noteService from "../../services/noteService.js";

/**
 * Controller para buscar todas as anotações de um usuário
 * Suporta filtros via query params ou body
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getNotesController(req, res) {
  try {
    const userId = req.query.userId || 
                req.headers['x-user-id'] || 
                req.user?.uid;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param: GET /notes?userId=YOUR_USER_ID"
      });
    }

    // Extrair filtros opcionais
    const filters = {};
    
    // Filtros do body (POST legado) ou query params (GET REST)
    const filterSource = (req.body && req.body.filters) || req.query;

    if (filterSource.subjectId) {
      filters.subjectId = filterSource.subjectId;
    }

    if (filterSource.pinned !== undefined) {
      filters.pinned = filterSource.pinned === "true" || filterSource.pinned === true;
    }

    if (filterSource.search) {
      filters.search = filterSource.search;
    }

    // Chamar service para buscar notes
    const notes = await noteService.getNotes(userId, filters);

    return res.status(200).json({
      notes: notes,
      count: notes.length,
    });
  } catch (error) {
    console.error("Error in getNotesController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller para buscar uma anotação específica por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getNoteByIdController(req, res) {
  try {
    const userId = req.body.id || req.user?.uid;
    const noteId = req.params.noteId || req.body.noteId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!noteId) {
      return res.status(400).json({ error: "Note ID is required" });
    }

    // Chamar service para buscar note
    const note = await noteService.getNoteById(userId, noteId);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(200).json({
      note: note,
    });
  } catch (error) {
    console.error("Error in getNoteByIdController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
