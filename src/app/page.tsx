"use client";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage />;
  if (!user) {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center">
        <h1 className="text-black text-[70px] font-bold">WELCOME, Guest!</h1>;
      </div>
    );
  }

  return (
    <div className="flex flex-row min-h-screen justify-center items-center">
      <h1 className="text-black text-[70px] font-bold">WELCOME {user.email}</h1>
      ;
    </div>
  );
}
