import request from "supertest";

import {
    describe,
    it,
    expect,
    beforeAll,
    afterAll,
    beforeEach,
} from "vitest";

import { app } from "../../../../app";

import { prisma } from "../../../../infrastructure/database/prisma";

import {
    startTestDatabase,
    stopTestDatabase,
} from "../../../../test/integration/setup";


describe("Auth API Integration", () => {

    beforeAll(async () => {
        await startTestDatabase();
    }, 60_000);


    beforeEach(async () => {
        await prisma.user_credentials.deleteMany();
        await prisma.oauth_accounts.deleteMany();
        await prisma.users.deleteMany();
    });


    afterAll(async () => {
        await prisma.$disconnect();
        await stopTestDatabase();
    });


    describe("POST /api/auth/register", () => {

        it("soll einen Benutzer registrieren", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "test@example.com",
                    password: "secret123",
                    firstName: "Max",
                    lastName: "Mustermann",
                });

            expect(response.status).toBe(201);

            expect(response.body).toEqual({
                user: {
                    id: expect.any(Number),
                    email: "test@example.com",
                    firstName: "Max",
                    lastName: "Mustermann",
                },
            });

            const userInDatabase =
                await prisma.users.findUnique({
                    where: {
                        email: "test@example.com",
                    },
                    include: {
                        user_credentials: true,
                    },
                });

            expect(userInDatabase).not.toBeNull();

            expect(userInDatabase?.email)
                .toBe("test@example.com");

            expect(userInDatabase?.user_credentials)
                .not.toBeNull();

            expect(
                userInDatabase?.user_credentials?.password_hash
            ).not.toBe("secret123");
        });


        it("soll keinen Benutzer mit gleicher E-Mail zweimal registrieren", async () => {

            await request(app)
                .post("/api/auth/register")
                .send({
                    email: "test@example.com",
                    password: "secret123",
                    firstName: "Max",
                    lastName: "Mustermann",
                })
                .expect(201);


            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "test@example.com",
                    password: "anotherPassword123",
                    firstName: "Max",
                    lastName: "Mustermann",
                });


            expect(response.status).toBe(409);
        });

    });


    describe("POST /api/auth/login", () => {

        it("soll einen registrierten Benutzer einloggen", async () => {

            await request(app)
                .post("/api/auth/register")
                .send({
                    email: "test@example.com",
                    password: "secret123",
                    firstName: "Max",
                    lastName: "Mustermann",
                })
                .expect(201);


            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "test@example.com",
                    password: "secret123",
                });


            expect(response.status).toBe(200);


            expect(response.body).toEqual({
                user: {
                    id: expect.any(Number),
                    email: "test@example.com",
                    firstName: "Max",
                    lastName: "Mustermann",
                },
            });


            /*
              Prüfen, ob access_token Cookie gesetzt wurde.
            */
            const cookies = response.get("Set-Cookie");

            expect(cookies).toBeDefined();

            expect(
                cookies?.some((cookie: any) =>
                    cookie.startsWith("access_token=")
                )
            ).toBe(true);
        });


        it("soll 401 bei falschem Passwort zurückgeben", async () => {

            await request(app)
                .post("/api/auth/register")
                .send({
                    email: "test@example.com",
                    password: "secret123",
                    firstName: "Max",
                    lastName: "Mustermann",
                })
                .expect(201);


            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "test@example.com",
                    password: "wrong-password",
                });


            expect(response.status).toBe(401);
        });


        it("soll 401 zurückgeben, wenn Benutzer nicht existiert", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "notfound@example.com",
                    password: "secret123",
                });


            expect(response.status).toBe(401);
        });

    });


    describe("Auth Flow", () => {

        it("soll Register → Login → /me erfolgreich durchführen", async () => {

            const agent = request.agent(app);

            await agent
                .post("/api/auth/register")
                .send({
                    email: "flow@example.com",
                    password: "secret123",
                    firstName: "Max",
                    lastName: "Mustermann",
                })
                .expect(201);


            const loginResponse = await agent
                .post("/api/auth/login")
                .send({
                    email: "flow@example.com",
                    password: "secret123",
                });


            expect(loginResponse.status)
                .toBe(200);


            const meResponse = await agent
                .get("/api/user/me");


            expect(meResponse.status)
                .toBe(200);


            expect(meResponse.body.user.email)
                .toBe("flow@example.com");

            expect(meResponse.body.user.first_name)
                .toBe("Max");

            expect(meResponse.body.user.last_name)
                .toBe("Mustermann");
        });


        it("soll nach Logout keinen Zugriff mehr auf /me erlauben", async () => {

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


            await agent
                .post("/api/auth/login")
                .send({
                    email: "logout@example.com",
                    password: "secret123",
                })
                .expect(200);

            await agent
                .get("/api/user/me")
                .expect(200);

            const logoutResponse = await agent
                .post("/api/auth/logout");


            expect(logoutResponse.status)
                .toBe(200);


            expect(logoutResponse.body)
                .toEqual({
                    message: "Erfolgreich ausgeloggt.",
                });

            const afterLogout = await agent
                .get("/api/user/me");


            expect(afterLogout.status)
                .toBe(401);
        });

    });

});