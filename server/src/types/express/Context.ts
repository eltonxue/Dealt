import { Request, Response } from "express";
import { MailService } from "@sendgrid/mail";

import { User } from "../../entities";

interface ModifiedRequest extends Request {
  user: User;
}

interface Context {
  req: ModifiedRequest;
  res: Response;
}

export default Context;
