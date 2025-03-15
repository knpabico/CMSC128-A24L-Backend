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
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

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
  loading: true,
  signUp: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [alumInfo, setAlumInfo] = useState<Alumnus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //function for getting currently logged in user info from the "alumni" collection
  const getAlumInfo = async (user: User) => {
    //get alum data from the "alumni" collection
    const alumniRef = doc(db, "alumni", user.uid);
    const alumniDoc = await getDoc(alumniRef);
    //listen to changes on the data
    if (alumniDoc.exists()) {
      console.log("Document data:", alumniDoc.data());
      var alumniCopy = alumniDoc.data() as Alumnus;

      //convert date format to YYY-MM-DD
      alumniCopy.birthDate = alumniDoc
        .data()
        .birthDate.toDate()
        .toISOString().slice(0,10).replaceAll("-", "/");

      setAlumInfo(alumniCopy);
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        //get alumInfo of currently logged in user
        await getAlumInfo(user);

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
