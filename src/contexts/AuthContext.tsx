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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://reflectivepomodoro.com';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  };

  const getApiBaseUrl = () => {
    // For development, use localhost; for production, use the domain
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return API_BASE_URL;
  };

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth${endpoint}`, {
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
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        const userData = data.data.user;
        const authToken = data.data.token;

        const loggedInUser: User = {
          uid: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          createdAt: new Date(userData.createdAt),
        };

        localStorage.setItem('pomodoro_user', JSON.stringify(loggedInUser));
        localStorage.setItem('auth_token', authToken);
        
        setUser(loggedInUser);
        setToken(authToken);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
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
          console.error("Error during backend logout.");
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};