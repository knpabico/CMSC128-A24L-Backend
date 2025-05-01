"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, user, isGoogleSignIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isGoogleSignIn) {
      router.push("/sign-up");
    } else if (!isAdmin && !user && !loading) {
      router.push("/");
    }
  }, [loading, isAdmin, user, router, isGoogleSignIn]);

  if (loading || isGoogleSignIn) {
    return <LoadingPage />;
  } else if (!isAdmin && user) {
    return <NotFound />;
  } else if (isAdmin) {
    return (
      <div
        className="ml-64"
        style={{ padding: "2%" }}
      >
        {children}
      </div>
    );
  } else if (!isAdmin && !user) {
    return <LoadingPage />;
  }
}