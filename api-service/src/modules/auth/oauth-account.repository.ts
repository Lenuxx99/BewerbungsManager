import type {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { prisma } from "../../infrastructure/database/prisma";

type DatabaseClient =
  | PrismaClient
  | Prisma.TransactionClient;

type CreateOAuthAccountData = {
  userId: number;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
};

export const oauthAccountRepository = {
  findByProviderAccount(
    provider: string,
    providerAccountId: string,
    db: DatabaseClient = prisma
  ) {
    return db.oauth_accounts.findUnique({
      where: {
        provider_provider_account_id: {
          provider,
          provider_account_id:
            providerAccountId,
        },
      },
      include: {
        users: true,
      },
    });
  },

  findByUserAndProvider(
    userId: number,
    provider: string,
    db: DatabaseClient = prisma
  ) {
    return db.oauth_accounts.findUnique({
      where: {
        user_id_provider: {
          user_id: userId,
          provider,
        },
      },
    });
  },

  create(
    data: CreateOAuthAccountData,
    db: DatabaseClient = prisma
  ) {
    return db.oauth_accounts.create({
      data: {
        user_id: data.userId,
        provider: data.provider,
        provider_account_id:
          data.providerAccountId,
        access_token:
          data.accessToken ?? null,
        refresh_token:
          data.refreshToken ?? null,
        token_expires_at:
          data.tokenExpiresAt ?? null,
      },
    });
  },
};