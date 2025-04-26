"use client";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user || isAdmin) {
      router.push("/");
    }
  }, [user, isAdmin, router]);

  if (loading || user || isAdmin) {
    return <LoadingPage />;
  } else return <div>{children}</div>;
}
