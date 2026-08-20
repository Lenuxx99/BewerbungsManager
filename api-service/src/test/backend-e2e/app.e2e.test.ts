import {
  describe,
  it,
  expect,
} from "vitest";

const API_URL = "http://localhost:3000";


async function registerAndLogin(
  email: string
) {
  await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: "secret123",
        firstName: "Max",
        lastName: "Mustermann",
      }),
    }
  );


  const loginResponse = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: "secret123",
      }),
    }
  );


  expect(loginResponse.status).toBe(200);


  const cookie =
    loginResponse.headers.get("set-cookie");


  expect(cookie).toBeTruthy();


  return cookie!;
}


describe("Backend E2E - Applications", () => {

  describe("POST /api/applications", () => {

    it("soll eine Bewerbung erstellen", async () => {

      const cookie =
        await registerAndLogin(
          "app-create@example.com"
        );


      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Cookie: cookie,
          },

          body: JSON.stringify({
            firma: "Siemens",
            stelle:
              "Software Entwickler",
            datum: "2026-08-19",
            status: "OFFEN",
            notizen:
              "E2E Test Bewerbung",
          }),
        }
      );


      expect(response.status)
        .toBe(201);


      const body =
        await response.json();


      expect(body.application)
        .toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            firma: "Siemens",
            stelle:
              "Software Entwickler",
            status: "OFFEN",
            notizen:
              "E2E Test Bewerbung",
          })
        );
    });


    it("soll ohne Authentifizierung 401 zurückgeben", async () => {

      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            firma: "Siemens",
            stelle:
              "Software Entwickler",
            datum: "2026-08-19",
          }),
        }
      );


      expect(response.status)
        .toBe(401);
    });

  });


  describe("GET /api/applications", () => {

    it("soll Bewerbungen des eingeloggten Users zurückgeben", async () => {

      const cookie =
        await registerAndLogin(
          "app-get@example.com"
        );


      await fetch(
        `${API_URL}/api/applications`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Cookie: cookie,
          },

          body: JSON.stringify({
            firma: "BMW",
            stelle:
              "Backend Entwickler",
            datum: "2026-08-19",
            status: "OFFEN",
          }),
        }
      );


      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          headers: {
            Cookie: cookie,
          },
        }
      );


      expect(response.status)
        .toBe(200);


      const body =
        await response.json();


      expect(Array.isArray(body))
        .toBe(true);


      expect(body.length)
        .toBeGreaterThan(0);


      expect(body)
        .toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              firma: "BMW",
              stelle:
                "Backend Entwickler",
              status: "OFFEN",
            }),
          ])
        );
    });

  });


  describe("PATCH /api/applications/:appId", () => {

    it("soll Status aktualisieren", async () => {

      const cookie =
        await registerAndLogin(
          "app-status@example.com"
        );


      const createResponse =
        await fetch(
          `${API_URL}/api/applications`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Cookie: cookie,
            },

            body: JSON.stringify({
              firma: "Siemens",
              stelle:
                "Software Entwickler",
              datum: "2026-08-19",
              status: "OFFEN",
            }),
          }
        );


      const createdBody =
        await createResponse.json();

      const appId =
        createdBody.application.id;


      const updateResponse =
        await fetch(
          `${API_URL}/api/applications/${appId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Cookie: cookie,
            },

            body: JSON.stringify({
              status: "ZUGESAGT",
            }),
          }
        );


      expect(updateResponse.status)
        .toBe(200);


      const body =
        await updateResponse.json();


      expect(
        body.application.status
      ).toBe("ZUGESAGT");
    });


    it("soll Notizen aktualisieren", async () => {

      const cookie =
        await registerAndLogin(
          "app-notes@example.com"
        );


      const createResponse =
        await fetch(
          `${API_URL}/api/applications`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Cookie: cookie,
            },

            body: JSON.stringify({
              firma: "Bosch",
              stelle:
                "Hardware Entwickler",
              datum: "2026-08-19",
              status: "OFFEN"
            }),
          }
        );


      const createdBody =
        await createResponse.json();

      const appId =
        createdBody.application.id;


      const updateResponse =
        await fetch(
          `${API_URL}/api/applications/${appId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Cookie: cookie,
            },

            body: JSON.stringify({
              notizen:
                "Neue E2E Notiz",
            }),
          }
        );


      expect(updateResponse.status)
        .toBe(200);


      const body =
        await updateResponse.json();


      expect(
        body.application.notizen
      ).toBe(
        "Neue E2E Notiz"
      );
    });


    it("soll Interview-Datum setzen", async () => {

      const cookie =
        await registerAndLogin(
          "app-interview@example.com"
        );


      const createResponse =
        await fetch(
          `${API_URL}/api/applications`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Cookie: cookie,
            },

            body: JSON.stringify({
              firma: "Siemens",
              stelle:
                "Software Entwickler",
              datum: "2026-08-19",
              status: "OFFEN",
            }),
          }
        );


      const createdBody =
        await createResponse.json();

      const appId =
        createdBody.application.id;


      const interviewDate =
        "2099-08-25T10:00:00.000Z";


      const response = await fetch(
        `${API_URL}/api/applications/${appId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Cookie: cookie,
          },

          body: JSON.stringify({
            interview_date:
              interviewDate,
          }),
        }
      );


      expect(response.status)
        .toBe(200);


      const body =
        await response.json();


      expect(
        body.application.status
      ).toBe("INTERVIEW");


      expect(
        body.application
          .interview_date
      ).toBe(interviewDate);
    });

  });


  describe("GET /api/applications/termine", () => {
    it("soll Interview-Termine zurückgeben", async () => {
      const cookie =
        await registerAndLogin(
          "app-termine@example.com"
        );

      const createResponse =
        await fetch(
          `${API_URL}/api/applications`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
              Cookie: cookie,
            },

            body: JSON.stringify({
              firma: "Siemens",
              stelle:
                "Software Entwickler",
              datum: "2026-08-20",
              status: "OFFEN",
            }),
          }
        );

      expect(createResponse.status)
        .toBe(201);

      const createdBody =
        await createResponse.json();

      const appId =
        createdBody.application.id;


      const updateResponse =
        await fetch(
          `${API_URL}/api/applications/${appId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
              Cookie: cookie,
            },

            body: JSON.stringify({
              interview_date:
                "2099-08-25T10:00:00.000Z",
            }),
          }
        );

      expect(updateResponse.status)
        .toBe(200);


      const response = await fetch(
        `${API_URL}/api/applications/termine`,
        {
          headers: {
            Cookie: cookie,
          },
        }
      );

      expect(response.status)
        .toBe(200);

      const body =
        await response.json();

      expect(Array.isArray(body))
        .toBe(true);

      expect(body)
        .toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: appId,
              firma: "Siemens",
              status: "INTERVIEW",
            }),
          ])
        );
    });
  });

});