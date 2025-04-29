"use client";
import NotFound from "@/app/not-found";
import Home from "@/app/page";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin, status } = useAuth();
  console.log(`status: ${status}`);
  if (loading) {
    return <LoadingPage />;
  } else if (isAdmin || status !== "approved") {
    return <NotFound />;
  } else if (user) {
    return <div className="mt-18">{children}</div>;
  } else if (!isAdmin && !user) {
    return <Home />;
  }
}
