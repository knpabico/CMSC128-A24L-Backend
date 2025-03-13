"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  User,
  createUserWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { Alumnus } from "@/models/models";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";

const AuthContext = createContext<{
  user: User | null;
  alumInfo: Alumnus | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  logOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string
  ) => Promise<UserCredential | undefined>;
}>({
  user: null,
  alumInfo: null,
  signIn: async () => ({ success: false, message: "" }),
  logOut: async () => {},
  loading: false,
  signUp: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [alumInfo, setAlumInfo] = useState<Alumnus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // //get info if alumnus
        // const alumni = collection(db, "alumni");

        // //create the query using the user's uid in the alumni collection
        // const q = query(alumni, where("uid", "==", user.uid));

        //get alum data from the "alumni" collection
        const alumniDoc = doc(db, "alumni", user.uid);

        //listen to changes on the data
        onSnapshot(alumniDoc, (doc) => {
          console.log(doc.data());
          setAlumInfo(doc.data() as Alumnus);
        });

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

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return credential;
    } catch (error) {
      console.error(error);
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
    <AuthContext.Provider
      value={{ user, alumInfo, signIn, logOut, loading, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
