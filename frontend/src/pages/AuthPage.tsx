import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router";
import {
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

import { useAuth } from "../context/AuthContext";
import "../styles/ProtectedRoute.css";

type AuthMode = "login" | "register";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const API_URL = "http://localhost:3000/api";

function AuthPage() {
  const [mode, setMode] =
    useState<AuthMode>("login");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  const [isGoogleLoading, setIsGoogleLoading] =
    useState(false);

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [formData, setFormData] =
    useState<FormData>({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });

  useEffect(() => {
    let isMounted = true;

    async function checkExistingLogin() {
      try {
        const isAuthenticated =
          await refreshUser();

        if (!isMounted) {
          return;
        }

        if (isAuthenticated) {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    void checkExistingLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, refreshUser]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const endpoint =
      mode === "login"
        ? `${API_URL}/auth/login`
        : `${API_URL}/auth/register`;

    const requestBody =
      mode === "login"
        ? {
          email: formData.email,
          password: formData.password,
        }
        : formData;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Ein Fehler ist aufgetreten."
        );
      }

      const isAuthenticated =
        await refreshUser();

      if (!isAuthenticated) {
        throw new Error(
          "Die Anmeldung konnte nicht bestätigt werden."
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSuccess(
    credentialResponse: CredentialResponse
  ) {
    const credential = credentialResponse.credential;

    if (!credential) {
      setError(
        "Google hat kein gültiges Credential zurückgegeben."
      );

      return;
    }

    setError("");
    setIsGoogleLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Google-Anmeldung fehlgeschlagen."
        );
      }

      const isAuthenticated =
        await refreshUser();

      if (!isAuthenticated) {
        throw new Error(
          "Die Google-Anmeldung konnte nicht bestätigt werden."
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Google-Anmeldung fehlgeschlagen.";

      setError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handleGoogleError() {
    setError(
      "Die Google-Anmeldung wurde abgebrochen oder ist fehlgeschlagen."
    );
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setError("");

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
  }

  if (isCheckingAuth) {
    return (
      <main className="auth-loading">
        <div className="auth-loading-card">
          <div className="auth-loading-logo">
            BM
          </div>

          <div className="auth-loading-spinner" />

          <h2>Anmeldung wird geprüft</h2>

          <p>
            Bitte einen Moment Geduld. Deine
            Sitzung wird sicher überprüft.
          </p>
        </div>
      </main>
    );
  }

  const authenticationInProgress =
    isLoading || isGoogleLoading;

  return (
    <main className="auth-page">
      <section
        className={`auth-card ${mode === "register" ? "auth-card-register" : "auth-card-login"
          }`}
      >
        <div className="auth-header">
          <h1>Bewerbungsmanager</h1>

          <p>
            {mode === "login"
              ? "Melde dich an, um deine Bewerbungen zu verwalten."
              : "Erstelle ein Konto und starte mit deinen Bewerbungen."}
          </p>
        </div>



        <div className="google-login-container">
          {isGoogleLoading ? (
            <button
              type="button"
              className="google-loading-button"
              disabled
            >
              Google-Anmeldung läuft...
            </button>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                void handleGoogleSuccess(
                  credentialResponse
                );
              }}
              onError={handleGoogleError}
              text={"continue_with"

              }
              shape="rectangular"
              theme="outline"
              size="large"
              width="100%"
            />
          )}
        </div>

        <div className="auth-divider">
          <span>oder</span>
        </div>
        <div className="auth-tabs">
          <button
            type="button"
            className={
              mode === "login" ? "active" : ""
            }
            onClick={() => switchMode("login")}
            disabled={authenticationInProgress}
          >
            Login
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "active"
                : ""
            }
            onClick={() =>
              switchMode("register")
            }
            disabled={authenticationInProgress}
          >
            Registrieren
          </button>
        </div>
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div
            className={`name-fields ${mode === "register"
              ? "name-fields--open"
              : "name-fields--closed"
              }`}
            aria-hidden={mode !== "register"}
          >
            <div className="form-group">
              <label htmlFor="firstName">
                Vorname
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Max"
                autoComplete="given-name"
                required={mode === "register"}
                disabled={
                  authenticationInProgress ||
                  mode !== "register"
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Nachname
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Mustermann"
                autoComplete="family-name"
                required={mode === "register"}
                disabled={
                  authenticationInProgress ||
                  mode !== "register"
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              E-Mail-Adresse
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="max@example.com"
              autoComplete="email"
              required
              disabled={authenticationInProgress}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Passwort
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mindestens 8 Zeichen"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={8}
              required
              disabled={authenticationInProgress}
            />
          </div>

          {error && (
            <p
              className="error-message"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="submit-button"
            type="submit"
            disabled={authenticationInProgress}
          >
            {isLoading
              ? "Bitte warten..."
              : mode === "login"
                ? "Einloggen"
                : "Konto erstellen"}
          </button>
        </form>

        <p className="switch-text">
          {mode === "login"
            ? "Du hast noch kein Konto?"
            : "Du hast bereits ein Konto?"}

          <button
            type="button"
            disabled={authenticationInProgress}
            onClick={() =>
              switchMode(
                mode === "login"
                  ? "register"
                  : "login"
              )
            }
          >
            {mode === "login"
              ? "Registrieren"
              : "Einloggen"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default AuthPage;