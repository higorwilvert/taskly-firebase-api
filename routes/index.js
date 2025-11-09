import { handleSignup } from "../controller/auth/singup.js";
import { handleLogout } from "../controller/auth/logout.js";
import { handleLogin } from "../controller/auth/login.js";
import { getSubjects } from "../controller/subjects/getSubjects.js";
import { handleVerifyAuthentication } from "../controller/auth/verifyAuthentication.js";
import { createSubjects } from "../controller/subjects/createSubjects.js";

export const routes = (app) => {
  app.get("/subjects/getSubjects", getSubjects);

  app.post("/subjects/createSubjects", createSubjects);
  app.post("/verifyAuthentication", handleVerifyAuthentication);
  app.post("/login", handleLogin);
  app.post("/signup", handleSignup);
  app.post("/logout", handleLogout);
};
