import type {
  Prisma,
  PrismaClient,
} from "@prisma/client";

import { prisma } from "../../infrastructure/database/prisma";

type DatabaseClient =
  | PrismaClient
  | Prisma.TransactionClient;

type CreateUserData = {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
};

type CreateOAuthUserData = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export const authRepository = {
  findUserByEmail(
    email: string,
    db: DatabaseClient = prisma
  ) {
    return db.users.findUnique({
      where: {
        email,
      },
      include: {
        user_credentials: true,
        oauth_accounts: true,
      },
    });
  },

  findUserById(
    id: number,
    db: DatabaseClient = prisma
  ) {
    return db.users.findUnique({
      where: {
        id,
      },
      include: {
        user_credentials: true,
        oauth_accounts: true,
      },
    });
  },

  createUser(
    data: CreateUserData,
    db: DatabaseClient = prisma
  ) {
    return db.users.create({
      data: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,

        user_credentials: {
          create: {
            password_hash: data.passwordHash,
          },
        },
      },
      include: {
        user_credentials: true,
        oauth_accounts: true,
      },
    });
  },

  createOAuthUser(
    data: CreateOAuthUserData,
    db: DatabaseClient = prisma
  ) {
    return db.users.create({
      data: {
        email: data.email,
        first_name: data.firstName ?? null,
        last_name: data.lastName ?? null,
      },
      include: {
        user_credentials: true,
        oauth_accounts: true,
      },
    });
  },
};