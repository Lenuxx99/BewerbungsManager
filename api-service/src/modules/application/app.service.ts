import appRepository from "./app.repository";

type ApplicationStatus =
  | "OFFEN"
  | "INTERVIEW"
  | "ZUGESAGT"
  | "ABGESAGT";

type AppData = {
  userId: number;
  firma: string;
  stelle: string;
  datum: Date;
  status?: ApplicationStatus;
  notizen?: string;
};

export const appService = {
  async addApp(app: AppData) {
    try {
      return await appRepository.createApplication(app);
    } catch (error) {
      throw new Error("Bewerbung konnte nicht erstellt werden.");
    }
  },

  async getApps(userId: number){
    try{
        return await appRepository.findAppsByUserId(userId);
    } catch(error){
        throw new Error("Bewerbung konnte nicht abgefragt werden.");
    }
  }
};