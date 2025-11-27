import * as dashboardService from "../../services/dashboardService.js";

/**
 * Controller para buscar o overview completo do dashboard
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getDashboardOverviewController(req, res) {
  try {
    const userId = req.query.userId || 
                req.headers['x-user-id'] || 
                req.user?.uid;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param: GET /dashboard?userId=YOUR_USER_ID"
      });
    }

    // Extrair opções opcionais
    const options = {};
    
    if (req.query.upcomingLimit) {
      const limit = parseInt(req.query.upcomingLimit);
      if (!isNaN(limit) && limit > 0) {
        options.upcomingLimit = limit;
      }
    }

    // Chamar service para buscar overview
    const overview = await dashboardService.getDashboardOverview(userId, options);

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error("Error in getDashboardOverviewController:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

/**
 * Controller para buscar apenas o resumo de tarefas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getTasksSummaryController(req, res) {
  try {
    const userId = req.query.userId || 
                req.headers['x-user-id'] || 
                req.user?.uid;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param: GET /dashboard/tasks-summary?userId=YOUR_USER_ID"
      });
    }

    // Chamar service para buscar resumo de tarefas
    const summary = await dashboardService.getTasksSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error in getTasksSummaryController:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

/**
 * Controller para buscar apenas próximas tarefas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getUpcomingTasksController(req, res) {
  try {
    const userId = req.query.userId || 
                req.headers['x-user-id'] || 
                req.user?.uid;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Send userId as query param: GET /dashboard/upcoming-tasks?userId=YOUR_USER_ID"
      });
    }

    // Extrair limit opcional
    let limit = 5; // padrão
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    // Chamar service para buscar próximas tarefas
    const tasks = await dashboardService.getUpcomingTasks(userId, limit);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Error in getUpcomingTasksController:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}
