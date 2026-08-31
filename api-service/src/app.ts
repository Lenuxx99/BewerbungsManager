import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "./middleware/error.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/user/user.routes";
import { gmailRouter } from "./modules/gmail/gmail.routes";
import { appRouter } from "./modules/application/app.routes";

export const app = express();

/*
 * Erlaubt Anfragen vom React-Frontend (in Entwicklung).
 *
 * credentials: true
 * ist notwendig, damit Cookies (access_token)
 * zwischen Frontend und Backend übertragen werden.
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/*
 * Liest Cookies aus der Anfrage.
 * Danach stehen sie unter:
 * req.cookies
 */
app.use(cookieParser());


/*
 * Wandelt JSON aus dem Request Body
 * in ein JavaScript-Objekt um.
 */
app.use(express.json());


/*
 * Öffentliche Auth-Routen.
 *
 * POST /api/auth/login
 * Body: { email: string; password: string }
 *
 * POST /api/auth/register
 * Body: {
 *   email: string;
 *   password: string;
 *   firstName: string;
 *   lastName: string;
 * }
 *
 * POST /api/auth/logout
 * Body: {}
 *
 * POST /api/auth/google
 * Body: { credential: string }
 */
app.use("/api/auth", authRouter);


/*
 * Geschützte User-Routen.
 *
 * Die Authentication-Middleware befindet sich
 * innerhalb der einzelnen Routen.
 */
app.use("/api/user", userRouter);


/*
 * Geschützte Bewerbungs-Routen.
 *
 * POST /api/applications
 * Body:
 * {
 *   "firma": string,
 *   "stelle": string,
 *   "datum": string,      // Format: YYYY-MM-DD
 *   "status": "OFFEN" | "INTERVIEW" | "ZUGESAGT" | "ABGESAGT",
 *   "notizen"?: string
 * }
 *
 * GET /api/applications
 * Body: {}
 *
 * Liefert alle Bewerbungen des
 * angemeldeten Benutzers zurück.
 *
 * DELETE /api/applications/:appId
 * Body: {}
 *
 * Löscht die Bewerbung mit der
 * angegebenen ID.
 *
 * PATCH /api/applications/:appId
 * Body:
 * {
 *   "status": "OFFEN" | "INTERVIEW" | "ZUGESAGT" | "ABGESAGT"
 * }
 *
 * Aktualisiert den Status der
 * angegebenen Bewerbung.
 */
app.use("/api/applications", appRouter);


app.use("/api/gmail", gmailRouter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

/*
 * Zentrale Fehlerbehandlung.
 * Sollte immer als letzte Middleware registriert werden.
 */
app.use(errorMiddleware);

export default app;