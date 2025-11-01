import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import Signup from "./Signup";
import TwoFactorAuth from "./TwoFactorAuth";
import TwoFactorSetup from "./TwoFactorSetup";

interface AuthProps {
  onSuccess?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { 
    user,
    login, 
    signup, 
    isLoading, 
    requires2FA, 
    requires2FASetup, 
    verify2FA,
    clear2FAState,
    pending2FAEmail
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pendingAuth, setPendingAuth] = useState<{ email: string; password: string } | null>(null);

  // Remove the setup2FA and twoFAData references since we're using email-based 2FA

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      setPendingAuth({ email, password });
      const result = await login(email, password);
      
      // If 2FA is required, don't call onSuccess yet
      if (result && (result.requires2FA || result.requires2FASetup)) {
        return;
      }
      
      setPendingAuth(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setPendingAuth(null);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      await signup(name, email, password);
      // Note: signup now automatically triggers 2FA setup flow
      // so we don't call onSuccess immediately
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err;
    }
  };

  const handle2FASetupComplete = async (token: string) => {
    try {
      setError(null);
      await verify2FA(token); // Use verify2FA for both setup and verification
      
      setPendingAuth(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      throw err;
    }
  };

  const handle2FAVerify = async (token: string) => {
    try {
      setError(null);
      await verify2FA(token);
      setPendingAuth(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      throw err;
    }
  };

  const handleCancel2FA = () => {
    setPendingAuth(null);
    clear2FAState();
    setIsLogin(true);
  };

  // Show 2FA setup for new signups or first-time login
  if (requires2FASetup) {
    return (
      <TwoFactorSetup 
        onSetupComplete={handle2FASetupComplete}
        onCancel={handleCancel2FA}
        isLoading={isLoading}
      />
    );
  }

  // Show 2FA verification for existing users with 2FA enabled
  if (requires2FA) {
    return (
      <TwoFactorAuth 
        onVerify={handle2FAVerify}
        onCancel={handleCancel2FA}
        isLoading={isLoading}
      />
    );
  }

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
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
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
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default Auth;