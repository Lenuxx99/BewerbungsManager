import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { authService } from "./auth.service";
import { googleAuthService } from "./google-auth.service";

import type {
  GoogleLoginInput,
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
    const result = await authService.register(
      req.body
    );

    res.cookie(
      "access_token",
      result.accessToken,
      cookieOptions
    );

    return res.status(201).json({
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.login(
      req.body
    );

    res.cookie(
      "access_token",
      result.accessToken,
      cookieOptions
    );

    return res.status(200).json({
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function loginWithGoogle(
  req: Request<{}, {}, GoogleLoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await googleAuthService.loginWithGoogle(
        req.body.credential
      );

    res.cookie(
      "access_token",
      result.accessToken,
      cookieOptions
    );

    return res.status(200).json({
      user: result,
    });
  } catch (error) {
    return next(error);
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
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Erfolgreich ausgeloggt.",
    });
  } catch (error) {
    return next(error);
  }
}