import request from "supertest";

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


describe("Application API Integration", () => {

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


  describe("GET /api/user/me", () => {

    it("soll 401 zurückgeben, wenn kein Benutzer authentifiziert ist", async () => {
      const response = await request(app)
        .get("/api/user/me");


      expect(response.status).toBe(401);


      expect(response.body).toEqual({
        message: "Nicht authentifiziert",
      });
    });


    it("soll einen authentifizierten Benutzer zurückgeben", async () => {
      /*
        request.agent merkt sich Cookies zwischen Requests.

        Das ist wichtig, weil register() das JWT
        als httpOnly Cookie setzt.
      */
      const agent = request.agent(app);


      /*
        Benutzer registrieren.

        Erwarteter Ablauf:
        POST /api/auth/register
          ↓
        Auth Controller
          ↓
        Auth Service
          ↓
        Repository
          ↓
        PostgreSQL Test DB
          ↓
        access_token Cookie wird gesetzt
      */
      const registerResponse = await agent
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "secret123",
          firstName: "Max",
          lastName: "Mustermann",
        });


      expect(registerResponse.status).toBe(201);


      expect(registerResponse.body).toEqual({
        user: {
          id: expect.any(Number),
          email: "test@example.com",
          firstName: "Max",
          lastName: "Mustermann",
        },
      });


      /*
        Jetzt schickt der Agent das Cookie automatisch mit.
      */
      const response = await agent
        .get("/api/user/me");


      expect(response.status).toBe(200);


      expect(response.body.user).toEqual({
        id: expect.any(Number),
        email: "test@example.com",
        first_name: "Max",
        last_name: "Mustermann",
        created_at: expect.any(String),
      });
    });


    it("soll nach dem Logout nicht mehr authentifiziert sein", async () => {
      const agent = request.agent(app);


      await agent
        .post("/api/auth/register")
        .send({
          email: "logout@example.com",
          password: "secret123",
          firstName: "Max",
          lastName: "Mustermann",
        })
        .expect(201);


      /*
        Vor Logout muss User erreichbar sein.
      */
      const beforeLogout = await agent
        .get("/api/user/me");


      expect(beforeLogout.status).toBe(200);


      /*
        Cookie löschen.
      */
      const logoutResponse = await agent
        .post("/api/auth/logout");


      expect(logoutResponse.status).toBe(200);


      expect(logoutResponse.body).toEqual({
        message: "Erfolgreich ausgeloggt.",
      });


      /*
        Danach sollte /me nicht mehr funktionieren.
      */
      const afterLogout = await agent
        .get("/api/user/me");


      expect(afterLogout.status).toBe(401);


      expect(afterLogout.body).toEqual({
        message: "Nicht authentifiziert",
      });
    });

  });
});