import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/TerminePage.css";
const API_URL = "http://localhost:3000/api";

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
    notizen: string | null;
    interview_date: string | null;
    interview_notizen: string | null;
};

function formatDate(dateValue: string) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Ungültiges Datum";
    }

    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function formatTime(dateValue: string) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatMonth(dateValue: string) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("de-DE", {
        month: "short",
    }).format(date);
}

function formatDay(dateValue: string) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
    }).format(date);
}

function getDaysUntil(dateValue: string) {
    const today = new Date();
    const interviewDate = new Date(dateValue);

    if (Number.isNaN(interviewDate.getTime())) {
        return null;
    }

    today.setHours(0, 0, 0, 0);
    interviewDate.setHours(0, 0, 0, 0);

    const difference =
        interviewDate.getTime() - today.getTime();

    return Math.round(
        difference / (1000 * 60 * 60 * 24)
    );
}

export default function TerminePage() {
    const [apps, setApps] = useState<ApplicationsType[]>([]);

    const [selectedApp, setSelectedApp] =
        useState<ApplicationsType | null>(null);

    const [notes, setNotes] = useState("");
    const [interviewNotes, setInterviewNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");

    useEffect(() => {
        const getData = async () => {
            try {
                setError("");

                const response = await fetch(
                    `${API_URL}/applications/termine`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    const result = await response.json();

                    setError(
                        result.message ??
                            "Termine konnten nicht geladen werden."
                    );

                    return;
                }

                const result: ApplicationsType[] =
                    await response.json();
                console.log(result)
                setApps(result);
            } catch {
                setError(
                    "Der Server konnte nicht erreicht werden."
                );
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    const handleSelectApplication = (
        app: ApplicationsType
    ) => {
        setSelectedApp(app);

        setNotes(app.notizen ?? "");
        setInterviewNotes(app.interview_notizen ?? "");

        setSaveError("");
        setSaveSuccess("");
    };

    const closeApplication = () => {
        setSelectedApp(null);
        setNotes("");
        setInterviewNotes("");

        setSaveError("");
        setSaveSuccess("");
    };

    const handleSaveNotes = async () => {
        if (!selectedApp) {
            return;
        }

        try {
            setSaving(true);
            setSaveError("");
            setSaveSuccess("");

            /*
                Passe URL und HTTP-Methode an deinen
                Backend-Endpoint an.
            */
            const response = await fetch(
                `${API_URL}/applications/${selectedApp.id}`,
                {
                    method: "PATCH",
                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        notizen: notes,
                        interview_notizen: interviewNotes,
                    }),
                }
            );

            if (!response.ok) {
                const result = await response.json();

                setSaveError(
                    result.message ??
                        "Notizen konnten nicht gespeichert werden."
                );

                return;
            }

            /*
                Lokalen State aktualisieren.
                Dadurch muss die Terminliste nicht
                komplett neu geladen werden.
            */
            setApps((currentApps) =>
                currentApps.map((app) =>
                    app.id === selectedApp.id
                        ? {
                              ...app,
                              notizen: notes || null,
                              interview_notizen:
                                  interviewNotes || null,
                          }
                        : app
                )
            );

            setSelectedApp((currentApp) =>
                currentApp
                    ? {
                          ...currentApp,
                          notizen: notes || null,
                          interview_notizen:
                              interviewNotes || null,
                      }
                    : null
            );

            setSaveSuccess(
                "Notizen wurden erfolgreich gespeichert."
            );
        } catch {
            setSaveError(
                "Der Server konnte nicht erreicht werden."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
        Backend liefert Termine bereits sortiert.

        Wir filtern hier nur zukünftige Termine,
        damit wir den nächsten Termin bestimmen können.
    */
    const upcomingAppointments = apps.filter((app) => {
        if (!app.interview_date) {
            return false;
        }

        return (
            new Date(app.interview_date).getTime() >=
            Date.now()
        );
    });

    /*
        Da Backend ASC sortiert:
        [0] = nächster zukünftiger Termin.
    */
    const nextAppointment = upcomingAppointments[0];

    const now = new Date();

    const interviewsThisMonth = apps.filter((app) => {
        if (!app.interview_date) {
            return false;
        }

        const interviewDate = new Date(
            app.interview_date
        );

        return (
            interviewDate.getMonth() === now.getMonth() &&
            interviewDate.getFullYear() ===
                now.getFullYear()
        );
    }).length;

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                {/* HEADER */}

                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-eyebrow">
                            Bewerbungen
                        </p>

                        <h1>Meine Termine</h1>

                        <p className="dashboard-subtitle">
                            Behalte deine Bewerbungsgespräche
                            im Blick und verwalte deine
                            Bewerbungs- und Interviewnotizen.
                        </p>
                    </div>
                </header>

                {/* GLOBALER FEHLER */}

                {error && (
                    <div
                        className="dashboard-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* STATISTIKEN */}

                <section className="statistics-grid">
                    {/* Kommende Termine */}

                    <article className="statistic-card">
                        <div className="statistic-card-header">
                            <div className="statistic-icon">
                                K
                            </div>

                            <span className="statistic-label">
                                Kommende Termine
                            </span>
                        </div>

                        <strong className="statistic-value">
                            {
                                upcomingAppointments.length
                            }
                        </strong>

                        <p>
                            Noch bevorstehende
                            Bewerbungsgespräche
                        </p>
                    </article>

                    {/* Monat */}

                    <article className="statistic-card">
                        <div className="statistic-card-header">
                            <div className="statistic-icon">
                                M
                            </div>

                            <span className="statistic-label">
                                Diesen Monat
                            </span>
                        </div>

                        <strong className="statistic-value">
                            {interviewsThisMonth}
                        </strong>

                        <p>
                            Interviews im aktuellen Monat
                        </p>
                    </article>

                    {/* Nächster Termin */}

                    <article className="statistic-card">
                        <div className="statistic-card-header">
                            <div className="statistic-icon">
                                N
                            </div>

                            <span className="statistic-label">
                                Nächster Termin
                            </span>
                        </div>

                        <strong className="statistic-value statistic-date-value">
                            {nextAppointment?.interview_date
                                ? formatDate(
                                      nextAppointment.interview_date
                                  )
                                : "–"}
                        </strong>

                        <p>
                            {nextAppointment
                                ? nextAppointment.firma
                                : "Kein Termin geplant"}
                        </p>
                    </article>

                    {/* Alle Interviews */}

                    <article className="statistic-card">
                        <div className="statistic-card-header">
                            <div className="statistic-icon">
                                I
                            </div>

                            <span className="statistic-label">
                                Interviews
                            </span>
                        </div>

                        <strong className="statistic-value">
                            {apps.length}
                        </strong>

                        <p>
                            Alle Interview-Bewerbungen
                        </p>
                    </article>
                </section>

                {/* CONTENT */}

                <section className="dashboard-content-grid">
                    {/* LINKE SEITE */}

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div>
                                <h2>
                                    Bewerbungsgespräche
                                </h2>

                                <p>
                                    Klicke auf eine Bewerbung,
                                    um Details und Notizen zu
                                    bearbeiten.
                                </p>
                            </div>
                        </div>

                        {/* LOADING */}

                        {loading && (
                            <div className="appointments-loading">
                                Termine werden geladen...
                            </div>
                        )}

                        {/* TERMINLISTE */}

                        {!loading && apps.length > 0 && (
                            <div className="appointments-list">
                                {apps.map((item) => {
                                    if (
                                        !item.interview_date
                                    ) {
                                        return null;
                                    }

                                    const days =
                                        getDaysUntil(
                                            item.interview_date
                                        );

                                    return (
                                        <button
                                            type="button"
                                            className={`appointment-card appointment-button ${
                                                selectedApp?.id ===
                                                item.id
                                                    ? "appointment-selected"
                                                    : ""
                                            }`}
                                            key={item.id}
                                            onClick={() =>
                                                handleSelectApplication(
                                                    item
                                                )
                                            }
                                        >
                                            {/* DATUM LINKS */}

                                            <div className="appointment-date-box">
                                                <span>
                                                    {formatMonth(
                                                        item.interview_date
                                                    )}
                                                </span>

                                                <strong>
                                                    {formatDay(
                                                        item.interview_date
                                                    )}
                                                </strong>
                                            </div>

                                            {/* CONTENT */}

                                            <div className="appointment-content">
                                                <div className="appointment-heading">
                                                    <div>
                                                        <h3>
                                                            {
                                                                item.stelle
                                                            }
                                                        </h3>

                                                        <p>
                                                            {
                                                                item.firma
                                                            }
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`application-status ${item.status.toLowerCase()}`}
                                                    >
                                                        {
                                                            item.status
                                                        }
                                                    </span>
                                                </div>

                                                {/* DATUM / ZEIT */}

                                                <div className="appointment-details">
                                                    <span>
                                                        Datum:{" "}
                                                        {formatDate(
                                                            item.interview_date
                                                        )}
                                                    </span>

                                                    {/* <span>
                                                        Uhrzeit:{" "}
                                                        {formatTime(
                                                            item.interview_date
                                                        )}
                                                    </span> */}
                                                </div>

                                                {/* INTERVIEW NOTIZ PREVIEW */}

                                                {item.interview_notizen && (
                                                    <div className="appointment-note">
                                                        <strong>
                                                            Interview
                                                            Notiz
                                                        </strong>

                                                        <p>
                                                            {
                                                                item.interview_notizen
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                {/* COUNTDOWN */}

                                                {days !==
                                                    null && (
                                                    <span
                                                        className={`appointment-countdown ${
                                                            days <
                                                            0
                                                                ? "appointment-past"
                                                                : ""
                                                        }`}
                                                    >
                                                        {days ===
                                                        0
                                                            ? "Heute"
                                                            : days ===
                                                                1
                                                              ? "Morgen"
                                                              : days >
                                                                  1
                                                                ? `In ${days} Tagen`
                                                                : "Vergangen"}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            apps.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state-icon">
                                        T
                                    </div>

                                    <h3>
                                        Noch keine Termine
                                    </h3>

                                    <p>
                                        Sobald für eine
                                        Bewerbung ein Interview
                                        vereinbart wurde,
                                        erscheint der Termin
                                        hier.
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* RECHTE SEITE */}

                    <aside className="dashboard-panel">
                        {selectedApp ? (
                            <>
                                {/* AUSGEWÄHLTE BEWERBUNG */}

                                <div className="application-detail-header">
                                    <div>
                                        <span className="next-appointment-label">
                                            Bewerbung
                                        </span>

                                        <h2>
                                            {
                                                selectedApp.stelle
                                            }
                                        </h2>

                                        <p>
                                            {
                                                selectedApp.firma
                                            }
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="application-detail-close"
                                        onClick={
                                            closeApplication
                                        }
                                        aria-label="Detailansicht schließen"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* DETAILS */}

                                <div className="application-detail-information">
                                    <div>
                                        <span>
                                            Bewerbung
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedApp.datum
                                            )}
                                        </strong>
                                    </div>

                                    {selectedApp.interview_date && (
                                        <>
                                            <div>
                                                <span>
                                                    Interview
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        selectedApp.interview_date
                                                    )}
                                                </strong>
                                            </div>

                                            {/* <div>
                                                <span>
                                                    Uhrzeit
                                                </span>

                                                <strong>
                                                    {formatTime(
                                                        selectedApp.interview_date
                                                    )}
                                                </strong>
                                            </div> */}
                                        </>
                                    )}
                                </div>

                                {/* BEWERBUNGSNOTIZEN */}

                                <div className="application-notes">
                                    <div className="application-notes-header">
                                        <div>
                                            <h3>
                                                Bewerbungsnotizen
                                            </h3>

                                            <p>
                                                Allgemeine
                                                Informationen
                                                zu dieser
                                                Bewerbung.
                                            </p>
                                        </div>
                                    </div>

                                    <textarea
                                        className="application-notes-textarea"
                                        value={notes}
                                        onChange={(event) => {
                                            setNotes(
                                                event.target
                                                    .value
                                            );

                                            setSaveSuccess(
                                                ""
                                            );
                                        }}
                                        placeholder="Zum Beispiel Ansprechpartner, Gehaltsvorstellung oder wichtige Informationen..."
                                    />
                                </div>

                                {/* INTERVIEW NOTIZEN */}

                                <div className="application-notes interview-notes-section">
                                    <div className="application-notes-header">
                                        <div>
                                            <h3>
                                                Interview-Notizen
                                            </h3>

                                            <p>
                                                Notizen zur
                                                Vorbereitung
                                                oder zum
                                                Gespräch.
                                            </p>
                                        </div>
                                    </div>

                                    <textarea
                                        className="application-notes-textarea"
                                        value={
                                            interviewNotes
                                        }
                                        onChange={(event) => {
                                            setInterviewNotes(
                                                event.target
                                                    .value
                                            );

                                            setSaveSuccess(
                                                ""
                                            );
                                        }}
                                        placeholder="Zum Beispiel Fragen für das Gespräch, technische Themen oder Gesprächsergebnisse..."
                                    />

                                    {/* ERROR */}

                                    {saveError && (
                                        <div className="notes-error">
                                            {saveError}
                                        </div>
                                    )}

                                    {/* SUCCESS */}

                                    {saveSuccess && (
                                        <div className="notes-success">
                                            {
                                                saveSuccess
                                            }
                                        </div>
                                    )}

                                    {/* FOOTER */}

                                    <div className="application-notes-footer">
                                        <span className="notes-hint">
                                            Änderungen
                                            werden erst nach
                                            dem Speichern
                                            übernommen.
                                        </span>

                                        <button
                                            type="button"
                                            className="save-notes-button"
                                            onClick={
                                                handleSaveNotes
                                            }
                                            disabled={saving}
                                        >
                                            {saving
                                                ? "Speichert..."
                                                : "Notizen speichern"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : nextAppointment?.interview_date ? (
                            /*
                                Wenn noch keine Bewerbung
                                ausgewählt wurde:
                                nächsten Termin anzeigen.
                            */
                            <>
                                <div className="panel-header">
                                    <div>
                                        <h2>
                                            Nächster Termin
                                        </h2>

                                        <p>
                                            Dein nächstes
                                            Bewerbungsgespräch.
                                        </p>
                                    </div>
                                </div>

                                <div className="next-appointment">
                                    <div className="next-appointment-icon">
                                        T
                                    </div>

                                    <span className="next-appointment-label">
                                        Als Nächstes
                                    </span>

                                    <h3>
                                        {
                                            nextAppointment.stelle
                                        }
                                    </h3>

                                    <p className="next-appointment-company">
                                        {
                                            nextAppointment.firma
                                        }
                                    </p>

                                    <div className="next-appointment-information">
                                        <div>
                                            <span>
                                                Datum
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    nextAppointment.interview_date
                                                )}
                                            </strong>
                                        </div>

                                        {/* <div>
                                            <span>
                                                Uhrzeit
                                            </span>

                                            <strong>
                                                {formatTime(
                                                    nextAppointment.interview_date
                                                )}
                                            </strong>
                                        </div> */}
                                    </div>

                                    <button
                                        type="button"
                                        className="open-application-button"
                                        onClick={() =>
                                            handleSelectApplication(
                                                nextAppointment
                                            )
                                        }
                                    >
                                        Bewerbung öffnen
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="next-appointment-empty">
                                <div className="empty-state-icon">
                                    T
                                </div>

                                <h3>
                                    Kein Termin geplant
                                </h3>

                                <p>
                                    Aktuell steht kein
                                    weiteres
                                    Bewerbungsgespräch an.
                                </p>
                            </div>
                        )}
                    </aside>
                </section>
            </main>
        </div>
    );
}