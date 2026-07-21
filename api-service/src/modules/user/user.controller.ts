import { Response, Request, NextFunction } from "express";

import { userService } from "./user.service";


export async function getUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Nicht authentifiziert",
            });
        }
        const user = await userService.getMe(req.userId);

        return res.status(200).json({
            user
        })
    } catch (error) {
        return next(error);
    }
}