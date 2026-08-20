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


describe("Application API Integration", () => {

    beforeAll(async () => {
        await startTestDatabase();
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

    async function createAuthenticatedAgent() {
        const agent = request.agent(app);

        await agent
            .post("/api/auth/register")
            .send({
                email: "test@example.com",
                password: "secret123",
                firstName: "Max",
                lastName: "Mustermann",
            })
            .expect(201);

        return agent;
    }


    async function createTestApplication(
        agent: ReturnType<typeof request.agent>
    ) {
        const response = await agent
            .post("/api/applications")
            .send({
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: "2026-08-19",
                status: "OFFEN",
                notizen: "Test Bewerbung",
            });

        expect(response.status).toBe(201);

        return response;
    }


    describe("POST /api/applications", () => {

        it("soll eine Bewerbung erstellen", async () => {
            const agent =
                await createAuthenticatedAgent();


            const response = await agent
                .post("/api/applications")
                .send({
                    firma: "Siemens",
                    stelle: "Software Entwickler",
                    datum: "2026-08-19",
                    status: "OFFEN",
                    notizen: "Test Bewerbung",
                });


            expect(response.status).toBe(201);


            expect(response.body.application)
                .toEqual(
                    expect.objectContaining({
                        id: expect.any(Number),
                        firma: "Siemens",
                        stelle: "Software Entwickler",
                        status: "OFFEN",
                        notizen: "Test Bewerbung",
                    })
                );


            const application =
                await prisma.applications.findFirst({
                    where: {
                        firma: "Siemens",
                    },
                });


            expect(application).not.toBeNull();

            expect(application?.firma)
                .toBe("Siemens");

            expect(application?.stelle)
                .toBe("Software Entwickler");

            expect(application?.status)
                .toBe("OFFEN");
        });


        it("soll ohne Authentifizierung abgelehnt werden", async () => {

            const response = await request(app)
                .post("/api/applications")
                .send({
                    firma: "Siemens",
                    stelle: "Software Entwickler",
                    datum: "2026-08-19",
                });


            expect(response.status).toBe(401);


            const count =
                await prisma.applications.count();

            expect(count).toBe(0);
        });


        it("soll ungültige Eingaben ablehnen", async () => {
            const agent =
                await createAuthenticatedAgent();


            const response = await agent
                .post("/api/applications")
                .send({
                    firma: "",
                    stelle: "",
                    datum: "",
                });


            expect(response.status).toBe(400);


            const count =
                await prisma.applications.count();

            expect(count).toBe(0);
        });

    });


    describe("GET /api/applications", () => {

        it("soll die Bewerbungen des eingeloggten Benutzers zurückgeben", async () => {
            const agent =
                await createAuthenticatedAgent();


            await createTestApplication(agent);


            const response = await agent
                .get("/api/applications");


            expect(response.status).toBe(200);


            expect(Array.isArray(response.body))
                .toBe(true);


            expect(response.body)
                .toHaveLength(1);


            expect(response.body[0])
                .toEqual(
                    expect.objectContaining({
                        firma: "Siemens",
                        stelle: "Software Entwickler",
                        status: "OFFEN",
                    })
                );
        });


        it("soll ohne Authentifizierung 401 zurückgeben", async () => {

            const response = await request(app)
                .get("/api/applications");


            expect(response.status)
                .toBe(401);
        });

    });


    describe("PATCH /api/applications/:appId", () => {

        it("soll den Status einer Bewerbung aktualisieren", async () => {
            const agent =
                await createAuthenticatedAgent();


            const createResponse =
                await createTestApplication(agent);


            const appId =
                createResponse.body.application.id;


            const response = await agent
                .patch(`/api/applications/${appId}`)
                .send({
                    status: "ZUGESAGT",
                });


            expect(response.status)
                .toBe(200);


            expect(response.body.application)
                .toEqual(
                    expect.objectContaining({
                        id: appId,
                        status: "ZUGESAGT",
                    })
                );


            const application =
                await prisma.applications.findUnique({
                    where: {
                        id: appId,
                    },
                });


            expect(application?.status)
                .toBe("ZUGESAGT");
        });


        it("soll Bewerbungsnotizen aktualisieren", async () => {
            const agent =
                await createAuthenticatedAgent();


            const createResponse =
                await createTestApplication(agent);


            const appId =
                createResponse.body.application.id;


            const response = await agent
                .patch(`/api/applications/${appId}`)
                .send({
                    notizen:
                        "Neue allgemeine Bewerbungsnotiz",
                });


            expect(response.status)
                .toBe(200);


            expect(
                response.body.application.notizen
            ).toBe(
                "Neue allgemeine Bewerbungsnotiz"
            );


            const application =
                await prisma.applications.findUnique({
                    where: {
                        id: appId,
                    },
                });


            expect(application?.notizen)
                .toBe(
                    "Neue allgemeine Bewerbungsnotiz"
                );
        });


        it("soll ein Interview-Datum setzen und Status auf INTERVIEW ändern", async () => {
            const agent =
                await createAuthenticatedAgent();


            const createResponse =
                await createTestApplication(agent);


            const appId =
                createResponse.body.application.id;


            const interviewDate =
                "2099-08-25T10:00:00.000Z";


            const response = await agent
                .patch(`/api/applications/${appId}`)
                .send({
                    interview_date:
                        interviewDate,
                });


            expect(response.status)
                .toBe(200);


            expect(response.body.application.status)
                .toBe("INTERVIEW");


            const application =
                await prisma.applications.findUnique({
                    where: {
                        id: appId,
                    },
                });


            expect(application?.status)
                .toBe("INTERVIEW");


            expect(
                application?.interview_date?.toISOString()
            ).toBe(interviewDate);
        });


        it("soll ein Interview-Datum in der Vergangenheit ablehnen", async () => {
            const agent =
                await createAuthenticatedAgent();


            const createResponse =
                await createTestApplication(agent);


            const appId =
                createResponse.body.application.id;


            const response = await agent
                .patch(`/api/applications/${appId}`)
                .send({
                    interview_date:
                        "2020-01-01T10:00:00.000Z",
                });


            expect(response.status)
                .toBe(400);


            const application =
                await prisma.applications.findUnique({
                    where: {
                        id: appId,
                    },
                });


            expect(application?.interview_date)
                .toBeNull();
        });


        it("soll Interview-Notizen aktualisieren", async () => {
            const agent =
                await createAuthenticatedAgent();


            const createResponse =
                await createTestApplication(agent);


            const appId =
                createResponse.body.application.id;


            const response = await agent
                .patch(`/api/applications/${appId}`)
                .send({
                    interview_notizen:
                        "Technische Fragen vorbereiten",
                });


            expect(response.status)
                .toBe(200);


            expect(
                response.body.application
                    .interview_notizen
            ).toBe(
                "Technische Fragen vorbereiten"
            );


            const application =
                await prisma.applications.findUnique({
                    where: {
                        id: appId,
                    },
                });


            expect(
                application?.interview_notizen
            ).toBe(
                "Technische Fragen vorbereiten"
            );
        });


        it("soll 400 zurückgeben, wenn kein Update-Feld übergeben wurde", async () => {
            const agent =
                await createAuthenticatedAgent();


            const createResponse =
                await createTestApplication(agent);


            const appId =
                createResponse.body.application.id;


            const response = await agent
                .patch(`/api/applications/${appId}`)
                .send({});


            expect(response.status)
                .toBe(400);


            expect(response.body)
                .toEqual({
                    message:
                        "Es wurde kein Feld zum Aktualisieren übergeben.",
                });
        });


        it("soll ungültige Bewerbungs-ID ablehnen", async () => {
            const agent =
                await createAuthenticatedAgent();


            const response = await agent
                .patch("/api/applications/abc")
                .send({
                    status: "INTERVIEW",
                });


            expect(response.status)
                .toBe(400);


            expect(response.body)
                .toEqual({
                    message:
                        "Ungültige Bewerbungs-ID.",
                });
        });


        it("soll ohne Authentifizierung kein Update erlauben", async () => {

            const response = await request(app)
                .patch("/api/applications/1")
                .send({
                    status: "INTERVIEW",
                });


            expect(response.status)
                .toBe(401);
        });

    });


    describe("GET /api/applications/termine", () => {

        it("soll nur Interview-Bewerbungen zurückgeben", async () => {
            const agent =
                await createAuthenticatedAgent();


            /*
                Normale Bewerbung
            */
            await agent
                .post("/api/applications")
                .send({
                    firma: "BMW",
                    stelle: "Backend Entwickler",
                    datum: "2026-08-19",
                    status: "OFFEN",
                })
                .expect(201);


            /*
                Bewerbung zunächst erstellen.
            */
            const interviewApp =
                await agent
                    .post("/api/applications")
                    .send({
                        firma: "Siemens",
                        stelle: "Software Entwickler",
                        datum: "2026-08-19",
                        status: "OFFEN",
                    });


            const appId =
                interviewApp.body.application.id;


            /*
                Interview setzen.
            */
            await agent
                .patch(
                    `/api/applications/${appId}`
                )
                .send({
                    interview_date:
                        "2099-08-25T10:00:00.000Z",
                })
                .expect(200);


            const response = await agent
                .get("/api/applications/termine");


            expect(response.status)
                .toBe(200);


            expect(Array.isArray(response.body))
                .toBe(true);


            expect(response.body)
                .toHaveLength(1);


            expect(response.body[0])
                .toEqual(
                    expect.objectContaining({
                        id: appId,
                        firma: "Siemens",
                        status: "INTERVIEW",
                    })
                );
        });

    });

});