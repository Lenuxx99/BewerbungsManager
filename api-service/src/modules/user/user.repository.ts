import { prisma } from "../../infrastructure/database/prisma";

export const userRepository = {
  findUserById(id: number) {
    return prisma.users.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
      },
    });
  }
};