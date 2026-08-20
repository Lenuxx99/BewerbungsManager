import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
    beforeEach,
} from "vitest";

let app: typeof import("../../../../app").app;
let prisma: typeof import("../../../../infrastructure/database/prisma").prisma;

import {
    startTestDatabase,
    stopTestDatabase,
} from "../../../../test/integration/setup";

import { userService } from "../../user.service";

describe("user Integration", () => {

    beforeAll(async () => {
        await startTestDatabase();

        const appModule = await import("../../../../app");
        app = appModule.app;

        const prismaModule = await import(
            "../../../../infrastructure/database/prisma"
        );
        prisma = prismaModule.prisma;
    }, 60_000);


    beforeEach(async () => {
        await prisma.applications.deleteMany();

        await prisma.user_credentials.deleteMany();
        await prisma.oauth_accounts.deleteMany();
        await prisma.users.deleteMany();
    });


    afterAll(async () => {
        await prisma.$disconnect();
        await stopTestDatabase();
    });


  describe("userService.getMe", () => {

    it("soll einen Benutzer aus der echten Datenbank laden", async () => {

      const createdUser =
        await prisma.users.create({
          data: {
            email: "test@example.com",
            first_name: "Max",
            last_name: "Mustermann",
          },
        });


      const result =
        await userService.getMe(
          createdUser.id
        );


      expect(result.id).toBe(
        createdUser.id
      );

      expect(result.email).toBe(
        "test@example.com"
      );

      expect(result.first_name).toBe(
        "Max"
      );

      expect(result.last_name).toBe(
        "Mustermann"
      );
    });


    it("soll einen Fehler werfen, wenn Benutzer nicht existiert", async () => {

      await expect(
        userService.getMe(999999)
      ).rejects.toThrow(
        "Benutzer nicht gefunden"
      );
    });

  });

});