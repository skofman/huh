import { Request, Response } from 'express';

const logout = (req: Request, res: Response) => {
  // console.log(req);

  req.logout();
  return res.redirect('/');
};

export default logout;
