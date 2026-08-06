import { Request, Response, NextFunction } from "express";
import { appService } from "./app.service";
import type { ApplicationInput } from "./app.schema";


export async function createApplication(
    req: Request<{}, {}, ApplicationInput>,
    res: Response,
    next: NextFunction
) {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({
            message: "Nicht authentifiziert.",
        });
    }

    const appData = {
        ...req.body,
        userId,
        datum: new Date(req.body.datum),
    };

    try {
        const createdApp = await appService.addApp(appData);

        return res.status(201).json({
            message: "Bewerbung erfolgreich gespeichert.",
            application: createdApp,
        });
    } catch (error) {
        return next(error);
    }
}

export async function getApplications(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({
            message: "Ungültige userId.",
        });
    }

    try {
        const applications = await appService.getApps(userId);

        res.status(200).json(
            applications
        )
    } catch (error) {
        return next(error);
    }
}

export async function deleteApplication(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const appId = Number(req.params.appId);

    if (!appId) {
        return res.status(400).json({
            message: "Eine gültige Bewerbungs-ID ist erforderlich.",
        });
    }

    try {
        await appService.deleteApp(appId);

        return res.status(200).json({
            message: "Application wurde erfolgreich entfernt"
        })
    } catch (error) {
        next(error);
    }
}

export async function updateApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const appId = Number(req.params.appId);

  const {
    status,
    notizen,
    interview_date,
  } = req.body;

  try {
    if (!Number.isInteger(appId) || appId <= 0) {
      return res.status(400).json({
        message: "Ungültige Bewerbungs-ID.",
      });
    }

    if (
      status === undefined &&
      notizen === undefined &&
      interview_date === undefined
    ) {
      return res.status(400).json({
        message:
          "Es wurde kein Feld zum Aktualisieren übergeben.",
      });
    }

    let application;

    if (status !== undefined) {
      application =
        await appService.updateAppStatus(
          appId,
          status
        );
    }

    if (notizen !== undefined) {
      application =
        await appService.updateAppNotizen(
          appId,
          notizen
        );
    }

    if (interview_date !== undefined) {
      application =
        await appService.updateAppInterviewDate(
          appId,
          interview_date
        );
    }

    return res.status(200).json({
      message:
        "Bewerbung wurde erfolgreich aktualisiert.",
      application,
    });
  } catch (error) {
    next(error);
  }
}