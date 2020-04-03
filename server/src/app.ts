import express from "express";
import router from "./router";
import "./service/passport";
import passport from "passport";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
import cors from "cors";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRET],
    maxAge: 1000 * 60 * 60 * 24 * 7
  })
);

app.use(passport.initialize());
app.use(passport.session());

router(app);

export default app;
