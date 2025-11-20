import * as taskService from "../../services/taskService.js";

/**
 * Controller para buscar todas as tasks de um usuário
 * Suporta filtros via query params ou body
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getTasksController(req, res) {
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
    // Extrair filtros opcionais
    const filters = {};
    
    // Filtros do body (POST legado) ou query params (GET REST)
    const filterSource = (req.body && req.body.filters) || req.query;

    if (filterSource.subjectId) {
      filters.subjectId = filterSource.subjectId;
    }

    if (filterSource.status) {
      filters.status = filterSource.status;
    }

    if (filterSource.type) {
      filters.type = filterSource.type;
    }

    if (filterSource.isOverdue !== undefined) {
      filters.isOverdue = filterSource.isOverdue === "true" || filterSource.isOverdue === true;
    }

    if (filterSource.dueOnStart) {
      filters.dueOnStart = parseInt(filterSource.dueOnStart);
    }

    if (filterSource.dueOnEnd) {
      filters.dueOnEnd = parseInt(filterSource.dueOnEnd);
    }

    // Chamar service para buscar tasks
    const tasks = await taskService.getTasks(userId, filters);

    return res.status(200).json({
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Error in getTasksController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Controller para buscar uma task específica por ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getTaskByIdController(req, res) {
  try {
    const userId = req.body.id || req.user?.uid;
    const taskId = req.params.taskId || req.body.taskId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Chamar service para buscar task
    const task = await taskService.getTaskById(userId, taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({
      task: task,
    });
  } catch (error) {
    console.error("Error in getTaskByIdController:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
