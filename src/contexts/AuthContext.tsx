import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // adjust path

interface User {
  uid: string; // use Firebase UID
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              name: userData.name,
              email: firebaseUser.email || "",
              createdAt: userData.createdAt?.toDate(),
            });
          } else {
            const newUser: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              createdAt: new Date(),
            };
            await setDoc(doc(db, "users", firebaseUser.uid), {
              name: newUser.name,
              email: newUser.email,
              createdAt: new Date(),
            });
            setUser(newUser);
          }
        } catch (error) {
          console.error("Error getting user data:", error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        createdAt: new Date(),
      });
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          createdAt: new Date(),
        });
      }
      // State will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      throw new Error(error.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || "Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
