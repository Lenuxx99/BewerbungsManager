import { userRepository } from "./user.repository";


export const userService = {
  async getMe(id: number) {
    const user = await userRepository.findUserById(id);

    if (!user) {
      throw new Error("Benutzer nicht gefunden");
    }

    return user;
  },
};