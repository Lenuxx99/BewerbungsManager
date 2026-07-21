import { Router } from "express";

import { validate } from "@/middleware/validate.middleware";
import { login, register, logout } from "./auth.controller";
import {
  loginSchema,
  registerSchema,
} from "./auth.schema";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  register
);

authRouter.post(
  "/login",
  validate(loginSchema),
  login
);


authRouter.post("/logout", logout);