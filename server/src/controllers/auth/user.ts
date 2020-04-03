import { Request, Response } from "express";
import pgql from "../../pgql";
import convertToCamelCase from "../../utils/convertToCamelCase";

const user = async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const users = await pgql
    .select("id", "username", "location", "first_name", "last_name", "balance", "avatar", "deck")
    .from("users")
    // @ts-ignore
    .where({ id: req.user.id });

  if (!users.length) {
    return res.status(400).send();
  }

  res.status(200).send({ user: convertToCamelCase(users[0]) });
};

export default user;
