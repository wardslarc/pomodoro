import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext"; // Add this import
import Home from "./components/home";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth";
import routes from "tempo-routes";

function AppContent() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            user ? <Dashboard /> : <Navigate to="/" replace />
          } />
          <Route path="/auth" element={<Auth />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider> {/* Add this wrapper */}
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;