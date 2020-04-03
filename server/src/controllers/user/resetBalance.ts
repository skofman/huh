import { Request, Response } from "express";
import logger from "../../logger";
import pgql from "../../pgql";
import convertToCamelCase from "../../utils/convertToCamelCase";

export default async (req: Request, res: Response) => {
  const users = await pgql("users")
    // @ts-ignore
    .where({ id: req.user.id })
    .andWhere("balance", "<", 500)
    .update({ balance: 500 }, ["id", "username", "location", "first_name", "last_name", "balance", "avatar", "deck"]);

  if (!users.length) {
    return res.sendStatus(404);
  }

  res.status(200).send({ user: convertToCamelCase(users[0]) });
};
