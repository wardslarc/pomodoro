import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Home from "./components/home";
import Auth from "./components/Auth";
import Guides from "./components/Guides";
import Blog from "./components/Blog";

function AppContent() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/auth" element={
          !user ? <Auth /> : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;