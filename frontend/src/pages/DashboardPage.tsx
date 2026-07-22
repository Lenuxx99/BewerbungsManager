import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router";

import { useAuth } from "../context/AuthContext";
import "../styles/DashboardPage.css";

function DashboardPage() {
  const { user, clearUser } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const [logoutError, setLogoutError] =
    useState("");

  const [gmailConnected, setGmailConnected] = useState(false);

  const [isLoadingGmailStatus, setIsLoadingGmailStatus] = useState(true);

  const [gmailStatusError, setGmailStatusError] = useState("");
  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout fehlgeschlagen.");
      }

      clearUser();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Beim Logout ist ein Fehler aufgetreten.";

      setLogoutError(message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  const displayName =
    user?.first_name?.trim() || "Benutzer";

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""
    }`.toUpperCase() || "BM";


  function connectGmail() {
    window.location.href =
      `http://localhost:3000/api/gmail/connect`;
  }

  useEffect(() => {
    async function loadGmailStatus() {
      try {
        setGmailStatusError("");

        const response = await fetch(
          "http://localhost:3000/api/gmail/status",
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Gmail-Status konnte nicht geladen werden.",
          );
        }

        const data = await response.json();

        setGmailConnected(data.connected);
      } catch (error) {
        setGmailStatusError(
          error instanceof Error
            ? error.message
            : "Unbekannter Fehler",
        );
      } finally {
        setIsLoadingGmailStatus(false);
      }
    }

    void loadGmailStatus();
  }, []);
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div>
          <Link
            to="/dashboard"
            className="dashboard-brand"
          >
            <span className="brand-icon">BM</span>

            <span>
              <strong>Bewerbungsmanager</strong>
              <small>Dein Karriere-Dashboard</small>
            </span>
          </Link>

          <nav className="dashboard-navigation">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                isActive
                  ? "navigation-link active"
                  : "navigation-link"
              }
            >
              <span className="navigation-icon">
                ◫
              </span>
              Übersicht
            </NavLink>

            <NavLink
              to="/applications"
              className={({ isActive }) =>
                isActive
                  ? "navigation-link active"
                  : "navigation-link"
              }
            >
              <span className="navigation-icon">
                ◧
              </span>
              Bewerbungen
            </NavLink>

            <button
              type="button"
              className="navigation-link navigation-button"
              disabled
            >
              <span className="navigation-icon">
                ✉
              </span>
              E-Mail-Verarbeitung
              <span className="navigation-badge">
                Bald
              </span>
            </button>

            <button
              type="button"
              className="navigation-link navigation-button"
              disabled
            >
              <span className="navigation-icon">
                ◷
              </span>
              Termine
              <span className="navigation-badge">
                Bald
              </span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {initials}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {user?.first_name} {user?.last_name}
              </strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut
              ? "Wird abgemeldet..."
              : "Abmelden"}
          </button>

          {logoutError && (
            <p className="logout-error">
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              Übersicht
            </p>

            <h1>
              Willkommen zurück, {displayName}
            </h1>

            <p className="dashboard-subtitle">
              Hier erhältst du später einen
              vollständigen Überblick über deine
              Bewerbungen und eingehenden E-Mails.
            </p>
          </div>

          <Link
            to="/applications"
            className="primary-action"
          >
            Bewerbung hinzufügen
          </Link>
        </header>

        <section
          className="statistics-grid"
          aria-label="Bewerbungsstatistiken"
        >
          <article className="statistic-card">
            <div className="statistic-card-header">
              <span className="statistic-icon">
                ◧
              </span>
              <span className="statistic-label">
                Bewerbungen
              </span>
            </div>

            <strong className="statistic-value">
              0
            </strong>

            <p>
              Noch keine Bewerbungen erfasst
            </p>
          </article>

          <article className="statistic-card">
            <div className="statistic-card-header">
              <span className="statistic-icon">
                ✉
              </span>
              <span className="statistic-label">
                Neue Nachrichten
              </span>
            </div>

            <strong className="statistic-value">
              0
            </strong>

            <p>
              Wird durch E-Mail-Processing
              aktualisiert
            </p>
          </article>

          <article className="statistic-card">
            <div className="statistic-card-header">
              <span className="statistic-icon">
                ✓
              </span>
              <span className="statistic-label">
                Einladungen
              </span>
            </div>

            <strong className="statistic-value">
              0
            </strong>

            <p>
              Noch keine Gespräche geplant
            </p>
          </article>

          <article className="statistic-card">
            <div className="statistic-card-header">
              <span className="statistic-icon">
                ◷
              </span>
              <span className="statistic-label">
                Offene Aufgaben
              </span>
            </div>

            <strong className="statistic-value">
              0
            </strong>

            <p>
              Keine ausstehenden Aktionen
            </p>
          </article>
        </section>

        <section className="dashboard-content-grid">
          <article className="dashboard-panel applications-panel">
            <div className="panel-header">
              <div>
                <h2>Letzte Bewerbungen</h2>
                <p>
                  Deine zuletzt bearbeiteten
                  Bewerbungen erscheinen hier.
                </p>
              </div>

              <Link
                to="/applications"
                className="secondary-link"
              >
                Alle ansehen
              </Link>
            </div>

            <div className="empty-state">
              <div className="empty-state-icon">
                ◧
              </div>

              <h3>
                Noch keine Bewerbungen vorhanden
              </h3>

              <p>
                Sobald du Bewerbungen hinzufügst
                oder E-Mails verarbeitet werden,
                erscheinen sie an dieser Stelle.
              </p>

              <Link
                to="/applications"
                className="empty-state-action"
              >
                Erste Bewerbung anlegen
              </Link>
            </div>
          </article>

          <aside className="dashboard-panel activity-panel">
            <div className="panel-header">
              <div>
                <h2>Aktivitäten</h2>
                <p>
                  Automatisch erkannte Ereignisse
                </p>
              </div>
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" />

                <div>
                  <strong>
                    E-Mail-Processing vorbereiten
                  </strong>
                  <p>
                    Nach der Integration erscheinen
                    hier neue Statusänderungen.
                  </p>
                </div>
              </div>

              <div className="activity-item muted">
                <div className="activity-dot" />

                <div>
                  <strong>
                    Noch keine Aktivitäten
                  </strong>
                  <p>
                    Neue Ereignisse werden
                    automatisch eingetragen.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="dashboard-panel processing-panel">
          <div>
            <h2>
              Automatische E-Mail-Verarbeitung
            </h2>

            <p style={{ marginBottom: "15px" }}>
              Eingehende Bewerbungs-E-Mails werden
              später automatisch analysiert,
              zugeordnet und als Statusänderung im
              Dashboard dargestellt.
            </p>
            {isLoadingGmailStatus ? (
              <p>Gmail-Status wird geprüft...</p>
            ) : gmailConnected ? (
              <div className="gmail-active-status">
                <div className="gmail-status-header">
                  <span className="gmail-status-dot"></span>

                  <div>
                    <strong>Gmail-Verarbeitung aktiv</strong>
                    <p className="gmail-status-text">
                      E-Mails werden automatisch im Hintergrund
                      synchronisiert, analysiert und Bewerbungsjobs
                      werden erkannt.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="empty-state-action"
                style={{
                  cursor: "pointer",
                  border: "none",
                }}
                type="button"
                onClick={connectGmail}
              >
                Gmail-Zugriff erlauben
              </button>
            )}

            {gmailStatusError && (
              <p className="gmail-error">
                {gmailStatusError}
              </p>
            )}
          </div>

          <div className="processing-steps">
            <div>
              <span>1</span>
              E-Mail empfangen
            </div>

            <div>
              <span>2</span>
              Inhalt analysieren
            </div>

            <div>
              <span>3</span>
              Bewerbung aktualisieren
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;