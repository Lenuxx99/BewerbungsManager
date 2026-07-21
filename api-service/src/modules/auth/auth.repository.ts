import { prisma } from "../../infrastructure/database/prisma";

type CreateUserData = {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
};

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: {
        email,
      },
      include: {
        user_credentials: true,
        // oauth_accounts: true,
      },
    });
  },

  findUserById(id: number) {
    return prisma.users.findUnique({
      where: {
        id,
      },
      include: {
        user_credentials: true,
        oauth_accounts: true,
      },
    });
  },

  createUser(data: CreateUserData) {
    return prisma.users.create({
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
      },
    });
  },
};