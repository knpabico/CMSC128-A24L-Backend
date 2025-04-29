"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin && !user && !loading) {
      router.push("/");
    }
  }, [loading, isAdmin, user, router]);

  if (loading) {
    return <LoadingPage />;
  } else if (!isAdmin && user) {
    return <NotFound />;
  } else if (isAdmin) {
    return <div className="">{children}</div>;
  } else if (!isAdmin && !user) {
    return <LoadingPage />;
  }
}
