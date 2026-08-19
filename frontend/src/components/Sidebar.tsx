import {
  Link,
  NavLink,
  useNavigate,
} from "react-router";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import "../styles/Sidebar.css";
function Sidebar() {
  const { user, clearUser } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [logoutError, setLogoutError] =
    useState("");

  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""
      }`.toUpperCase() || "BM";

  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Logout fehlgeschlagen."
        );
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

  return (
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
          <NavLink
            to="/termine"
            className={({ isActive }) =>
              isActive
                ? "navigation-link active"
                : "navigation-link"
            }
          >
            <span className="navigation-icon">
              ◷
            </span>

            Termine

          </NavLink>
          {/* <button
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
          </button> */}


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
  );
}

export default Sidebar;