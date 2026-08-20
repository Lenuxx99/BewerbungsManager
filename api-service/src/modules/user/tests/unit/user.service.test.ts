import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import { userService } from "../../user.service";
import { userRepository } from "../../user.repository";

vi.mock("../../user.repository", () => ({
  userRepository: {
    findUserById: vi.fn(),
  },
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMe", () => {
    it("soll den Benutzer zurückgeben", async () => {
      const userId = 2;

      const user = {
        id: 2,
        email: "test@example.com",
        first_name: "Max",
        last_name: "Mustermann",
        created_at: new Date(),
      };

      vi.mocked(
        userRepository.findUserById
      ).mockResolvedValue(user);

      const result =
        await userService.getMe(userId);

      expect(
        userRepository.findUserById
      ).toHaveBeenCalledTimes(1);

      expect(
        userRepository.findUserById
      ).toHaveBeenCalledWith(userId);

      expect(result).toEqual(user);
    });

    it("soll einen Fehler werfen, wenn Benutzer nicht gefunden wird", async () => {
      const userId = 999;

      vi.mocked(
        userRepository.findUserById
      ).mockResolvedValue(null);

      await expect(
        userService.getMe(userId)
      ).rejects.toThrow(
        "Benutzer nicht gefunden"
      );

      expect(
        userRepository.findUserById
      ).toHaveBeenCalledWith(userId);
    });

    it("soll Repository-Fehler weitergeben", async () => {
      const error = new Error("Database error");

      vi.mocked(
        userRepository.findUserById
      ).mockRejectedValue(error);

      await expect(
        userService.getMe(2)
      ).rejects.toThrow("Database error");
    });
  });
});