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

import { getUser } from "../../user.controller";
import { userService } from "../../user.service";

vi.mock("../../user.service", () => ({
  userService: {
    getMe: vi.fn(),
  },
}));

describe("userController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUser", () => {
    it("soll 401 zurückgeben, wenn keine userId vorhanden ist", async () => {
      const req = {
        userId: undefined,
      } as any;

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const res = {
        status,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await getUser(req, res, next);

      expect(status).toHaveBeenCalledWith(401);

      expect(json).toHaveBeenCalledWith({
        message: "Nicht authentifiziert",
      });

      expect(
        userService.getMe
      ).not.toHaveBeenCalled();

      expect(next).not.toHaveBeenCalled();
    });

    it("soll den Benutzer zurückgeben und 200 senden", async () => {
      const req = {
        userId: 2,
      } as any;

      const user = {
        id: 2,
        email: "test@example.com",
        first_name: "Max",
        last_name: "Mustermann",
        created_at: new Date(),
      };

      vi.mocked(
        userService.getMe
      ).mockResolvedValue(user);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const res = {
        status,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await getUser(req, res, next);

      expect(
        userService.getMe
      ).toHaveBeenCalledTimes(1);

      expect(
        userService.getMe
      ).toHaveBeenCalledWith(2);

      expect(status).toHaveBeenCalledWith(200);

      expect(json).toHaveBeenCalledWith({
        user,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("soll Service-Fehler an next weitergeben", async () => {
      const req = {
        userId: 2,
      } as any;

      const error = new Error(
        "Benutzer nicht gefunden"
      );

      vi.mocked(
        userService.getMe
      ).mockRejectedValue(error);

      const json = vi.fn();

      const status = vi.fn(() => ({
        json,
      }));

      const res = {
        status,
      } as unknown as Response;

      const next: NextFunction = vi.fn();

      await getUser(req, res, next);

      expect(
        userService.getMe
      ).toHaveBeenCalledWith(2);

      expect(next).toHaveBeenCalledWith(
        error
      );
    });
  });
});