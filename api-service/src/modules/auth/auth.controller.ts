import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { authService } from "./auth.service";
import type {
  LoginInput,
  RegisterInput,
} from "./auth.schema";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 1000,
};

export async function register(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.register(req.body);
    console.log(result.user);
    
    res.cookie(
      "access_token",
      result.accessToken,
      cookieOptions
    );

    return res.status(201).json({
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.login(req.body);

    res.cookie(
      "access_token",
      result.accessToken,
      cookieOptions
    );

    return res.status(200).json({
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Erfolgreich ausgeloggt.",
    });
  } catch (error) {
    next(error);
  }
}