import { Request, Response } from 'express';

const login = (req: Request, res: Response) => {
  // console.log(req);

  return res.sendStatus(200);
};

export default login;
