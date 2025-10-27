import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  uid: string;
  name: string;
  email: string;
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('pomodoro_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Convert string date back to Date object
          userData.createdAt = new Date(userData.createdAt);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error loading user session:", error);
        localStorage.removeItem('pomodoro_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Basic validation
      if (!email || !password || !name) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password should be at least 6 characters");
      }

      // Check if user already exists (in a real app, this would be an API call)
      const existingUsers = JSON.parse(localStorage.getItem('pomodoro_users') || '{}');
      if (existingUsers[email]) {
        throw new Error("User already exists with this email");
      }

      // Create new user
      const newUser: User = {
        uid: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        createdAt: new Date(),
      };

      // Save to localStorage (in a real app, this would be your backend)
      existingUsers[email] = {
        ...newUser,
        password: btoa(password) // Simple encoding for demo (not secure for production)
      };
      localStorage.setItem('pomodoro_users', JSON.stringify(existingUsers));
      localStorage.setItem('pomodoro_user', JSON.stringify(newUser));
      
      setUser(newUser);
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Basic validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Check if user exists (in a real app, this would be an API call)
      const existingUsers = JSON.parse(localStorage.getItem('pomodoro_users') || '{}');
      const userData = existingUsers[email];

      if (!userData) {
        throw new Error("No user found with this email");
      }

      // Check password (in a real app, this would be handled by your backend)
      if (btoa(password) !== userData.password) {
        throw new Error("Invalid password");
      }

      // Create user object without password
      const loggedInUser: User = {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        createdAt: new Date(userData.createdAt),
      };

      localStorage.setItem('pomodoro_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock Google user data
      const mockGoogleUser: User = {
        uid: `google-user-${Date.now()}`,
        name: "Google User",
        email: "user@gmail.com",
        createdAt: new Date(),
      };

      // Save to localStorage (in a real app, this would be your backend)
      localStorage.setItem('pomodoro_user', JSON.stringify(mockGoogleUser));
      
      setUser(mockGoogleUser);
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      throw new Error("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.removeItem('pomodoro_user');
      setUser(null);
    } catch (error: any) {
      throw new Error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      loginWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};