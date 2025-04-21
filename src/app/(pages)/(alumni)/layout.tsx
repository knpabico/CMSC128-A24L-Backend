"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) {
    return <LoadingPage />;
  } else if (!user) {
    return <NotFound />;
  } else
    return <div className="max-w-screen-lg mx-auto px-4 py-10">{children}</div>;
}
