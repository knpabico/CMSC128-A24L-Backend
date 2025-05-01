"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  User,
  createUserWithEmailAndPassword,
  UserCredential,
  deleteUser,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { Alumnus } from "@/models/models";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getRegStatus, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { GoogleSign } from "./AuthGoogleContext";
import { toastError } from "@/components/ui/sonner";

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
  isAdmin: boolean;
  status: string | null;
  getAlumInfo: (user: User) => Promise<void>;
  isGoogleSignIn: boolean;
  signInWithGoogle: () => Promise<boolean>;
  logOutAndDelete: () => Promise<void>;
}>({
  user: null,
  alumInfo: null,
  signIn: async () => ({ success: false, message: "" }),
  logOut: async () => {},
  loading: true,
  signUp: async () => undefined,
  isAdmin: false,
  status: null,
  getAlumInfo: async () => {},
  isGoogleSignIn: false,
  signInWithGoogle: async () => false,
  logOutAndDelete: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [alumInfo, setAlumInfo] = useState<Alumnus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState<boolean>(false);
  const router = useRouter();

  //function for getting currently logged in user info from the "alumni" collection
  const getAlumInfo = async (user: User) => {
    //get alum data from the "alumni" collection
    const alumniRef = doc(db, "alumni", user.uid);
    const alumniDoc = await getDoc(alumniRef);
    //listen to changes on the data
    if (alumniDoc.exists()) {
      console.log("Document data:", alumniDoc.data());
      const alumniCopy = alumniDoc.data() as Alumnus;

      //convert date format to YYY-MM-DD
      alumniCopy.birthDate = alumniDoc.data().birthDate
        ? alumniDoc
            .data()
            .birthDate.toDate()
            .toISOString()
            .slice(0, 10)
            .replaceAll("-", "/")
        : undefined;

      setAlumInfo(alumniCopy);
      console.log("Set!");
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const userRole = await getUserRole(user.email);
        setRole(userRole);
        console.log("userRole: " + userRole);
        if (!userRole) {
          setUser(user);
          setIsGoogleSignIn(true);
          return;
        } else if (userRole === "admin") {
          setIsAdmin(true);
        } else if (userRole === "user") {
          const regStat = await getRegStatus(user.uid);
          setStatus(regStat);
          if (regStat == "approved") {
          } else if (regStat == "pending") {
            console.log(`status: ${regStat}`);
          }
          setUser(user);
          await getAlumInfo(user);
        } else {
          logOut();
        }
      } else {
        setIsGoogleSignIn(false);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const data = await GoogleSign();
      if (data.success) {
        console.log(data);
        setUser(data.user ?? null);
        setAlumInfo(data.alumniCopy ?? null);
        setIsGoogleSignIn(false);
        return false;
      } else {
        if (data.errorMessage === "User not found!") {
          console.log("User not found!");
          router.push("/sign-up");
        } else if (data.errorMessage === "Popup closed by user") {
          return true;
        } else {
          toastError(data.errorMessage);
          return false;
        }
      }
    } catch (error) {
      toastError(
        `An error occurred while signing in with Google. ${
          (error as Error).message
        }`
      );
    }
  };

  const signIn = async (email: string, password: string) => {
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
      router.push("/");
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setIsGoogleSignIn(false);
      setStatus(null);
      setAlumInfo(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logOutAndDelete = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "alumni", user?.uid ?? ""));
      if (user) {
        await deleteUser(user);
      }
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setIsGoogleSignIn(false);
      setStatus(null);
      setAlumInfo(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        alumInfo,
        signIn,
        logOut,
        loading,
        signUp,
        isAdmin,
        status,
        getAlumInfo,
        isGoogleSignIn,
        signInWithGoogle,
        logOutAndDelete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
