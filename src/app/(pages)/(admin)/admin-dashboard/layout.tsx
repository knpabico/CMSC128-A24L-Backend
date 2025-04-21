"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return <LoadingPage />;
  } else if (!isAdmin) {
    return <NotFound />;
  } else
    return <div className="max-w-screen-lg mx-auto px-4 py-10">{children}</div>;
}
