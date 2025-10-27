import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import Signup from "./Signup";

interface AuthProps {
  onSuccess?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err; // Re-throw to let Login component handle it
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      await signup(name, email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err; // Re-throw to let Signup component handle it
    }
  };

  if (isLogin) {
    return (
      <div>
        <Login
          onLogin={handleLogin}
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