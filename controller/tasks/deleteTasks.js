import * as taskService from "../../services/taskService.js";

/**
 * Controller para deletar uma task
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function deleteTaskController(req, res) {
  try {
    // Suportar formato antigo (body) e novo (params)
    const userId = req.body.id || req.user?.uid;
    const taskId = req.params.taskId || req.body.taskId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Chamar service para deletar task (com await!)
    await taskService.deleteTask(userId, taskId);

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTaskController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}