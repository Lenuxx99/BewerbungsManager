import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { Prisma } from "@prisma/client";
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

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    res.status(404).json({
      message: "Der Datensatz wurde nicht gefunden.",
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Interner Serverfehler",
  });
}