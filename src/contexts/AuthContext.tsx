import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  uid: string;
  name: string;
  email: string;
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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

// Production API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
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
        console.error("Error loading user session:", error);
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
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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

      const data = await apiRequest('/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (data.success) {
        const userData = data.data.user;
        const authToken = data.data.token;

        const newUser: User = {
          uid: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date(userData.createdAt),
        };

        localStorage.setItem('pomodoro_user', JSON.stringify(newUser));
        localStorage.setItem('auth_token', authToken);
        
        setUser(newUser);
        setToken(authToken);
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("🔍 DEBUG: Login function started");
      console.log("🔍 DEBUG: API Base URL:", API_BASE_URL);
      console.log("🔍 DEBUG: Making request to:", `${API_BASE_URL}/api/auth/login`);

      // Basic validation
      if (!email || !password) {
        console.error("❌ DEBUG: Validation failed - missing email or password");
        throw new Error("Email and password are required");
      }

      console.log("🔍 DEBUG: Making API request...");
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log("🔍 DEBUG: API Response received:", data);

      if (data.success) {
        console.log("✅ DEBUG: Login successful in API!");
        console.log("✅ DEBUG: Response data:", data);
        
        const userData = data.data.user;
        const authToken = data.data.token;

        console.log("✅ DEBUG: User data received:", userData);
        console.log("✅ DEBUG: Auth token received:", authToken ? "Yes" : "No");

        const loggedInUser: User = {
          uid: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date(userData.createdAt),
        };

        console.log("✅ DEBUG: Setting user in state and localStorage");
        localStorage.setItem('pomodoro_user', JSON.stringify(loggedInUser));
        localStorage.setItem('auth_token', authToken);
        
        setUser(loggedInUser);
        setToken(authToken);
        
        console.log("✅ DEBUG: Login process completed successfully!");
      } else {
        console.error("❌ DEBUG: API returned success: false", data.message);
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ DEBUG: Login error caught:", error);
      console.error("❌ DEBUG: Error message:", error.message);
      throw new Error(error.message || "Login failed");
    } finally {
      console.log("🔍 DEBUG: Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      window.location.href = `${API_BASE_URL}/api/auth/google`;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error("Google OAuth not fully implemented. Please use email/password for now.");
      
    } catch (error: any) {
      throw new Error(error.message || "Google sign-in failed");
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
          console.error("Error during backend logout:", error);
        }
      }

      clearAuthData();
    } catch (error: any) {
      throw new Error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isLoading, 
      login, 
      signup, 
      logout, 
      loginWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
};