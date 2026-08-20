import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from "vitest";

import argon2 from "argon2";

import {
    authService,
    AuthError,
} from "../../auth.service";

import { authRepository } from "../../auth.repository";
import { createAccessToken } from "../../jwt.utils";


vi.mock("../../auth.repository", () => ({
    authRepository: {
        findUserByEmail: vi.fn(),
        createUser: vi.fn(),
    },
}));


vi.mock("argon2", () => ({
    default: {
        hash: vi.fn(),
        verify: vi.fn(),
    },
}));


vi.mock("../../jwt.utils", () => ({
    createAccessToken: vi.fn(),
}));


describe("authService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    describe("register", () => {
        it("soll einen neuen Benutzer registrieren", async () => {
            const input = {
                email: "TEST@EXAMPLE.COM",
                password: "secret123",
                firstName: "Max",
                lastName: "Mustermann",
            };

            const passwordHash = "hashed-password";

            const createdUser = {
                id: 1,
                email: "test@example.com",
                first_name: "Max",
                last_name: "Mustermann",
                user_credentials: {
                    password_hash: passwordHash,
                },
                oauth_accounts: [],
            };

            vi.mocked(
                authRepository.findUserByEmail
            ).mockResolvedValue(null);

            vi.mocked(
                argon2.hash
            ).mockResolvedValue(passwordHash);

            vi.mocked(
                authRepository.createUser
            ).mockResolvedValue(createdUser as any);

            vi.mocked(
                createAccessToken
            ).mockReturnValue("test-token");


            const result =
                await authService.register(input);


            expect(
                authRepository.findUserByEmail
            ).toHaveBeenCalledWith(
                "test@example.com"
            );

            expect(
                argon2.hash
            ).toHaveBeenCalledWith(
                "secret123"
            );


            expect(
                authRepository.createUser
            ).toHaveBeenCalledWith({
                email: "test@example.com",
                passwordHash: "hashed-password",
                firstName: "Max",
                lastName: "Mustermann",
            });


            expect(
                createAccessToken
            ).toHaveBeenCalledWith(1);


            expect(result).toEqual({
                user: {
                    id: 1,
                    email: "test@example.com",
                    firstName: "Max",
                    lastName: "Mustermann",
                },
                accessToken: "test-token",
            });
        });


        it("soll 409 werfen, wenn Benutzer schon existiert", async () => {
            const input = {
                email: "test@example.com",
                password: "secret123",
                firstName: "Max",
                lastName: "Mustermann",
            };

            vi.mocked(
                authRepository.findUserByEmail
            ).mockResolvedValue({
                id: 1,
            } as any);


            await expect(
                authService.register(input)
            ).rejects.toMatchObject({
                message:
                    "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
                statusCode: 409,
            });


            expect(
                argon2.hash
            ).not.toHaveBeenCalled();


            expect(
                authRepository.createUser
            ).not.toHaveBeenCalled();


            expect(
                createAccessToken
            ).not.toHaveBeenCalled();
        });
    });


    describe("login", () => {
        it("soll einen Benutzer erfolgreich einloggen", async () => {
            const input = {
                email: "TEST@EXAMPLE.COM",
                password: "secret123",
            };

            const user = {
                id: 1,
                email: "test@example.com",
                first_name: "Max",
                last_name: "Mustermann",

                user_credentials: {
                    password_hash: "hashed-password",
                },

                oauth_accounts: [],
            };


            vi.mocked(
                authRepository.findUserByEmail
            ).mockResolvedValue(user as any);


            vi.mocked(
                argon2.verify
            ).mockResolvedValue(true);


            vi.mocked(
                createAccessToken
            ).mockReturnValue("login-token");


            const result =
                await authService.login(input);


            expect(
                authRepository.findUserByEmail
            ).toHaveBeenCalledWith(
                "test@example.com"
            );


            expect(
                argon2.verify
            ).toHaveBeenCalledWith(
                "hashed-password",
                "secret123"
            );


            expect(
                createAccessToken
            ).toHaveBeenCalledWith(1);


            expect(result).toEqual({
                user: {
                    id: 1,
                    email: "test@example.com",
                    firstName: "Max",
                    lastName: "Mustermann",
                },
                accessToken: "login-token",
            });
        });


        it("soll 401 werfen, wenn Benutzer nicht existiert", async () => {
            const input = {
                email: "test@example.com",
                password: "secret123",
            };


            vi.mocked(
                authRepository.findUserByEmail
            ).mockResolvedValue(null);


            await expect(
                authService.login(input)
            ).rejects.toMatchObject({
                message:
                    "E-Mail-Adresse oder Passwort ist falsch",
                statusCode: 401,
            });


            expect(
                argon2.verify
            ).not.toHaveBeenCalled();


            expect(
                createAccessToken
            ).not.toHaveBeenCalled();
        });


        it("soll 401 werfen, wenn keine Credentials existieren", async () => {
            const input = {
                email: "oauth@example.com",
                password: "secret123",
            };


            const user = {
                id: 1,
                email: "oauth@example.com",
                first_name: "Max",
                last_name: "Mustermann",
                user_credentials: null,
                oauth_accounts: [],
            };


            vi.mocked(
                authRepository.findUserByEmail
            ).mockResolvedValue(user as any);


            await expect(
                authService.login(input)
            ).rejects.toMatchObject({
                message:
                    "E-Mail-Adresse oder Passwort ist falsch",
                statusCode: 401,
            });


            expect(
                argon2.verify
            ).not.toHaveBeenCalled();


            expect(
                createAccessToken
            ).not.toHaveBeenCalled();
        });


        it("soll 401 werfen, wenn Passwort falsch ist", async () => {
            const input = {
                email: "test@example.com",
                password: "wrong-password",
            };


            const user = {
                id: 1,
                email: "test@example.com",
                first_name: "Max",
                last_name: "Mustermann",

                user_credentials: {
                    password_hash: "hashed-password",
                },

                oauth_accounts: [],
            };


            vi.mocked(
                authRepository.findUserByEmail
            ).mockResolvedValue(user as any);


            vi.mocked(
                argon2.verify
            ).mockResolvedValue(false);


            await expect(
                authService.login(input)
            ).rejects.toMatchObject({
                message:
                    "E-Mail-Adresse oder Passwort ist falsch",
                statusCode: 401,
            });


            expect(
                argon2.verify
            ).toHaveBeenCalledWith(
                "hashed-password",
                "wrong-password"
            );


            expect(
                createAccessToken
            ).not.toHaveBeenCalled();
        });
    });
});