import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AuthError } from "../modules/auth/auth.service";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({
      message: error.message,
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Interner Serverfehler",
  });
}