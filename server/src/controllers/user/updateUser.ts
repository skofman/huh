import { Request, Response } from "express";
import pgql from "../../pgql";
import { snakeCase } from "change-case";
import convertToCamelCase from "../../utils/convertToCamelCase";

interface IUpdate {
  field: string;
  value: string | number;
}

const allowedFields = ["location", "first_name", "last_name", "avatar", "deck"];

export default async (req: Request, res: Response) => {
  const { updates } = req.body;

  const payload = {};
  updates
    .filter((item: IUpdate) => allowedFields.includes(item.field))
    .forEach(({ field, value }: IUpdate) => {
      // @ts-ignore
      payload[snakeCase(field)] = value;
    });

  const users = await pgql("users")
    // @ts-ignore
    .where({ id: req.user.id })
    .update(payload, ["id", "username", "location", "first_name", "last_name", "balance", "avatar", "deck"]);

  res.status(200).send({ user: convertToCamelCase(users[0]) });
};
