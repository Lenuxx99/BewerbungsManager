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
  register,
  login,
  loginWithGoogle,
  logout,
} from "../../auth.controller";

import { authService } from "../../auth.service";
import { googleAuthService } from "../../google-auth.service";


vi.mock("../../auth.service", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock("../../google-auth.service", () => ({
  googleAuthService: {
    loginWithGoogle: vi.fn(),
  },
}));


describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe("register", () => {
    it("soll Benutzer registrieren, Cookie setzen und 201 zurückgeben", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "secret123",
          firstName: "Max",
          lastName: "Mustermann",
        },
      } as Request;

      const serviceResult = {
        user: {
          id: 1,
          email: "test@example.com",
          firstName: "Max",
          lastName: "Mustermann",
        },
        accessToken: "register-token",
      };

      vi.mocked(
        authService.register
      ).mockResolvedValue(serviceResult);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const cookie = vi.fn();

      const res = {
        status,
        cookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await register(req, res, next);

      expect(
        authService.register
      ).toHaveBeenCalledTimes(1);

      expect(
        authService.register
      ).toHaveBeenCalledWith(req.body);

      expect(cookie).toHaveBeenCalledWith(
        "access_token",
        "register-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 1000,
        })
      );

      expect(status).toHaveBeenCalledWith(201);

      expect(json).toHaveBeenCalledWith({
        user: serviceResult.user,
      });

      expect(next).not.toHaveBeenCalled();
    });


    it("soll Service-Fehler an next weitergeben", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "secret123",
          firstName: "Max",
          lastName: "Mustermann",
        },
      } as Request;

      const error = new Error(
        "Registrierung fehlgeschlagen"
      );

      vi.mocked(
        authService.register
      ).mockRejectedValue(error);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const cookie = vi.fn();

      const res = {
        status,
        cookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);

      expect(cookie).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });
  });


  describe("login", () => {
    it("soll Benutzer einloggen, Cookie setzen und 200 zurückgeben", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "secret123",
        },
      } as Request;

      const serviceResult = {
        user: {
          id: 1,
          email: "test@example.com",
          firstName: "Max",
          lastName: "Mustermann",
        },
        accessToken: "login-token",
      };

      vi.mocked(
        authService.login
      ).mockResolvedValue(serviceResult);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const cookie = vi.fn();

      const res = {
        status,
        cookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await login(req, res, next);

      expect(
        authService.login
      ).toHaveBeenCalledWith(req.body);

      expect(cookie).toHaveBeenCalledWith(
        "access_token",
        "login-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );

      expect(status).toHaveBeenCalledWith(200);

      expect(json).toHaveBeenCalledWith({
        user: serviceResult.user,
      });

      expect(next).not.toHaveBeenCalled();
    });


    it("soll Login-Fehler an next weitergeben", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "wrong-password",
        },
      } as Request;

      const error = new Error(
        "E-Mail-Adresse oder Passwort ist falsch"
      );

      vi.mocked(
        authService.login
      ).mockRejectedValue(error);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const cookie = vi.fn();

      const res = {
        status,
        cookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);

      expect(cookie).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });
  });


  describe("loginWithGoogle", () => {
    it("soll Google Login durchführen, Cookie setzen und 200 zurückgeben", async () => {
      const req = {
        body: {
          credential: "google-credential",
        },
      } as Request;

      const googleResult = {
        id: 1,
        email: "google@example.com",
        firstName: "Max",
        lastName: "Mustermann",
        accessToken: "google-token",
      };

      vi.mocked(
        googleAuthService.loginWithGoogle
      ).mockResolvedValue(googleResult as any);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const cookie = vi.fn();

      const res = {
        status,
        cookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await loginWithGoogle(req, res, next);

      expect(
        googleAuthService.loginWithGoogle
      ).toHaveBeenCalledWith(
        "google-credential"
      );

      expect(cookie).toHaveBeenCalledWith(
        "access_token",
        "google-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );

      expect(status).toHaveBeenCalledWith(200);

      expect(json).toHaveBeenCalledWith({
        user: googleResult,
      });

      expect(next).not.toHaveBeenCalled();
    });


    it("soll Google-Service-Fehler an next weitergeben", async () => {
      const req = {
        body: {
          credential: "invalid-google-credential",
        },
      } as Request;

      const error = new Error(
        "Google Login fehlgeschlagen"
      );

      vi.mocked(
        googleAuthService.loginWithGoogle
      ).mockRejectedValue(error);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const cookie = vi.fn();

      const res = {
        status,
        cookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await loginWithGoogle(req, res, next);

      expect(next).toHaveBeenCalledWith(error);

      expect(cookie).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
    });
  });


  describe("logout", () => {
    it("soll Cookie löschen und 200 zurückgeben", async () => {
      const req = {} as Request;

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const clearCookie = vi.fn();

      const res = {
        status,
        clearCookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await logout(req, res, next);

      expect(clearCookie).toHaveBeenCalledWith(
        "access_token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );

      expect(status).toHaveBeenCalledWith(200);

      expect(json).toHaveBeenCalledWith({
        message: "Erfolgreich ausgeloggt.",
      });

      expect(next).not.toHaveBeenCalled();
    });


    it("soll Fehler beim Logout an next weitergeben", async () => {
      const req = {} as Request;

      const error = new Error(
        "Cookie konnte nicht gelöscht werden"
      );

      const clearCookie = vi.fn(() => {
        throw error;
      });

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const res = {
        status,
        clearCookie,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await logout(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});