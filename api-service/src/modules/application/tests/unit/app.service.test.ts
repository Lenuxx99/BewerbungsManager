import { describe, it, expect, vi, beforeEach } from "vitest";
import { appService } from "../../app.service";
import appRepository from "../../app.repository";

vi.mock("../../app.repository", () => ({
    default: {
        createApplication: vi.fn(),
        findAppsByUserId: vi.fn(),
        updateApplication: vi.fn(),
        deleteApplication: vi.fn(),
    },
}));

describe("appService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe("appService.addApp", () => {

        it("soll eine Bewerbung über das Repository erstellen", async () => {
            const appData = {
                userId: 2,
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: new Date("2026-08-19"),
                status: "OFFEN" as const,
                notizen: "Test Bewerbung",
            };

            const createdApplication = {
                id: 10,
                user_id: 2,
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: new Date("2026-08-19"),
                status: "OFFEN",
                notizen: "Test Bewerbung",
            };

            vi.mocked(
                appRepository.createApplication
            ).mockResolvedValue(createdApplication as any);

            const result = await appService.addApp(appData);

            expect(
                appRepository.createApplication
            ).toHaveBeenCalledTimes(1);

            expect(
                appRepository.createApplication
            ).toHaveBeenCalledWith(appData);

            expect(result).toEqual(createdApplication);
        });

        it("soll einen Fehler werfen, wenn das Repository fehlschlägt", async () => {
            const appData = {
                userId: 2,
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: new Date("2026-08-19"),
                status: "OFFEN" as const,
                notizen: "Test",
            };

            vi.mocked(
                appRepository.createApplication
            ).mockRejectedValue(
                new Error("Database error")
            );

            await expect(
                appService.addApp(appData)
            ).rejects.toThrow(
                "Bewerbung konnte nicht erstellt werden."
            );

            expect(
                appRepository.createApplication
            ).toHaveBeenCalledWith(appData);
        });
    });

    describe("appService.getApps", () => {

        it("soll Bewerbungen über das Repository abfragen", async () => {
            const userId = 2;

            const applications = [
                {
                    id: 1,
                    user_id: 2,
                    firma: "Siemens",
                    stelle: "Software Entwickler",
                    datum: new Date("2026-08-19"),
                    status: "OFFEN",
                    notizen: "Test Bewerbung",
                    created_at: new Date("2026-08-19"),
                    updated_at: new Date("2026-08-19"),
                    interview_date: null,
                    interview_notizen: null,
                },
                {
                    id: 10,
                    user_id: 2,
                    firma: "BMW",
                    stelle: "Hardware Entwickler",
                    datum: new Date("2026-08-20"),
                    status: "OFFEN",
                    notizen: null,
                    created_at: new Date("2026-08-20"),
                    updated_at: new Date("2026-08-20"),
                    interview_date: null,
                    interview_notizen: null,
                },
            ];

            vi.mocked(
                appRepository.findAppsByUserId
            ).mockResolvedValue(applications);

            const result = await appService.getApps(userId);

            expect(
                appRepository.findAppsByUserId
            ).toHaveBeenCalledTimes(1);

            expect(
                appRepository.findAppsByUserId
            ).toHaveBeenCalledWith(userId);

            expect(result).toEqual(applications);
        });
        it("soll einen Fehler werfen, wenn das Repository fehlschlägt", async () => {
            const userId = 2;

            vi.mocked(
                appRepository.findAppsByUserId
            ).mockRejectedValue(
                new Error("Database error")
            );

            await expect(
                appService.getApps(userId)
            ).rejects.toThrow(
                "Bewerbung konnte nicht abgefragt werden."
            );

            expect(
                appRepository.findAppsByUserId
            ).toHaveBeenCalledWith(userId);
        });
    });

    describe("updateAppStatus", () => {
        it("soll den Status aktualisieren", async () => {
            const updatedApp = {
                id: 1,
                user_id: 2,
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: new Date("2026-08-19"),
                status: "INTERVIEW",
                notizen: null,
                interview_date: null,
                interview_notizen: null,
                created_at: new Date("2026-08-19"),
                updated_at: new Date("2026-08-19"),
            };

            vi.mocked(
                appRepository.updateApplication
            ).mockResolvedValue(updatedApp);

            const result =
                await appService.updateAppStatus(
                    1,
                    "INTERVIEW"
                );

            expect(
                appRepository.updateApplication
            ).toHaveBeenCalledWith(1, {
                status: "INTERVIEW",
            });

            expect(result).toEqual(updatedApp);
        });

        it("soll bei Repository-Fehler einen Fehler werfen", async () => {
            vi.mocked(
                appRepository.updateApplication
            ).mockRejectedValue(
                new Error("Database error")
            );

            await expect(
                appService.updateAppStatus(
                    1,
                    "INTERVIEW"
                )
            ).rejects.toThrow(
                "Bewerbung konnte nicht updated werden."
            );
        });
    });

    describe("updateAppNotizen", () => {
        it("soll Notizen aktualisieren", async () => {
            const updatedApp = {
                id: 1,
                user_id: 2,
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: new Date("2026-08-19"),
                status: "INTERVIEW",
                notizen: "Neue Notiz",
                interview_date: null,
                interview_notizen: null,
                created_at: new Date("2026-08-19"),
                updated_at: new Date("2026-08-19"),
            };
            vi.mocked(
                appRepository.updateApplication
            ).mockResolvedValue(updatedApp);

            const result = await appService.updateAppNotizen(
                1,
                "Neue Notiz"
            );

            expect(
                appRepository.updateApplication
            ).toHaveBeenCalledWith(1, {
                notizen: "Neue Notiz",
            });

            expect(result).toEqual(updatedApp)
        });

        it("soll bei Repository-Fehler einen Fehler werfen", async () => {
            vi.mocked(
                appRepository.updateApplication
            ).mockRejectedValue(
                new Error("Database error")
            );

            await expect(
                appService.updateAppNotizen(
                    1,
                    "Neue Notiz"
                )
            ).rejects.toThrow(
                "Bewerbung konnte nicht updated werden."
            );
        });
    });

    describe("updateInterviewAppNotizen", () => {
        it("soll Interview-Notizen aktualisieren", async () => {
            const updatedApp = {
                id: 1,
                user_id: 2,
                firma: "Siemens",
                stelle: "Software Entwickler",
                datum: new Date("2026-08-19"),
                status: "INTERVIEW",
                notizen: null,
                interview_date: null,
                interview_notizen: "Technische Fragen vorbereiten",
                created_at: new Date("2026-08-19"),
                updated_at: new Date("2026-08-19"),
            };
            vi.mocked(
                appRepository.updateApplication
            ).mockResolvedValue(updatedApp);

            const result = await appService.updateInterviewAppNotizen(
                1,
                "Technische Fragen vorbereiten"
            );

            expect(
                appRepository.updateApplication
            ).toHaveBeenCalledWith(1, {
                interview_notizen:
                    "Technische Fragen vorbereiten",
            });
            expect(result).toEqual(updatedApp)
        });
        it("soll bei Repository-Fehler einen Fehler werfen", async () => {
            vi.mocked(
                appRepository.updateApplication
            ).mockRejectedValue(
                new Error("Database error")
            );

            await expect(
                appService.updateInterviewAppNotizen(
                    1,
                    "Technische Fragen vorbereiten"
                )
            ).rejects.toThrow(
                "Bewerbung konnte nicht updated werden."
            );
        });
    });
    describe("updateAppInterviewDate", () => {
        it("soll ein gültiges zukünftiges Datum aktualisieren", async () => {
            const interviewDate =
                "2099-08-25T10:00:00.000Z";

            vi.mocked(
                appRepository.updateApplication
            ).mockResolvedValue({} as any);

            await appService.updateAppInterviewDate(
                1,
                interviewDate
            );

            expect(
                appRepository.updateApplication
            ).toHaveBeenCalledWith(1, {
                interview_date: new Date(interviewDate),
                status: "INTERVIEW",
            });
        });

        it("soll ein ungültiges Datum ablehnen", async () => {
            await expect(
                appService.updateAppInterviewDate(
                    1,
                    "kein-datum"
                )
            ).rejects.toThrow(
                "Ungültiges Interview-Datum."
            );

            expect(
                appRepository.updateApplication
            ).not.toHaveBeenCalled();
        });

        it("soll ein Datum in der Vergangenheit ablehnen", async () => {
            await expect(
                appService.updateAppInterviewDate(
                    1,
                    "2020-01-01"
                )
            ).rejects.toThrow(
                "Interview kann nicht in der Vergangenheit liegen."
            );

            expect(
                appRepository.updateApplication
            ).not.toHaveBeenCalled();
        });
    });
});