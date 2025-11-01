import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  uid: string;
  name: string;
  email: string;
  createdAt?: Date;
  is2FAEnabled?: boolean;
}

// Remove TwoFAData interface since we're not using QR codes anymore

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  requires2FA: boolean;
  requires2FASetup: boolean;
  pending2FAEmail: string | null;
  // Remove twoFAData from the interface
  login: (email: string, password: string, twoFAToken?: string) => Promise<any>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clear2FAState: () => void;
  // Remove complete2FASetup since it's handled automatically
  verify2FA: (token: string) => Promise<void>;
  resend2FACode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  const [pending2FAEmail, setPending2FAEmail] = useState<string | null>(null);
  // Remove twoFAData state

  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('pomodoro_user');
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          userData.createdAt = new Date(userData.createdAt);
          setUser(userData);
          setToken(savedToken);
        }
      } catch (error) {
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('pomodoro_user');
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    clear2FAState();
  };

  const clear2FAState = () => {
    setRequires2FA(false);
    setRequires2FASetup(false);
    setPending2FAEmail(null);
    // No need to clear twoFAData anymore
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}/api/auth${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Resend 2FA code method
  const resend2FACode = async (): Promise<void> => {
    if (!pending2FAEmail) {
      throw new Error("No pending verification");
    }

    try {
      const data = await apiRequest('/resend-2fa', {
        method: 'POST',
        body: JSON.stringify({ email: pending2FAEmail }),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to resend code");
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to resend verification code");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email || !password || !name) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password should be at least 6 characters");
      }

      const data = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (data.success) {
        // For email 2FA, we don't get user data immediately
        if (data.data.requires2FASetup) {
          setPending2FAEmail(data.data.email);
          setRequires2FASetup(true);
          return;
        }

        // If no 2FA required (shouldn't happen with new flow)
        const userData = data.data.user;
        const authToken = data.data.token;

        const newUser: User = {
          uid: userData._id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date(userData.createdAt),
          is2FAEnabled: userData.is2FAEnabled || false,
        };

        localStorage.setItem('pomodoro_user', JSON.stringify(newUser));
        localStorage.setItem('auth_token', authToken);
        
        setUser(newUser);
        setToken(authToken);
        clear2FAState();
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, twoFAToken?: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const body: any = { email, password };
      if (twoFAToken) {
        body.twoFAToken = twoFAToken;
      }

      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (data.success) {
        // Handle 2FA required case (existing users with 2FA enabled)
        if (data.data.requires2FA) {
          setRequires2FA(true);
          setPending2FAEmail(data.data.email);
          return { requires2FA: true, email: data.data.email };
        }

        // Handle 2FA setup prompt case (first-time login or new users)
        if (data.data.requires2FASetup) {
          setPending2FAEmail(data.data.email);
          setRequires2FASetup(true);
          return { requires2FASetup: true };
        }

        // Normal login success (users without 2FA enabled)
        const userData = data.data.user;
        const authToken = data.data.token;

        const loggedInUser: User = {
          uid: userData._id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date(userData.createdAt),
          is2FAEnabled: userData.is2FAEnabled || false,
        };

        localStorage.setItem('pomodoro_user', JSON.stringify(loggedInUser));
        localStorage.setItem('auth_token', authToken);
        
        setUser(loggedInUser);
        setToken(authToken);
        clear2FAState();
        return { success: true };
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (token: string) => {
    setIsLoading(true);
    try {
      if (!pending2FAEmail) {
        throw new Error("No pending 2FA verification");
      }

      const data = await apiRequest('/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ email: pending2FAEmail, token }),
      });

      if (data.success) {
        const userData = data.data.user;
        const authToken = data.data.token;

        const loggedInUser: User = {
          uid: userData._id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date(userData.createdAt),
          is2FAEnabled: userData.is2FAEnabled || false,
        };

        localStorage.setItem('pomodoro_user', JSON.stringify(loggedInUser));
        localStorage.setItem('auth_token', authToken);
        
        setUser(loggedInUser);
        setToken(authToken);
        clear2FAState();
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (error: any) {
      throw new Error(error.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      if (token) {
        try {
          await apiRequest('/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          // Silent fail for logout
        }
      }

      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isLoading, 
      requires2FA,
      requires2FASetup,
      pending2FAEmail,
      // Remove twoFAData from the value
      login, 
      signup, 
      logout,
      clear2FAState,
      // Remove complete2FASetup from the value
      verify2FA,
      resend2FACode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};