import * as taskService from "../../services/taskService.js";
import { validateUpdateTaskPayload } from "../../utils/validation/taskValidation.js";

/**
 * Controller para atualizar uma task existente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function updateTaskController(req, res) {
  try {
    // Suportar formato antigo (body) e novo (params)
    const userId = req.body.id || req.user?.uid;
    const taskId = req.params.taskId || req.body.task?.id || req.body.taskId;
    const updates = req.body.task || req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Criar objeto de updates limpo (remover campos de controle)
    const { id, task, ...cleanUpdates } = updates;

    // Validar payload
    const validation = validateUpdateTaskPayload(cleanUpdates);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Chamar service para atualizar task
    await taskService.updateTask(userId, taskId, cleanUpdates);

    return res.status(200).json({
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error in updateTaskController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
