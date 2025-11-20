// Auth controllers
import { handleLogin } from "../controller/auth/login.js";
import { handleLogout } from "../controller/auth/logout.js";
import { handleSignup } from "../controller/auth/singup.js";
import { handleVerifyAuthentication } from "../controller/auth/verifyAuthentication.js";

// Subject controllers (novos e retrocompatíveis)
import {
  createSubjectController
} from "../controller/subjects/createSubjects.js";
import {
  deleteSubjectController
} from "../controller/subjects/deleteSubjects.js";
import {
  getSubjectsController
} from "../controller/subjects/getSubjects.js";
import {
  updateSubjectController
} from "../controller/subjects/updateSubject.js";

// Task controllers (novos e retrocompatíveis)
import {
  createTaskController
} from "../controller/tasks/createTasks.js";
import {
  deleteTaskController
} from "../controller/tasks/deleteTasks.js";
import {
  getTaskByIdController,
  getTasksController
} from "../controller/tasks/getTasks.js";
import {
  updateTaskController
} from "../controller/tasks/updateTask.js";

export const routes = (app) => {
  // ========================================
  // ROTAS DE AUTENTICAÇÃO
  // ========================================
  app.post("/verifyAuthentication", handleVerifyAuthentication);
  app.post("/login", handleLogin);
  app.post("/signup", handleSignup);
  app.post("/logout", handleLogout);

  // ========================================
  // ROTAS DE MATÉRIAS (SUBJECTS) - PADRÃO REST
  // ========================================
  app.get("/subjects", getSubjectsController);           // Buscar todas as matérias (userId via query: ?userId=xxx)
  app.post("/subjects", createSubjectController);        // Criar nova matéria
  app.patch("/subjects/:subjectId", updateSubjectController); // Atualizar matéria
  app.delete("/subjects/:subjectId", deleteSubjectController); // Deletar matéria

  // ========================================
  // ROTAS DE TAREFAS (TASKS) - PADRÃO REST
  // ========================================
  app.get("/tasks", getTasksController);                 // Buscar todas as tasks
  app.get("/tasks/:taskId", getTaskByIdController);      // Buscar uma task específica
  app.post("/tasks", createTaskController);              // Criar nova task
  app.patch("/tasks/:taskId", updateTaskController);     // Atualizar task
  app.delete("/tasks/:taskId", deleteTaskController);    // Deletar task
};
