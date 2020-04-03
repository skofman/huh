import { Request, Response, NextFunction } from "express";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    req.logout();
    return res.redirect("/");
  }

  next();
};

export default requireAuth;
