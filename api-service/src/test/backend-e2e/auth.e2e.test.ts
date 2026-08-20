import {
  describe,
  it,
  expect,
} from "vitest";

const API_URL = "http://localhost:3000";

describe("Backend E2E - Auth", () => {

  /*
   * Für jeden Test eine andere E-Mail verwenden,
   * damit die Tests sich nicht gegenseitig beeinflussen.
   */


  describe("POST /api/auth/register", () => {

    it("soll einen Benutzer registrieren", async () => {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: "register@example.com",
            password: "secret123",
            firstName: "Max",
            lastName: "Mustermann",
          }),
        }
      );

      expect(response.status).toBe(201);

      const body = await response.json();

      expect(body.user).toEqual({
        id: expect.any(Number),
        email: "register@example.com",
        firstName: "Max",
        lastName: "Mustermann",
      });


      // Register setzt bereits das access_token Cookie.
      const cookie =
        response.headers.get("set-cookie");

      expect(cookie).toBeTruthy();

      expect(cookie).toContain(
        "access_token="
      );

      expect(cookie).toContain(
        "HttpOnly"
      );
    });


    it("soll doppelte E-Mail ablehnen", async () => {
      const user = {
        email: "duplicate@example.com",
        password: "secret123",
        firstName: "Max",
        lastName: "Mustermann",
      };


      // Erster Register muss funktionieren.
      const firstResponse = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(user),
        }
      );

      expect(firstResponse.status)
        .toBe(201);


      // Derselbe Benutzer ein zweites Mal.
      const secondResponse = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(user),
        }
      );

      expect(secondResponse.status)
        .toBe(409);
    });

  });


  describe("POST /api/auth/login", () => {

    it("soll einen registrierten Benutzer einloggen", async () => {
      const user = {
        email: "login@example.com",
        password: "secret123",
        firstName: "Max",
        lastName: "Mustermann",
      };


      // Benutzer zuerst registrieren.
      const registerResponse = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(user),
        }
      );

      expect(registerResponse.status)
        .toBe(201);


      // Danach einloggen.
      const loginResponse = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        }
      );


      expect(loginResponse.status)
        .toBe(200);


      const body =
        await loginResponse.json();


      expect(body.user).toEqual({
        id: expect.any(Number),
        email: "login@example.com",
        firstName: "Max",
        lastName: "Mustermann",
      });


      /*
       * Der Login muss ein JWT-Cookie setzen.
       */
      const cookie =
        loginResponse.headers.get(
          "set-cookie"
        );


      expect(cookie).toBeTruthy();

      expect(cookie).toContain(
        "access_token="
      );

      expect(cookie).toContain(
        "HttpOnly"
      );
    });


    it("soll bei falschem Passwort 401 zurückgeben", async () => {
      const user = {
        email: "wrong-password@example.com",
        password: "secret123",
        firstName: "Max",
        lastName: "Mustermann",
      };


      await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(user),
        }
      );


      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: user.email,
            password: "falsches-passwort",
          }),
        }
      );


      expect(response.status)
        .toBe(401);
    });


    it("soll bei unbekannter E-Mail 401 zurückgeben", async () => {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: "unknown@example.com",
            password: "secret123",
          }),
        }
      );


      expect(response.status)
        .toBe(401);
    });

  });


  describe("Auth Flow", () => {

    it("soll Register → Login → /me durchführen", async () => {
      const user = {
        email: "flow@example.com",
        password: "secret123",
        firstName: "Max",
        lastName: "Mustermann",
      };


      // 1. Register
      const registerResponse = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(user),
        }
      );


      expect(registerResponse.status)
        .toBe(201);


      // 2. Login
      const loginResponse = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        }
      );


      expect(loginResponse.status)
        .toBe(200);


      const cookie =
        loginResponse.headers.get(
          "set-cookie"
        );


      expect(cookie).toBeTruthy();


      // 3. Geschützten Endpoint aufrufen.
      const meResponse = await fetch(
        `${API_URL}/api/user/me`,
        {
          headers: {
            Cookie: cookie!,
          },
        }
      );


      expect(meResponse.status)
        .toBe(200);


      const body =
        await meResponse.json();


      expect(body.user).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          email: "flow@example.com",
          first_name: "Max",
          last_name: "Mustermann",
        })
      );
    });


    it("soll Logout durchführen", async () => {
      const user = {
        email: "logout@example.com",
        password: "secret123",
        firstName: "Max",
        lastName: "Mustermann",
      };


      // Register
      await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(user),
        }
      );


      // Login
      const loginResponse = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        }
      );


      const cookie =
        loginResponse.headers.get(
          "set-cookie"
        );


      expect(cookie).toBeTruthy();


      // Logout
      const logoutResponse = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",

          headers: {
            Cookie: cookie!,
          },
        }
      );


      expect(logoutResponse.status)
        .toBe(200);


      const body =
        await logoutResponse.json();


      expect(body).toEqual({
        message:
          "Erfolgreich ausgeloggt.",
      });


      /*
       * Express clearCookie() sendet ein neues
       * Set-Cookie, welches access_token löscht.
       */
      const clearCookie =
        logoutResponse.headers.get(
          "set-cookie"
        );


      expect(clearCookie)
        .toBeTruthy();

      expect(clearCookie)
        .toContain("access_token=");
    });

  });

});