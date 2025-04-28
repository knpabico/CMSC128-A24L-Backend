<<<<<<< HEAD
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
=======
"use client";
import NotFound from "@/app/not-found";
import Home from "@/app/og-page";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, user } = useAuth();
  if (loading) {
    return <LoadingPage />;
  } else if (!isAdmin && user) {
    return <NotFound />;
  } else if (isAdmin) {
    return <div className="max-w-screen-lg mx-auto px-4 py-10">{children}</div>;
  } else if (!isAdmin && !user) {
    return <Home />;
  }
}
>>>>>>> origin/vinly-be-newsletter
