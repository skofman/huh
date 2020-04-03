import { signUp, login, logout, user } from "./auth";
import { Application } from "express";
import passport from "passport";

const router = (app: Application) => {
  app.post("/api/signup", signUp);
  app.post("/api/login", passport.authenticate("local"), login);
  app.get("/api/logout", logout);
  app.get("/api/user", user);
};

export default router;
