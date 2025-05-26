"use client";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// Separate the authentication and routing logic into a client component
function AuthChecker() {
  const { isGoogleSignIn, status, isAdmin, loading } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = searchParams.get("pathname");

  useEffect(() => {
    if (isGoogleSignIn) {
      router.push("/sign-up");
    } else if (status !== "approved" && !isAdmin && !loading) {
      if (!pathname?.startsWith("/public-announcement")) {
        router.push("/login");
      }
    }
  }, [status, isAdmin, router, loading, isGoogleSignIn, pathname]);

  if (status === "approved" || isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-2xl font-bold">
        Page Not Found
      </div>
    );
  }

  return <LoadingPage />;
}

// Main component that wraps the auth logic in Suspense
export default function NotFoundContent() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AuthChecker />
    </Suspense>
  );
}
