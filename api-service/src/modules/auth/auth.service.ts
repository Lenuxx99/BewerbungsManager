import argon2 from "argon2";
import jwt from "jsonwebtoken";

import { authRepository } from "./auth.repository";
import type { LoginInput, RegisterInput } from "./auth.schema.ts";
import { createAccessToken } from "./jwt.utils";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}


export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findUserByEmail(
      input.email
    );

    if (existingUser) {
      throw new AuthError(
        "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
        409
      );
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await authRepository.createUser({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const accessToken = createAccessToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken,
    };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(
      input.email.toLowerCase()
    );

    if (!user || !user.user_credentials) {
      throw new AuthError(
        "E-Mail-Adresse oder Passwort ist falsch",
        401
      );
    }

    const passwordIsValid = await argon2.verify(
      user.user_credentials.password_hash,
      input.password
    );

    if (!passwordIsValid) {
      throw new AuthError(
        "E-Mail-Adresse oder Passwort ist falsch",
        401
      );
    }

    const accessToken = createAccessToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken,
    };
  },
};