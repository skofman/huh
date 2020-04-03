import { signUp, login, logout, user, requireAuth } from "./controllers/auth";
import { Application } from "express";
import passport from "passport";
import { resetBalance, updateUser } from "./controllers/user";

const router = (app: Application) => {
  app.post("/api/signup", signUp);
  app.post("/api/login", passport.authenticate("local"), login);
  app.get("/api/logout", logout);
  app.get("/api/user", user);

  app.patch("/api/updateUser", requireAuth, updateUser);
  app.get("/api/resetBalance", requireAuth, resetBalance);
};

export default router;
