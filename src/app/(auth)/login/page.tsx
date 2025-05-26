"use client";
import { useAuth } from "@/context/AuthContext";
import LoginExample from "./login-example";
import LoadingPage from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isGoogleSignIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isGoogleSignIn) {
      router.push("/sign-up");
    }
  }, [isGoogleSignIn, router]);
  return (
    <>
      <title>Login | ICS-ARMS</title>
      {isGoogleSignIn ? <LoadingPage /> : <LoginExample />}
    </>
  );
}
