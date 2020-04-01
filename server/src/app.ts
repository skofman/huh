import express from 'express';
import router from './router';
import './service/passport';
import passport from 'passport';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';

const app = express();

app.use(bodyParser.json());
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SECRET],
    maxAge: 1000 * 30
  })
);

app.use(passport.initialize());
app.use(passport.session());

router(app);

export default app;
