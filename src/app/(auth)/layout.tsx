"use client";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user, isAdmin, isGoogleSignIn, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user || isAdmin) {
      if (isAdmin) router.push("/admin-dashboard");
      else if (!isGoogleSignIn) {
        router.push("/");
      }
    }
  }, [user, isAdmin, router, isGoogleSignIn]);
  if (isGoogleSignIn) {
    return (
      <div>
        {/* <Button
          onClick={() => {
            logOut();
          }}
        >
          Log Out
        </Button> */}
        {children}
      </div>
    );
  } else if (loading || user || isAdmin) {
    return <LoadingPage />;
  } else return <div>{children}</div>;
}
