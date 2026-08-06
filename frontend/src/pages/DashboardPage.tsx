import {
  useEffect,
  useState,
  useCallback,
  useDebugValue
} from "react";

import { Link } from "react-router";

import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

import "../styles/DashboardPage.css";

type ApplicationStatus =
  | "OFFEN"
  | "INTERVIEW"
  | "ZUGESAGT"
  | "ABGESAGT";

type ApplicationsType = {
  id: number;
  firma: string;
  stelle: string;
  datum: string;
  status: ApplicationStatus;
  notizen?: string;
};

type ErrorResponse = {
  message?: string;
};
const API_URL = "http://localhost:3000/api";
function DashboardPage() {
  const { user } = useAuth();

  const [applications, setApplications] = useState<ApplicationsType[]>([])

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(true);

  const [gmailConnected, setGmailConnected] =
    useState(false);

  const [
    isLoadingGmailStatus,
    setIsLoadingGmailStatus,
  ] = useState(true);

  const [
    gmailStatusError,
    setGmailStatusError,
  ] = useState("");

  const displayName =
    user?.first_name?.trim() || "Benutzer";

  function connectGmail() {
    window.location.href =
      `${API_URL}/gmail/connect`;
  }

  useEffect(() => {
    async function loadGmailStatus() {
      try {
        setGmailStatusError("");

        const response = await fetch(
          `${API_URL}/gmail/status`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Gmail-Status konnte nicht geladen werden."
          );
        }

        const data = await response.json();

        setGmailConnected(data.connected);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unbekannter Fehler";

        setGmailStatusError(message);
      } finally {
        setIsLoadingGmailStatus(false);
      }
    }

    void loadGmailStatus();
  }, []);

  const interviewCount = applications.filter(
    (e) => e.status === "INTERVIEW"
  ).length;

  const latestApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.datum).getTime() - new Date(a.datum).getTime()
    )
    .slice(0, 4);

  const loadApplications = useCallback(
    async () => {
      try {
        setError("");
        setIsLoading(true);

        const response = await fetch(
          `${API_URL}/applications`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errorData =
            data as ErrorResponse;

          setError(
            errorData.message ??
            "Bewerbungen konnten nicht geladen werden."
          );

          return;
        }

        setApplications(
          data as ApplicationsType[]
        );
      } catch (error) {
        console.error(error);

        setError(
          "Der Server ist nicht erreichbar."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

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
              Hier erhältst du einen vollständigen
              Überblick über deine Bewerbungen und
              eingehenden E-Mails.
            </p>
          </div>

          {/* <Link
            to="/applications"
            className="primary-action"
          >
            Bewerbung hinzufügen
          </Link> */}
        </header>
        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}
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
            {applications.length > 0 ? (
              <div>
                <strong className="statistic-value">
                  {applications.length}
                </strong>
                <p>Bewerbungen erfasst</p>
              </div>
            ) : (
              <div>
                <strong className="statistic-value">0</strong>
                <p>Noch keine Bewerbungen erfasst</p>
              </div>
            )}
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
              Wird durch E-Mail-Verarbeitung
              aktualisiert
            </p>
          </article>

          <article className="statistic-card">
            <div className="statistic-card-header">
              <span className="statistic-icon">✓</span>

              <span className="statistic-label">
                Einladungen
              </span>
            </div>

            {interviewCount > 0 ? (
              <div>
                <strong className="statistic-value">
                  {interviewCount}
                </strong>

                <p>
                  {interviewCount === 1
                    ? "Gespräch geplant"
                    : "Gespräche geplant"}
                </p>
              </div>
            ) : (
              <div>
                <strong className="statistic-value">
                  0
                </strong>

                <p>
                  Noch keine Gespräche geplant
                </p>
              </div>
            )}
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
            {applications.length > 0 ? (
              <div className="recent-applications">
                {latestApplications.map((application) => (
                  <div
                    key={application.id}
                    className="recent-application"
                  >
                    <div className="recent-application-content">
                      <div className="recent-application-icon">
                        ◧
                      </div>

                      <div className="recent-application-info">
                        <h4>{application.stelle}</h4>
                        <p>{application.firma}</p>
                      </div>
                    </div>

                    <div className="recent-application-meta">
                      <span className="application-date">
                        {formatDate(application.datum)}
                      </span>

                      <span
                        className={`application-status ${application.status?.toLowerCase() ?? ""
                          }`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  ◧
                </div>

                <h3>Noch keine Bewerbungen vorhanden</h3>

                <p>
                  Sobald du Bewerbungen hinzufügst oder E-Mails verarbeitet werden,
                  erscheinen sie an dieser Stelle.
                </p>

                <Link
                  to="/applications"
                  className="empty-state-action"
                >
                  Erste Bewerbung anlegen
                </Link>
              </div>
            )}

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
                    E-Mail-Verarbeitung vorbereiten
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
              automatisch analysiert, zugeordnet
              und als Statusänderung im Dashboard
              dargestellt.
            </p>

            {isLoadingGmailStatus ? (
              <p>
                Gmail-Status wird geprüft...
              </p>
            ) : gmailConnected ? (
              <div className="gmail-active-status">
                <div className="gmail-status-header">
                  <span className="gmail-status-dot" />

                  <div>
                    <strong>
                      Gmail-Verarbeitung aktiv
                    </strong>

                    <p className="gmail-status-text">
                      E-Mails werden automatisch im
                      Hintergrund synchronisiert,
                      analysiert und Bewerbungsjobs
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
      </main >
    </div >
  );
}

export default DashboardPage;