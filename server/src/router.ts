import { signUp, login, logout } from './auth';
import { Application } from 'express';
import passport from 'passport';

const router = (app: Application) => {
  app.post('/api/signup', signUp);
  app.post('/api/login', passport.authenticate('local'), login);
  app.post('/api/logout', logout);
};

export default router;
