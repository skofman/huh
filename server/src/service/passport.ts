import crypto from "crypto";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pgql, { User } from "../pgql";

const validPassword = (password: string, hash: string, salt: string) => {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 24000, 64, "sha512").toString("hex");

  return hash === hashVerify;
};

export const generatePassword = (password: string) => {
  const hash = crypto.pbkdf2Sync(password, process.env.SALT, 24000, 64, "sha512").toString("hex");

  return hash;
};

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    const users = await pgql.select().from("users").where({ username });

    if (!users.length) {
      return cb(undefined, false);
    }

    const user = users[0];

    const isValid = validPassword(password, user.password, process.env.SALT);
    if (isValid) {
      return cb(undefined, user);
    }

    return cb(undefined, false);
  })
);

passport.serializeUser((user: User, cb) => {
  cb(undefined, user.id);
});

passport.deserializeUser(async (id, cb) => {
  console.log(id);
  const users = await pgql.select().from("users").where({ id });

  if (!users.length) {
    return cb(new Error("No user found"));
  }

  cb(undefined, users[0]);
});
