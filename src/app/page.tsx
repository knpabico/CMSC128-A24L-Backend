"use client";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { Alumni_Sans } from "next/font/google";

export default function Home() {
  const { user, loading, alumInfo } = useAuth();

  if (loading) return <LoadingPage />;
  if (!user) {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center">
        <h1 className="text-black text-[70px] font-bold">WELCOME, Guest!</h1>;
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row min-h-screen justify-center items-center">
        <h1 className="text-black text-[70px] font-bold">
          Welcome, {alumInfo!.name}!
        </h1>
      </div>
      <div>
        <p className="text-black text-[25px] font-bold">
          Email: {alumInfo!.email}
        </p>
        <p className="text-black text-[25px] font-bold">
          You are {alumInfo!.age} years old
        </p>
        <p className="text-black text-[25px] font-bold">
          You graduated in {alumInfo!.graduationYear}
        </p>
        <p className="text-black text-[25px] font-bold">
          Your student number is {alumInfo!.studentNumber}
        </p>
        <p className="text-black text-[25px] font-bold">
          You are currently working as a {alumInfo!.jobTitle} for{" "}
          {alumInfo?.companyName}
        </p>
      </div>
    </>
  );
}
