import "express";

/*
 * In der Authentication-Middleware speichern wir die userId
 * aus dem JWT im Request-Objekt:
 *
 *    req.userId = payload.userId;
 *
 * Der Controller kann anschließend über req.userId
 * auf die Benutzer-ID zugreifen.
 *
 * Problem:
 * TypeScript kennt die Eigenschaft "userId" nicht,
 * weil das Express-Request-Interface sie standardmäßig
 * nicht besitzt.
 *
 * Deshalb erweitern wir hier das bestehende Request-Interface
 * von Express um die Eigenschaft "userId".
 */
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export {};