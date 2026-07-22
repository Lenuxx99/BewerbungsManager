import { Router } from "express";

import { gmailController } from "./gmail.controller";
import { authenticate } from "../../middleware/user.authentification";

export const gmailRouter = Router();



gmailRouter.get(
    "/connect",
    authenticate,
    gmailController.connect
);

gmailRouter.get(
  "/callback",
  gmailController.callback,
);

gmailRouter.get(
  "/status",
  authenticate,
  gmailController.getStatus,
);