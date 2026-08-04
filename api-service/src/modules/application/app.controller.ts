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