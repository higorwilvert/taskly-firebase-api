import * as subjectService from "../../services/subjectService.js";
import { validateCreateSubjectPayload } from "../../utils/validation/subjectValidation.js";

/**
 * Controller para criar uma nova matéria
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function createSubjectController(req, res) {
  try {
    const { id, subject } = req.body;

    // TODO: Futuramente usar req.user.uid de um middleware de autenticação
    const userId = id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!subject) {
      return res.status(400).json({ error: "Subject data is required" });
    }

    // Validar payload
    const validation = validateCreateSubjectPayload(subject);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validation.errors 
      });
    }

    // Chamar service para criar matéria
    const createdSubject = await subjectService.createSubject(userId, subject);

    return res.status(201).json({
      message: "Subject created successfully",
      subject: createdSubject,
    });
  } catch (error) {
    console.error("Error in createSubjectController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
