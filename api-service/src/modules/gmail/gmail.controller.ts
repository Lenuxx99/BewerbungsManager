import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { gmailService } from "./gmail.service";

export const gmailController = {
    async connect(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    message: "Nicht authentifiziert",
                });
            }
            const userId = req.userId;

            const authorizationUrl =
                await gmailService.connect(userId);

            res.redirect(authorizationUrl);
        } catch (error) {
            next(error);
        }
    },

    async callback(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const code =
                typeof req.query.code === "string"
                    ? req.query.code
                    : null;

            const state =
                typeof req.query.state === "string"
                    ? req.query.state
                    : null;

            if (!code || !state) {
                res.status(400).json({
                    message: "Code oder State fehlt.",
                });
                return;
            }

            await gmailService.handleCallback({
                code,
                state,
            });

            res.redirect(
                `${process.env.FRONTEND_URL}/dashboard`,
            );
        } catch (error) {
            next(error);
        }
    },

    async getStatus(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    message: "Nicht authentifiziert",
                });
            }
            const userId = req.userId;

            const status =
                await gmailService.getConnectionStatus(userId);

            res.status(200).json(status);
        } catch (error) {
            next(error);
        }
    }
};

