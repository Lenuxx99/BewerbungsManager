import { prisma } from "../../infrastructure/database/prisma";

import type {
  Prisma,
  PrismaClient
} from "@prisma/client";

type ApplicationStatus =
  | "OFFEN"
  | "INTERVIEW"
  | "ZUGESAGT"
  | "ABGESAGT";
  
type DatabaseClient =
  | PrismaClient
  | Prisma.TransactionClient;

type CreateAppData = {
  userId: number;
  firma: string;
  stelle: string;
  datum: Date;
  status?: ApplicationStatus;
  notizen?: string;
};

const appRepository = {
  async createApplication(
    appData: CreateAppData,
    db: DatabaseClient = prisma
  ) {
    return db.applications.create({
      data: {
        user_id: appData.userId,
        firma: appData.firma,
        stelle: appData.stelle,
        datum: appData.datum,
        status: appData.status ?? "OFFEN",
        notizen: appData.notizen,
      },
    });
  },

  async findAppsByUserId(
    userId: number,
    db: DatabaseClient = prisma
  ) {
    return db.applications.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        datum: "desc",
      },
    });
  },

  async findAppById(
    id: number,
    db: DatabaseClient = prisma
  ) {
    return db.applications.findUnique({
      where: {
        id,
      },
    });
  },

  async updateStatus(
    id: number,
    status: ApplicationStatus,
    db: DatabaseClient = prisma
  ) {
    return db.applications.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  },

  async deleteApplication(
    id: number,
    db: DatabaseClient = prisma
  ) {
    return db.applications.delete({
      where: {
        id,
      },
    });
  },
};

export default appRepository;