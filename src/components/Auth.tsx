import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import Signup from "./Signup";

interface AuthProps {
  onSuccess?: () => void; // Add this line
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => { // Add the prop here
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await login(email, password);
      // Call onSuccess after successful login
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      await signup(name, email, password);
      // Call onSuccess after successful signup
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError(null);
      await loginWithGoogle();
      // Call onSuccess after successful Google auth
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed");
    }
  };

  if (isLogin) {
    return (
      <div>
        <Login
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleAuth} // Use the new handler
          onSwitchToSignup={() => {
            setIsLogin(false);
            setError(null);
          }}
          isLoading={isLoading}
        />
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <Signup
        onSignup={handleSignup}
        onGoogleSignup={handleGoogleAuth} // Use the new handler
        onSwitchToLogin={() => {
          setIsLogin(true);
          setError(null);
        }}
        isLoading={isLoading}
      />
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Auth;