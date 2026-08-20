import {
  describe,
  it,
  expect,
} from "vitest";


const API_URL = "http://localhost:3000";

describe("Backend E2E - GET /api/user/me", () => {

  it("soll 401 zurückgeben, wenn Benutzer nicht authentifiziert ist", async () => {

    const response = await fetch(
      `${API_URL}/api/user/me`
    );


    expect(response.status).toBe(401);


    const body = await response.json();


    expect(body).toEqual({
      message: "Nicht authentifiziert",
    });
  });


  it("soll authentifizierten Benutzer zurückgeben", async () => {

    /*
      1. Benutzer registrieren
    */
    const registerResponse = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: "test@example.com",
          password: "secret123",
          firstName: "Max",
          lastName: "Mustermann",
        }),
      }
    );


    expect(registerResponse.status).toBe(201);


    /*
      Register setzt bereits ein Cookie.
      Wir prüfen nur, ob eins vorhanden ist.
    */
    const registerCookie =
      registerResponse.headers.get(
        "set-cookie"
      );


    expect(registerCookie).toBeTruthy();


    /*
      2. Login
    */
    const loginResponse = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: "test@example.com",
          password: "secret123",
        }),
      }
    );


    expect(loginResponse.status).toBe(200);


    const cookie =
      loginResponse.headers.get(
        "set-cookie"
      );


    expect(cookie).toBeTruthy();


    /*
      3. Geschützten /me Endpoint
      mit echtem HTTP Cookie aufrufen.
    */
    const meResponse = await fetch(
      `${API_URL}/api/user/me`,
      {
        headers: {
          Cookie: cookie!,
        },
      }
    );


    expect(meResponse.status).toBe(200);


    const body = await meResponse.json();


    expect(body.user).toEqual({
      id: expect.any(Number),
      email: "test@example.com",
      first_name: "Max",
      last_name: "Mustermann",
      created_at: expect.any(String),
    });
  });


  it("soll nach Logout wieder 401 zurückgeben", async () => {

    /*
      1. Benutzer registrieren
    */
    const registerResponse = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: "logout1@example.com",
          password: "secret123",
          firstName: "Max",
          lastName: "Mustermann",
        }),
      }
    );


    expect(registerResponse.status).toBe(201);


    /*
      2. Login
    */
    const loginResponse = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: "logout1@example.com",
          password: "secret123",
        }),
      }
    );


    expect(loginResponse.status).toBe(200);


    const cookie =
      loginResponse.headers.get(
        "set-cookie"
      );


    expect(cookie).toBeTruthy();


    /*
      3. Vor Logout muss /me funktionieren.
    */
    const beforeLogout = await fetch(
      `${API_URL}/api/user/me`,
      {
        headers: {
          Cookie: cookie!,
        },
      }
    );


    expect(beforeLogout.status).toBe(200);


    /*
      4. Logout
    */
    const logoutResponse = await fetch(
      `${API_URL}/api/auth/logout`,
      {
        method: "POST",

        headers: {
          Cookie: cookie!,
        },
      }
    );


    expect(logoutResponse.status).toBe(200);


    const logoutBody =
      await logoutResponse.json();


    expect(logoutBody).toEqual({
      message: "Erfolgreich ausgeloggt.",
    });


    /*
      Express clearCookie() sollte
      ein Set-Cookie Header zurückgeben,
      der access_token löscht.
    */
    const clearCookie =
      logoutResponse.headers.get(
        "set-cookie"
      );


    expect(clearCookie).toBeTruthy();

    expect(clearCookie).toContain(
      "access_token="
    );


    /*
      fetch besitzt keinen automatischen
      Browser-Cookie-Store.

      Deshalb schicken wir beim nächsten
      Request bewusst kein altes Cookie.
    */
    const afterLogout = await fetch(
      `${API_URL}/api/user/me`
    );


    expect(afterLogout.status).toBe(401);


    const body =
      await afterLogout.json();


    expect(body).toEqual({
      message: "Nicht authentifiziert",
    });
  });

});