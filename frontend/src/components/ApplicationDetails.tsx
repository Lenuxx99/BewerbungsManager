import {
  useEffect,
  useState,
} from "react";

import "../styles/ApplicationDetails.css";

type ApplicationStatus =
  | "OFFEN"
  | "INTERVIEW"
  | "ZUGESAGT"
  | "ABGESAGT";

type Application = {
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

type ApplicationDetailsProps = {
  application: Application;
  onBack?: () => void;

  onStatusChange: (
    appId: number,
    status: ApplicationStatus
  ) => Promise<void>;

  onApplicationUpdate?: (
    application: Application
  ) => void;
};

type ErrorResponse = {
  message?: string;
};

const API_URL = "http://localhost:3000/api";

const statusLabels: Record<ApplicationStatus, string> = {
  OFFEN: "Offen",
  INTERVIEW: "Interview",
  ZUGESAGT: "Zugesagt",
  ABGESAGT: "Abgesagt",
};

function formatDate(dateValue: string): string {
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

function formatDateTime(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Ungültiges Datum";
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateForInput(
  dateValue: string | null
): string {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusClass(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", "-");
}

export default function ApplicationDetails({
  application,
  onBack,
  onStatusChange,
  onApplicationUpdate,
}: ApplicationDetailsProps) {
  const [
    currentApplication,
    setCurrentApplication,
  ] = useState<Application>(application);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<ApplicationStatus>(
    application.status
  );

  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
  ] = useState(false);

  const [
    statusError,
    setStatusError,
  ] = useState("");

  const [
    isEditingNotes,
    setIsEditingNotes,
  ] = useState(false);

  const [
    notes,
    setNotes,
  ] = useState(application.notizen ?? "");

  const [
    isSavingNotes,
    setIsSavingNotes,
  ] = useState(false);

  const [
    notesError,
    setNotesError,
  ] = useState("");

  const [
    interviewDate,
    setInterviewDate,
  ] = useState(
    formatDateForInput(
      application.interview_date
    )
  );

  const [
    isEditingInterviewDate,
    setIsEditingInterviewDate,
  ] = useState(
    application.interview_date === null
  );

  const [
    isSavingInterviewDate,
    setIsSavingInterviewDate,
  ] = useState(false);

  const [
    interviewDateError,
    setInterviewDateError,
  ] = useState("");

  useEffect(() => {
    setCurrentApplication(application);
    setSelectedStatus(application.status);
    setNotes(application.notizen ?? "");

    setInterviewDate(
      formatDateForInput(
        application.interview_date
      )
    );

    setIsEditingInterviewDate(
      application.interview_date === null
    );
  }, [application]);

  function updateLocalApplication(
    updates: Partial<Application>
  ) {
    setCurrentApplication(
      (previousApplication) => {
        const updatedApplication = {
          ...previousApplication,
          ...updates,
        };

        onApplicationUpdate?.(
          updatedApplication
        );

        return updatedApplication;
      }
    );
  }

  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newStatus =
      event.target.value as ApplicationStatus;

    const previousStatus = selectedStatus;

    setSelectedStatus(newStatus);
    setStatusError("");
    setIsUpdatingStatus(true);

    try {
      await onStatusChange(
        currentApplication.id,
        newStatus
      );

      updateLocalApplication({
        status: newStatus,
        updated_at:
          new Date().toISOString(),
      });

      if (
        newStatus === "INTERVIEW" &&
        !currentApplication.interview_date
      ) {
        setIsEditingInterviewDate(true);
      }
    } catch (error) {
      setSelectedStatus(previousStatus);

      setStatusError(
        error instanceof Error
          ? error.message
          : "Status konnte nicht aktualisiert werden."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function saveNotes() {
    try {
      setIsSavingNotes(true);
      setNotesError("");

      const response = await fetch(
        `${API_URL}/applications/${currentApplication.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            notizen: notes,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const errorData =
          data as ErrorResponse | null;

        throw new Error(
          errorData?.message ??
            "Notizen konnten nicht gespeichert werden."
        );
      }

      updateLocalApplication({
        notizen: notes,
        updated_at:
          data?.application?.updated_at ??
          new Date().toISOString(),
      });

      setIsEditingNotes(false);
    } catch (error) {
      setNotesError(
        error instanceof Error
          ? error.message
          : "Notizen konnten nicht gespeichert werden."
      );
    } finally {
      setIsSavingNotes(false);
    }
  }

  async function saveInterviewDate() {
    if (!interviewDate) {
      setInterviewDateError(
        "Bitte wähle ein Interviewdatum aus."
      );

      return;
    }

    const parsedDate = new Date(
      `${interviewDate}T12:00:00`
    );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      setInterviewDateError(
        "Das Interviewdatum ist ungültig."
      );

      return;
    }

    try {
      setIsSavingInterviewDate(true);
      setInterviewDateError("");

      const response = await fetch(
        `${API_URL}/applications/${currentApplication.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            interview_date:
              parsedDate.toISOString(),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const errorData =
          data as ErrorResponse | null;

        throw new Error(
          errorData?.message ??
            "Interviewdatum konnte nicht gespeichert werden."
        );
      }

      const savedInterviewDate =
        data?.application
          ?.interview_date ??
        parsedDate.toISOString();

      updateLocalApplication({
        interview_date:
          savedInterviewDate,
        updated_at:
          data?.application?.updated_at ??
          new Date().toISOString(),
      });

      setInterviewDate(
        formatDateForInput(
          savedInterviewDate
        )
      );

      setIsEditingInterviewDate(false);
    } catch (error) {
      setInterviewDateError(
        error instanceof Error
          ? error.message
          : "Interviewdatum konnte nicht gespeichert werden."
      );
    } finally {
      setIsSavingInterviewDate(false);
    }
  }

  function cancelInterviewDateEditing() {
    setInterviewDate(
      formatDateForInput(
        currentApplication.interview_date
      )
    );

    setInterviewDateError("");
    setIsEditingInterviewDate(false);
  }

  const showInterviewSection =
    selectedStatus === "INTERVIEW";

  return (
    <main className="application-details-page">
      <section className="application-details-container">
        <div className="details-topbar">
          {onBack && (
            <button
              type="button"
              className="back-button"
              onClick={onBack}
            >
              <span aria-hidden="true">
                ←
              </span>

              Zurück
            </button>
          )}

          <span className="application-id">
            Bewerbung #
            {currentApplication.id}
          </span>
        </div>

        <article className="application-details-card">
          <header className="details-header">
            <div
              className="company-icon"
              aria-hidden="true"
            >
              {currentApplication.firma
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="details-heading">
              <p className="details-label">
                Bewerbungsdetails
              </p>

              <h1>
                {currentApplication.firma}
              </h1>

              <p className="position-name">
                {currentApplication.stelle}
              </p>
            </div>

            <span
              className={`status-badge status-${getStatusClass(
                selectedStatus
              )}`}
            >
              {statusLabels[selectedStatus]}
            </span>
          </header>

          <div className="details-divider" />

          <div className="details-grid">
            <div className="detail-item">
              <span
                className="detail-icon"
                aria-hidden="true"
              >
                🏢
              </span>

              <div>
                <span className="detail-name">
                  Unternehmen
                </span>

                <strong>
                  {currentApplication.firma}
                </strong>
              </div>
            </div>

            <div className="detail-item">
              <span
                className="detail-icon"
                aria-hidden="true"
              >
                💼
              </span>

              <div>
                <span className="detail-name">
                  Stelle
                </span>

                <strong>
                  {currentApplication.stelle}
                </strong>
              </div>
            </div>

            <div className="detail-item">
              <span
                className="detail-icon"
                aria-hidden="true"
              >
                📅
              </span>

              <div>
                <span className="detail-name">
                  Bewerbungsdatum
                </span>

                <strong>
                  {formatDate(
                    currentApplication.datum
                  )}
                </strong>
              </div>
            </div>

            <div className="detail-item">
              <span
                className="detail-icon"
                aria-hidden="true"
              >
                📌
              </span>

              <div className="status-control">
                <label
                  className="detail-name"
                  htmlFor={`application-status-${currentApplication.id}`}
                >
                  Status
                </label>

                <select
                  id={`application-status-${currentApplication.id}`}
                  className="details-status-select"
                  value={selectedStatus}
                  onChange={
                    handleStatusChange
                  }
                  disabled={
                    isUpdatingStatus
                  }
                >
                  <option value="OFFEN">
                    Offen
                  </option>

                  <option value="INTERVIEW">
                    Interview
                  </option>

                  <option value="ZUGESAGT">
                    Zugesagt
                  </option>

                  <option value="ABGESAGT">
                    Abgesagt
                  </option>
                </select>

                {isUpdatingStatus && (
                  <span className="status-update-message">
                    Wird gespeichert...
                  </span>
                )}
              </div>
            </div>
          </div>

          {statusError && (
            <div
              className="details-error"
              role="alert"
            >
              {statusError}
            </div>
          )}

          {showInterviewSection && (
            <section className="interview-section">
              <div className="section-heading">

                <h2>Interviewtermin</h2>

                {!isEditingInterviewDate &&
                  currentApplication.interview_date && (
                    <button
                      type="button"
                      onClick={() =>
                        setIsEditingInterviewDate(
                          true
                        )
                      }
                    >
                      Bearbeiten
                    </button>
                  )}
              </div>

              {isEditingInterviewDate ? (
                <>
                  <div className="interview-date-form">
                    <label
                      htmlFor={`interview-date-${currentApplication.id}`}
                    >
                      Interviewdatum
                    </label>

                    <input
                      id={`interview-date-${currentApplication.id}`}
                      type="date"
                      value={interviewDate}
                      onChange={(event) =>
                        setInterviewDate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="interview-date-actions">
                    <button
                      type="button"
                      onClick={
                        saveInterviewDate
                      }
                      disabled={
                        isSavingInterviewDate ||
                        !interviewDate
                      }
                    >
                      {isSavingInterviewDate
                        ? "Wird gespeichert..."
                        : "Speichern"}
                    </button>

                    {currentApplication.interview_date && (
                      <button
                        type="button"
                        onClick={
                          cancelInterviewDateEditing
                        }
                        disabled={
                          isSavingInterviewDate
                        }
                      >
                        Abbrechen
                      </button>
                    )}
                  </div>
                </>
              ) : currentApplication.interview_date ? (
                <div className="interview-date-display">
                  <span
                    className="detail-icon"
                    aria-hidden="true"
                  >
                    📅
                  </span>

                  <div>
                    <span className="detail-name">
                      Geplanter Termin
                    </span>

                    <strong>
                      {formatDate(
                        currentApplication.interview_date
                      )}
                    </strong>
                  </div>
                </div>
              ) : null}

              {interviewDateError && (
                <div
                  className="details-error"
                  role="alert"
                >
                  {interviewDateError}
                </div>
              )}
            </section>
          )}

          <section className="notes-section">
            <div className="section-heading">
              <span aria-hidden="true">
                📝
              </span>

              <h2>Notizen</h2>

              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => {
                    setNotesError("");
                    setIsEditingNotes(true);
                  }}
                >
                  Bearbeiten
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <>
                <textarea
                  className="notes-textarea"
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                />

                <div className="notes-actions">
                  <button
                    type="button"
                    onClick={saveNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes
                      ? "Wird gespeichert..."
                      : "Speichern"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNotes(
                        currentApplication.notizen ??
                          ""
                      );

                      setNotesError("");
                      setIsEditingNotes(false);
                    }}
                    disabled={isSavingNotes}
                  >
                    Abbrechen
                  </button>
                </div>
              </>
            ) : (
              <div
                className={
                  currentApplication.notizen
                    ? "notes-content"
                    : "notes-content notes-empty"
                }
              >
                {currentApplication.notizen ||
                  "Keine Notizen vorhanden."}
              </div>
            )}

            {notesError && (
              <div
                className="details-error"
                role="alert"
              >
                {notesError}
              </div>
            )}
          </section>

          <footer className="details-footer">
            <div>
              <span>Erstellt am</span>

              <strong>
                {formatDateTime(
                  currentApplication.created_at
                )}
              </strong>
            </div>

            <div>
              <span>
                Zuletzt aktualisiert
              </span>

              <strong>
                {formatDateTime(
                  currentApplication.updated_at
                )}
              </strong>
            </div>
          </footer>
        </article>
      </section>
    </main>
  );
}