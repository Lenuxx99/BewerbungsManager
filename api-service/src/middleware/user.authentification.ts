import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  sub: string | number;
}


export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.access_token;

  if (!token) {
    console.log("unvalid token");
    return res.status(401).json({
      message: "Nicht authentifiziert",
    });

  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        message: "Ungültiger Token",
      });
    }

    req.userId = userId;

    console.log("authenticate:", req.method, req.originalUrl);
    console.log("userId:", req.userId);
    next();
  } catch {
    return res.status(401).json({
      message: "Ungültiger Token",
    });
  }
}