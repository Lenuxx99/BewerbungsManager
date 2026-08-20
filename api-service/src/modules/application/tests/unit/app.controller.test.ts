import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from "vitest";

import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    createApplication,
    updateApplication,
} from "../../app.controller";

import { appService } from "../../app.service";


vi.mock("../../app.service", () => ({
    appService: {
        addApp: vi.fn(),
        getApps: vi.fn(),
        updateAppStatus: vi.fn(),
        updateAppNotizen: vi.fn(),
        updateAppInterviewDate: vi.fn(),
        updateInterviewAppNotizen: vi.fn(),
    },
}));


describe("appController", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });


    describe("createApplication", () => {

        it("soll eine Bewerbung erstellen und 201 zurückgeben", async () => {

            const req = {
                body: {
                    firma: "Siemens",
                    stelle: "Software Entwickler",
                    datum: "2026-08-19",
                    status: "OFFEN",
                    notizen: "Test Bewerbung",
                },

                userId: 2,

            } as any;


            const createdApplication = {
                id: 10,
                user_id: 2,
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: new Date("2026-08-19"),
                status: "OFFEN",
                notizen: "Test Bewerbung",
                interview_date: null,
                interview_notizen: null,
                created_at: new Date(),
                updated_at: new Date(),
            };


            vi.mocked(
                appService.addApp
            ).mockResolvedValue(
                createdApplication
            );


            const json = vi.fn();

            const status = vi.fn(() => ({
                json,
            }));

            const res = {
                status,
            } as unknown as Response;

            const next: NextFunction = vi.fn();


            await createApplication(
                req,
                res,
                next
            );


            expect(
                appService.addApp
            ).toHaveBeenCalledTimes(1);


            expect(
                appService.addApp
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 2,
                    firma: "Siemens",
                    stelle: "Software Entwickler",
                    status: "OFFEN",
                    notizen: "Test Bewerbung",
                })
            );


            expect(status).toHaveBeenCalledWith(
                201
            );


            expect(json).toHaveBeenCalledWith(
                expect.objectContaining({
                    application:
                        createdApplication,
                })
            );


            expect(next).not.toHaveBeenCalled();
        });


        it("soll Service-Fehler an next weitergeben", async () => {

            const req = {
                body: {
                    firma: "Siemens",
                    stelle: "Software Entwickler",
                    datum: "2026-08-19",
                    status: "OFFEN",
                    notizen: "Test Bewerbung",
                },

                userId: 2,

            } as any;


            const error = new Error(
                "Bewerbung konnte nicht erstellt werden."
            );


            vi.mocked(
                appService.addApp
            ).mockRejectedValue(error);


            const json = vi.fn();

            const status = vi.fn(() => ({
                json,
            }));

            const res = {
                status,
            } as unknown as Response;

            const next = vi.fn();


            await createApplication(
                req,
                res,
                next
            );


            expect(next).toHaveBeenCalledWith(
                error
            );
        });
    });
});