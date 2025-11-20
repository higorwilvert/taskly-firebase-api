import * as taskService from "../../services/taskService.js";
import { validateCreateTaskPayload } from "../../utils/validation/taskValidation.js";

/**
 * Controller para criar uma nova task
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function createTaskController(req, res) {
  try {
    const { id, task } = req.body;

    // TODO: Futuramente usar req.user.uid de um middleware de autenticação
    const userId = id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!task) {
      return res.status(400).json({ error: "Task data is required" });
    }

    // Validar payload
    const validation = validateCreateTaskPayload(task);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Chamar service para criar task
    const createdTask = await taskService.createTask(userId, task);

    return res.status(201).json({
      message: "Task created successfully",
      task: createdTask,
    });
  } catch (error) {
    console.error("Error in createTaskController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
