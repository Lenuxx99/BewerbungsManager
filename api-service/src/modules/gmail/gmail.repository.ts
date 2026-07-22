import type {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { prisma } from "../../infrastructure/database/prisma";

type DatabaseClient =
  | PrismaClient
  | Prisma.TransactionClient;

const GMAIL_PROVIDER = "google";

export const gmailRepository = {
  async createOAuthState(
    data: {
      state: string;
      userId: number;
      expiresAt: Date;
    },
    db: DatabaseClient = prisma,
  ) {
    return db.oauth_states.create({
      data: {
        state: data.state,
        user_id: data.userId,
        expires_at: data.expiresAt,
      },
    });
  },

  async findValidOAuthState(
    state: string,
    db: DatabaseClient = prisma,
  ) {
    return db.oauth_states.findFirst({
      where: {
        state,
        expires_at: {
          gt: new Date(),
        },
      },
    });
  },

  async deleteOAuthState(
    state: string,
    db: DatabaseClient = prisma,
  ) {
    return db.oauth_states.deleteMany({
      where: {
        state,
      },
    });
  },

  async deleteExpiredOAuthStates(
    db: DatabaseClient = prisma,
  ) {
    return db.oauth_states.deleteMany({
      where: {
        expires_at: {
          lte: new Date(),
        },
      },
    });
  },

  async findConnectionByUserId(
    userId: number,
    db: DatabaseClient = prisma,
  ) {
    return db.oauth_accounts.findUnique({
      where: {
        user_id_provider: {
          user_id: userId,
          provider: GMAIL_PROVIDER,
        },
      },
    });
  },

  async upsertConnection(
    data: {
      userId: number;
      providerAccountId: string;
      accessToken?: string | null;
      refreshToken?: string | null;
      tokenExpiresAt?: Date | null;
    },
    db: DatabaseClient = prisma,
  ) {
    const existingConnection =
      await db.oauth_accounts.findUnique({
        where: {
          user_id_provider: {
            user_id: data.userId,
            provider: GMAIL_PROVIDER,
          },
        },
      });

    return db.oauth_accounts.upsert({
      where: {
        user_id_provider: {
          user_id: data.userId,
          provider: GMAIL_PROVIDER,
        },
      },

      create: {
        user_id: data.userId,
        provider: GMAIL_PROVIDER,
        provider_account_id: data.providerAccountId,
        access_token: data.accessToken ?? null,
        refresh_token: data.refreshToken ?? null,
        token_expires_at: data.tokenExpiresAt ?? null,
      },

      update: {
        provider_account_id:
          data.providerAccountId,

        access_token:
          data.accessToken ??
          existingConnection?.access_token ??
          null,

        refresh_token:
          data.refreshToken ??
          existingConnection?.refresh_token ??
          null,

        token_expires_at:
          data.tokenExpiresAt ??
          existingConnection?.token_expires_at ??
          null,

        updated_at: new Date(),
      },
    });
  },
  async findGmailConnectionByUserId(
    userId: number,
    db: DatabaseClient = prisma,
  ) {
    return db.oauth_accounts.findUnique({
      where: {
        user_id_provider: {
          user_id: userId,
          provider: "google",
        },
      },
      select: {
        id: true,
        access_token: true,
        refresh_token: true,
        token_expires_at: true,
      },
    });
  }
};