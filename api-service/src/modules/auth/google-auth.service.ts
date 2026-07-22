import {
  OAuth2Client,
  type TokenPayload,
} from "google-auth-library";

import type {
  PrismaClient,
  users,
} from "@prisma/client";


import { prisma } from "../../infrastructure/database/prisma";
import { authRepository } from "./auth.repository";
import { oauthAccountRepository } from "./oauth-account.repository";
import { createAccessToken } from "./jwt.utils";

const GOOGLE_PROVIDER = "google";

type AuthRepository = typeof authRepository;

type OAuthAccountRepository =
  typeof oauthAccountRepository;

interface GoogleProfile {
  providerAccountId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

type GoogleLoginResult = {
  user: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    status: string;
  };
  accessToken: string;
};



export class GoogleAuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);

    this.name = "GoogleAuthError";

    Object.setPrototypeOf(
      this,
      GoogleAuthError.prototype
    );
  }
}

export class GoogleAuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly userRepository:
      AuthRepository = authRepository,
    private readonly oauthRepository:
      OAuthAccountRepository =
        oauthAccountRepository
  ) {
    const googleClientId =
      process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new Error(
        "GOOGLE_CLIENT_ID ist nicht konfiguriert."
      );
    }

    this.googleClientId = googleClientId;
    this.googleClient =
      new OAuth2Client(googleClientId);
  }

  async loginWithGoogle(
    credential: string
  ): Promise<GoogleLoginResult> {
    if (
      typeof credential !== "string" ||
      credential.trim().length === 0
    ) {
      throw new GoogleAuthError(
        "Google-Credential fehlt.",
        400
      );
    }

    const payload =
      await this.verifyGoogleCredential(
        credential
      );

    const providerAccountId =
      payload.sub;

    const email =
      payload.email
        ?.trim()
        .toLowerCase();

    if (
      !providerAccountId ||
      !email ||
      payload.email_verified !== true
    ) {
      throw new GoogleAuthError(
        "Das Google-Konto konnte nicht verifiziert werden.",
        401
      );
    }

    const user =
      await this.findOrCreateGoogleUser({
        providerAccountId,
        email,
        firstName:
          payload.given_name ?? null,
        lastName:
          payload.family_name ?? null,
      });

    if (user.status !== "active") {
      throw new GoogleAuthError(
        "Dieses Benutzerkonto ist nicht aktiv.",
        403
      );
    }

    const accessToken =
      createAccessToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status,
      },
      accessToken,
    };
  }

  private async verifyGoogleCredential(
    credential: string
  ): Promise<TokenPayload> {
    try {
      const ticket =
        await this.googleClient
          .verifyIdToken({
            idToken: credential,
            audience:
              this.googleClientId,
          });

      const payload =
        ticket.getPayload();

      if (!payload) {
        throw new GoogleAuthError(
          "Ungültiges Google-Token.",
          401
        );
      }

      return payload;
    } catch (error) {
      if (
        error instanceof
        GoogleAuthError
      ) {
        throw error;
      }

      console.error(
        "Google-ID-Token konnte nicht verifiziert werden:",
        error
      );

      throw new GoogleAuthError(
        "Ungültiges oder abgelaufenes Google-Token.",
        401
      );
    }
  }

  private async findOrCreateGoogleUser(
    profile: GoogleProfile
  ): Promise<users> {
    return this.prisma.$transaction(
      async (tx) => {
        const existingOAuthAccount =
          await this.oauthRepository
            .findByProviderAccount(
              GOOGLE_PROVIDER,
              profile.providerAccountId,
              tx
            );

        if (existingOAuthAccount) {
          return existingOAuthAccount.users;
        }

        let user =
          await this.userRepository
            .findUserByEmail(
              profile.email,
              tx
            );

        if (!user) {
          user =
            await this.userRepository
              .createOAuthUser(
                {
                  email:
                    profile.email,
                  firstName:
                    profile.firstName,
                  lastName:
                    profile.lastName,
                },
                tx
              );
        }

        const existingProviderAccount =
          await this.oauthRepository
            .findByUserAndProvider(
              user.id,
              GOOGLE_PROVIDER,
              tx
            );

        if (existingProviderAccount) {
          throw new GoogleAuthError(
            "Mit diesem Benutzer ist bereits ein anderes Google-Konto verknüpft.",
            409
          );
        }

        await this.oauthRepository.create(
          {
            userId: user.id,
            provider:
              GOOGLE_PROVIDER,
            providerAccountId:
              profile.providerAccountId,
          },
          tx
        );

        return user;
      }
    );
  }
}

export const googleAuthService =
  new GoogleAuthService(prisma);