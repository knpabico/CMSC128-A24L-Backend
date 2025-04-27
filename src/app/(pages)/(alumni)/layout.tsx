"use client";
import NotFound from "@/app/not-found";
import Home from "@/app/page";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin, status, isGoogleSignIn } = useAuth();
  const router = useRouter();
  console.log(`status: ${status}`);
  useEffect(() => {
    if (isGoogleSignIn) {
      router.push("/sign-up");
    }
  }, [isGoogleSignIn, router]);
  if (loading || isGoogleSignIn) {
    return <LoadingPage />;
  } else if (isAdmin || status !== "approved") {
    return <NotFound />;
  } else if (user) {
    return <div className="">{children}</div>;
  } else if (!isAdmin && !user) {
    return <Home />;
  }
}
