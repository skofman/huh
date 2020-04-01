import { Request, Response } from 'express';
import pgql from '../pgql';
import logger from '../logger';
import { v4 as uuidv4 } from 'uuid';
import { generatePassword } from '../service/passport';

const signUp = async (req: Request, res: Response) => {
  logger.info({ label: 'AUTH' });
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).send({ error: 'Bad info' });
  }

  const users = await pgql.select().from('users').where({ username });
  if (users.length) {
    return res.status(400).send({ error: 'Username exists' });
  }

  await pgql('users')
    .insert({
      id: uuidv4(),
      username,
      password: generatePassword(password),
      balance: 500
    })
    .returning(['id']);

  return res.sendStatus(200);
};

export default signUp;
