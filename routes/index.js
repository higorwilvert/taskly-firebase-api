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

// Note controllers (novos e retrocompatíveis)
import {
  createNoteController
} from "../controller/notes/createNotes.js";
import {
  deleteNoteController
} from "../controller/notes/deleteNotes.js";
import {
  getNoteByIdController,
  getNotesController
} from "../controller/notes/getNotes.js";
import {
  updateNoteController
} from "../controller/notes/updateNote.js";

// Attendance controllers
import {
  deleteAttendanceController
} from "../controller/attendance/deleteAttendance.js";
import {
  getAttendanceByDateController,
  getAttendanceController,
  getAttendanceStatsController
} from "../controller/attendance/getAttendance.js";
import {
  upsertAttendanceController
} from "../controller/attendance/upsertAttendance.js";

// Dashboard controllers
import {
  getDashboardOverviewController,
  getTasksSummaryController,
  getUpcomingTasksController
} from "../controller/dashboard/getDashboard.js";

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

  // ========================================
  // ROTAS DE ANOTAÇÕES (NOTES) - PADRÃO REST
  // ========================================
  app.get("/notes", getNotesController);                 // Buscar todas as anotações
  app.get("/notes/:noteId", getNoteByIdController);      // Buscar uma anotação específica
  app.post("/notes", createNoteController);              // Criar nova anotação
  app.patch("/notes/:noteId", updateNoteController);     // Atualizar anotação
  app.delete("/notes/:noteId", deleteNoteController);    // Deletar anotação

  // ========================================
  // ROTAS DE PRESENÇA/FALTAS (ATTENDANCE) - PADRÃO REST
  // ========================================
  // Buscar todas as presenças de uma matéria (com filtros opcionais)
  app.get("/subjects/:subjectId/attendance", getAttendanceController);
  
  // Buscar registro de presença de uma data específica
  app.get("/subjects/:subjectId/attendance/:date", getAttendanceByDateController);
  
  // Buscar estatísticas de presença de uma matéria
  app.get("/subjects/:subjectId/attendance-stats", getAttendanceStatsController);
  
  // Criar ou atualizar registro de presença (upsert baseado na data)
  app.post("/subjects/:subjectId/attendance", upsertAttendanceController);
  
  // Deletar registro de presença
  app.delete("/subjects/:subjectId/attendance/:date", deleteAttendanceController);

  // ========================================
  // ROTAS DE DASHBOARD - PADRÃO REST
  // ========================================
  // Buscar overview completo do dashboard (tasks + subjects + attendance)
  app.get("/dashboard", getDashboardOverviewController);
  
  // Buscar apenas resumo de tarefas
  app.get("/dashboard/tasks-summary", getTasksSummaryController);
  
  // Buscar apenas próximas tarefas
  app.get("/dashboard/upcoming-tasks", getUpcomingTasksController);
};
