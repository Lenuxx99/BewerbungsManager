import jwt from "jsonwebtoken";

export function createAccessToken(userId: number): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET ist nicht definiert");
  }

  return jwt.sign(
    {
      sub: userId,
    },
    secret,
    {
      expiresIn: "1h",
    }
  );
}