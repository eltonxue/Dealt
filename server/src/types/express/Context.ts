import { Request, Response } from "express";
import { User } from "../../entities";

interface RequestWithUser extends Request {
  user?: User;
}

interface Context {
  req: RequestWithUser;
  res: Response;
}

export default Context;
