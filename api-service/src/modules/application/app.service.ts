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

  async getApps(userId: number) {
    try {
      return await appRepository.findAppsByUserId(userId);
    } catch (error) {
      throw new Error("Bewerbung konnte nicht abgefragt werden.");
    }
  },

  async deleteApp(appId: number) {
    try {
      return await appRepository.deleteApplication(appId);
    } catch (error) {
      throw new Error("Bewerbung konnte nicht gelöscht werden.");
    }
  },

  async updateAppStatus(appId: number, status: ApplicationStatus) {
    try {
      return await appRepository.updateApplication(appId, { status: status });
    } catch (error) {
      throw new Error("Bewerbung konnte nicht updated werden.");
    }
  },

  async updateAppNotizen(appId: number, notizen: string) {
    try {
      return await appRepository.updateApplication(appId, { notizen: notizen })
    } catch (error) {
      throw new Error("Bewerbung konnte nicht updated werden.");
    }
  },

  async updateAppInterviewDate(
    appId: number,
    interviewDate: string
  ) {
    const date = new Date(interviewDate);

    if (isNaN(date.getTime())) {
      throw new Error("Ungültiges Interview-Datum.");
    }

    if (date < new Date()) {
      throw new Error("Interview kann nicht in der Vergangenheit liegen.");
    }

    return appRepository.updateApplication(appId, {
      interview_date: date,
      status: "INTERVIEW",
    });
  },

  async updateInterviewAppNotizen(appId: number, notizen: string) {
    try {
      return await appRepository.updateApplication(appId, { interview_notizen: notizen })
    } catch (error) {
      throw new Error("Bewerbung konnte nicht updated werden.");
    }
  },

  async getInterviewApp(userId: number) {
    try {
      return await appRepository.findInterviewAppsByUserId(userId);
    } catch (error) {
      throw new Error("Interview Application könnte nicht abgefragt werden");
    }
  }
};