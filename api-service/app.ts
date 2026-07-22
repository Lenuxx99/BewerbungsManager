import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "./src/middleware/error.middleware";
import { authRouter } from "./src/modules/auth/auth.routes";
import { userRouter } from "./src/modules/user/user.routes";
import { gmailRouter } from "./src/modules/gmail/gmail.routes";

const app = express();

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


app.use("/api/gmail", gmailRouter);
/*
 * Zentrale Fehlerbehandlung.
 * Sollte immer als letzte Middleware registriert werden.
 */
app.use(errorMiddleware);

export default app;