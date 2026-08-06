import { Route, Routes } from "react-router";

import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ProtectedRoute from "./components/ProtectedRoute";
// import ApplicationDetailsPage from "./components/ApplicationDetails";



function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="/applications"
          element={<ApplicationsPage />}
        />
        {/* <Route
          path="/applications/:id"
          element={<ApplicationDetailsPage />}
        /> */}
      </Route>
    </Routes>
  );
}

export default App;