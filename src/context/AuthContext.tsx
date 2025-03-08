"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ReactNode } from "react";
import { FirebaseError } from "firebase/app";

const AuthContext = createContext<{
  user: User | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  logOut: () => Promise<void>;
}>({
  user: null,
  signIn: async () => ({ success: false, message: "" }),
  logOut: async () => {},
  loading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const token = await user.getIdToken();
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } else {
        setUser(null);
        await fetch("/api/session", { method: "DELETE" });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: "Successful Log In!" };
    } catch (error) {
      if (
        (error as FirebaseError).code == "auth/invalid-email" ||
        (error as FirebaseError).code == "auth/invalid-credential"
      ) {
        return { success: false, message: "Invalid credentials!" };
      }
      return { success: false, message: "Error" };
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider value={{ user, signIn, logOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
