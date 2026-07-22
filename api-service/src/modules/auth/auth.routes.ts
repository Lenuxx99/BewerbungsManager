import { Router } from "express";

import { validate } from "@/middleware/validate.middleware";
import { login, register, loginWithGoogle, logout } from "./auth.controller";
import {
  loginSchema,
  registerSchema,
  googleLoginSchema,
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

authRouter.post(
  "/google",
  validate(googleLoginSchema),
  loginWithGoogle
);

authRouter.post("/logout", logout);