import { Router } from "express";

import { authenticate } from "@/middleware/user.authentification";
import { getUser } from "./user.controller";


export const userRouter = Router();

userRouter.get(
  "/me",
  authenticate,
  getUser
);
