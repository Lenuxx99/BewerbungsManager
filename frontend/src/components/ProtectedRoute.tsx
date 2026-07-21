import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

import { useAuth } from "../context/AuthContext";
import "../styles/ProtectedRoute.css";

function ProtectedRoute() {
  const { user, refreshUser } = useAuth();

  const [isCheckingAuth, setIsCheckingAuth] = useState(
    user === null
  );

  const [isAuthenticated, setIsAuthenticated] = useState(
    user !== null
  );

  useEffect(() => {
    let isMounted = true;

    async function checkAuthentication() {
      if (user) {
        if (isMounted) {
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
        }

        return;
      }

      const authenticated = await refreshUser();

      if (!isMounted) {
        return;
      }

      setIsAuthenticated(authenticated);
      setIsCheckingAuth(false);
    }

    void checkAuthentication();

    return () => {
      isMounted = false;
    };
  }, [user, refreshUser]);

  if (isCheckingAuth) {
    return (
      <main
        className="auth-loading"
        aria-busy="true"
        aria-live="polite"
      >
        <section className="auth-loading-card">
          <div
            className="auth-loading-logo"
            aria-hidden="true"
          >
            BM
          </div>

          <div
            className="auth-loading-spinner"
            aria-hidden="true"
          />

          <h1>Anmeldung wird geprüft</h1>

          <p>
            Einen Moment bitte. Deine Sitzung wird
            sicher überprüft.
          </p>

          <div
            className="auth-loading-progress"
            aria-hidden="true"
          >
            <span />
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;