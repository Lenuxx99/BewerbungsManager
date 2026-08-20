import {
    useCallback,
    useEffect,
    useState,
} from "react";

import Sidebar from "../components/Sidebar";
import ApplicationDetails from "../components/ApplicationDetails";
import "../styles/ApplicationsPage.css";
import { DailyApplications } from "../components/DailyApplications";

type ApplicationStatus =
    | "OFFEN"
    | "INTERVIEW"
    | "ZUGESAGT"
    | "ABGESAGT";

type ApplicationsType = {
    id: number;
    firma: string;
    stelle: string;
    status: ApplicationStatus;
    datum: string;
    notizen: string | null;
    created_at: string;
    updated_at: string;
    interview_date: string | null;
};

type ErrorResponse = {
    message?: string;
};

const API_URL = "http://localhost:3000/api";

export default function ApplicationsPage() {
    const [applications, setApplications] =
        useState<ApplicationsType[]>([]);

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] =
        useState(true);

    const [
        isCreatingApplication,
        setIsCreatingApplication,
    ] = useState(false);

    const [
        showApplicationForm,
        setShowApplicationForm,
    ] = useState(false);

    const [firma, setFirma] = useState("");
    const [stelle, setStelle] = useState("");
    const [datum, setDatum] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [status, setStatus] =
        useState<ApplicationStatus>("OFFEN");

    const [notizen, setNotizen] =
        useState("");

    const [showDetails, setShowDetails] = useState(false);
    const [selectedApplication, setSelectedApplication] =
        useState<ApplicationsType>();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<ApplicationStatus | "ALLE">("ALLE");

    const [showDailyGoal, setShowDailyGoal] = useState(false);
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

    function resetForm() {
        setFirma("");
        setStelle("");
        setDatum("");
        setStatus("OFFEN");
        setNotizen("");
    }

    async function addApplication(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (
            !firma.trim() ||
            !stelle.trim() ||
            !datum
        ) {
            setError(
                "Bitte fülle Firma, Stelle und Datum aus."
            );

            return;
        }

        try {
            setError("");
            setIsCreatingApplication(true);

            const response = await fetch(
                `${API_URL}/applications`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firma: firma.trim(),
                        stelle: stelle.trim(),
                        datum,
                        status,
                        notizen:
                            notizen.trim() || undefined,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const errorData =
                    data as ErrorResponse;

                setError(
                    errorData.message ??
                    "Bewerbung konnte nicht erstellt werden."
                );

                return;
            }

            resetForm();
            setShowApplicationForm(false);

            /*
                Bewerbungen neu laden,
                damit DailyApplications den
                aktuellen Wert bekommt.
            */
            await loadApplications();

            /*
                Daily-Goal Popup anzeigen.
            */
            setShowDailyGoal(true);

            /*
                Nach 4 Sekunden wieder ausblenden.
            */
            setTimeout(() => {
                setShowDailyGoal(false);
            }, 4000);

        } catch (error) {
            console.error(error);

            setError(
                "Der Server ist nicht erreichbar."
            );
        } finally {
            setIsCreatingApplication(false);
        }
    }

    async function updateStatus(
        appId: number,
        status: ApplicationStatus
    ) {
        const response = await fetch(
            `${API_URL}/applications/${appId}`,
            {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                }),
            }
        );

        const data = await response
            .json()
            .catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.message ??
                "Status konnte nicht aktualisiert werden."
            );
        }

        setApplications((previousApplications) =>
            previousApplications.map((application) =>
                application.id === appId
                    ? {
                        ...application,
                        status,
                        updated_at:
                            data?.updated_at ??
                            new Date().toISOString(),
                    }
                    : application
            )
        );

        setSelectedApplication((previousApplication) =>
            previousApplication?.id === appId
                ? {
                    ...previousApplication,
                    status,
                    updated_at:
                        data?.updated_at ??
                        new Date().toISOString(),
                }
                : previousApplication
        );
    }

    async function deleteApplication(
        appId: number
    ) {
        const confirmed = window.confirm(
            "Möchtest du diese Bewerbung wirklich löschen?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/applications/${appId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            setApplications((prev) =>
                prev.filter((app) => app.id !== appId)
            );
        } catch {
            setError("Bewerbung konnte nicht gelöscht werden.");
        }
    }

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

    const filteredApplications = applications.filter((application) => {
        const searchValue = searchTerm.trim().toLowerCase();

        const matchesSearch =
            application.firma.toLowerCase().includes(searchValue) ||
            application.stelle.toLowerCase().includes(searchValue);

        const matchesStatus =
            statusFilter === "ALLE" ||
            application.status === statusFilter;

        return matchesSearch && matchesStatus;
    });
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <DailyApplications
                apps={applications}
                dailyGoal={5}
                variant="popup"
                visible={showDailyGoal}
            />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <p className="dashboard-eyebrow">
                            Bewerbungen
                        </p>

                        <h1>Meine Bewerbungen</h1>

                        <p className="dashboard-subtitle">
                            Hier kannst du deine Bewerbungen
                            hinzufügen und verwalten.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="primary-action applications-add-button"
                        onClick={() => {
                            setError("");
                            setShowApplicationForm(true);
                        }}
                    >
                        Bewerbung hinzufügen
                    </button>
                </header>

                {error && (
                    <div
                        className="applications-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {showApplicationForm && (
                    <section className="dashboard-panel application-form-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Neue Bewerbung</h2>

                                <p>
                                    Trage die Informationen zu deiner
                                    Bewerbung ein.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="application-close-button"
                                onClick={() => {
                                    setShowApplicationForm(false);
                                    resetForm();
                                    setError("");
                                }}
                            >
                                Schließen
                            </button>
                        </div>

                        <form
                            className="application-form"
                            onSubmit={addApplication}
                        >
                            <label className="application-field">
                                <span>Firma</span>

                                <input
                                    type="text"
                                    value={firma}
                                    onChange={(event) =>
                                        setFirma(event.target.value)
                                    }
                                    placeholder="Zum Beispiel: BMW"
                                    required
                                />
                            </label>

                            <label className="application-field">
                                <span>Stelle</span>

                                <input
                                    type="text"
                                    value={stelle}
                                    onChange={(event) =>
                                        setStelle(event.target.value)
                                    }
                                    placeholder="Zum Beispiel: Frontend Developer"
                                    required
                                />
                            </label>

                            <label className="application-field">
                                <span>Datum</span>

                                <input
                                    type="date"
                                    value={datum}
                                    onChange={(event) =>
                                        setDatum(event.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="application-field">
                                <span>Status</span>

                                <input
                                    type="text"
                                    value="Offen"
                                    readOnly
                                />
                            </label>

                            <label className="application-field application-notes-field">
                                <span>Notizen</span>

                                <textarea
                                    value={notizen}
                                    onChange={(event) =>
                                        setNotizen(event.target.value)
                                    }
                                    placeholder="Optionale Notizen"
                                    rows={4}
                                />
                            </label>

                            <div className="application-form-actions">
                                <button
                                    type="button"
                                    className="application-cancel-button"
                                    onClick={() => {
                                        setShowApplicationForm(false);
                                        resetForm();
                                        setError("");
                                    }}
                                >
                                    Abbrechen
                                </button>

                                <button
                                    type="submit"
                                    className="primary-action applications-add-button"
                                    disabled={isCreatingApplication}
                                >
                                    {isCreatingApplication
                                        ? "Wird gespeichert..."
                                        : "Bewerbung speichern"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
                {showDetails && selectedApplication && (
                    <ApplicationDetails
                        application={selectedApplication}
                        onStatusChange={updateStatus}
                        onBack={() => {
                            setShowDetails(false);
                        }}
                        onApplicationUpdate={(updatedApplication) => {
                            setSelectedApplication(
                                updatedApplication
                            );

                            setApplications(
                                (previousApplications) =>
                                    previousApplications.map(
                                        (application) =>
                                            application.id ===
                                                updatedApplication.id
                                                ? updatedApplication
                                                : application
                                    )
                            );
                        }}
                    />
                )}
                {!showDetails && (
                    <section className="dashboard-panel applications-list-panel">
                        <div className="panel-header">
                            <div>
                                <h2>Alle Bewerbungen</h2>

                                <p>
                                    {filteredApplications.length} von {applications.length} Bewerbungen
                                </p>
                            </div>
                        </div>

                        <div className="applications-toolbar">
                            <label className="applications-search">
                                <span className="sr-only">
                                    Bewerbungen durchsuchen
                                </span>

                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Nach Firma oder Stelle suchen"
                                />
                            </label>

                            <label className="applications-filter">
                                <span className="sr-only">
                                    Nach Status filtern
                                </span>

                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value as ApplicationStatus | "ALLE"
                                        )
                                    }
                                >
                                    <option value="ALLE">Alle Status</option>
                                    <option value="OFFEN">Offen</option>
                                    <option value="INTERVIEW">Interview</option>
                                    <option value="ZUGESAGT">Zugesagt</option>
                                    <option value="ABGESAGT">Abgesagt</option>
                                </select>
                            </label>
                        </div>

                        {isLoading ? (
                            <p className="applications-message">
                                Bewerbungen werden geladen...
                            </p>
                        ) : applications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    ◧
                                </div>

                                <h3>Noch keine Bewerbungen vorhanden</h3>

                                <p>
                                    Füge deine erste Bewerbung hinzu,
                                    um sie hier zu verwalten.
                                </p>

                                <button
                                    type="button"
                                    className="empty-state-action applications-add-button"
                                    onClick={() =>
                                        setShowApplicationForm(true)
                                    }
                                >
                                    Erste Bewerbung hinzufügen
                                </button>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="applications-no-results">
                                <h3>Keine Bewerbungen gefunden</h3>

                                <p>
                                    Passe den Suchbegriff oder den Statusfilter an.
                                </p>

                                <button
                                    type="button"
                                    className="secondary-action"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("ALLE");
                                    }}
                                >
                                    Filter zurücksetzen
                                </button>
                            </div>
                        ) : (
                            <div className="applications-grid">
                                {filteredApplications.map((application) => (
                                    <article
                                        key={application.id}
                                        className="application-card"
                                        onClick={() => {
                                            setSelectedApplication(application);
                                            setShowDetails(true);
                                        }}
                                    >
                                        <div className="application-card-header">
                                            <div>
                                                <h3>{application.stelle}</h3>
                                                <p>{application.firma}</p>
                                            </div>

                                            <span
                                                className={`application-status application-status-${application.status.toLowerCase()}`}
                                            >
                                                {application.status}
                                            </span>
                                        </div>

                                        <div className="application-details">
                                            <div className="application-dates">
                                                <div>
                                                    <dt>Bewerbungsdatum</dt>
                                                    <dd>{formatDate(application.datum)}</dd>
                                                </div>

                                                {application.interview_date && (
                                                    <div>
                                                        <dt>Interviewdatum</dt>
                                                        <dd>{formatDate(application.interview_date)}</dd>
                                                    </div>
                                                )}
                                            </div>

                                            {application.notizen && (
                                                <div>
                                                    <dt>Notizen</dt>
                                                    <dd>{application.notizen}</dd>
                                                </div>
                                            )}
                                        </div>

                                        <div className="application-card-actions">
                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    deleteApplication(application.id);
                                                }}
                                            >
                                                Löschen
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}