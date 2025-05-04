"use client";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const { isGoogleSignIn, status, isAdmin, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isGoogleSignIn) {
      router.push("/sign-up");
    } else if (status !== "approved" && !isAdmin && !loading) {
      router.push("/login");
    }
  }, [status, isAdmin, router, loading, isGoogleSignIn]);
  if (status === "approved" || isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-2xl font-bold">
        Page Not Found
      </div>
    );
  }
  return <LoadingPage />;
}
