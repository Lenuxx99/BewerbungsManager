import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext";
import "../styles/ProtectedRoute.css";
type AuthMode = "login" | "register";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function checkExistingLogin() {
      const isAuthenticated = await refreshUser();

      if (!isMounted) {
        return;
      }

      if (isAuthenticated) {
        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      setIsCheckingAuth(false);
    }

    checkExistingLogin();

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
    event: any
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const endpoint =
      mode === "login"
        ? "http://localhost:3000/api/auth/login"
        : "http://localhost:3000/api/auth/register";

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
          data.message || "Ein Fehler ist aufgetreten"
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ein unbekannter Fehler ist aufgetreten";

      setError(message);
    } finally {
      setIsLoading(false);
    }
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
            Bitte einen Moment Geduld. Deine Sitzung wird
            sicher überprüft.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Bewerbungsmanager</h1>

          <p>
            {mode === "login"
              ? "Melde dich an, um deine Bewerbungen zu verwalten."
              : "Erstelle ein Konto und starte mit deinen Bewerbungen."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Login
          </button>

          <button
            type="button"
            className={
              mode === "register" ? "active" : ""
            }
            onClick={() => switchMode("register")}
          >
            Registrieren
          </button>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {mode === "register" && (
            <div className="name-fields">
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
                  autoComplete="off"
                  required
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
                  autoComplete="off"
                  required
                />
              </div>
            </div>
          )}

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
              autoComplete="off"
              required
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
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="error-message">{error}</p>
          )}

          <button
            className="submit-button"
            type="submit"
            disabled={isLoading}
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