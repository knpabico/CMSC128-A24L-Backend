"use client";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading, alumInfo } = useAuth();

  if (loading || (user && !alumInfo)) return <LoadingPage />;
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
        <p className="text-black text-[25px] font-bold">Age: {alumInfo!.age}</p>
        <p className="text-black text-[25px] font-bold">
          Graduation Year: {alumInfo!.graduationYear}
        </p>
        <p className="text-black text-[25px] font-bold">
          Birthdate: {alumInfo!.birthDate.toString()}
        </p>
        <p className="text-black text-[25px] font-bold">
          Student Number: {alumInfo!.studentNumber}
        </p>
        <p className="text-black text-[25px] font-bold">
          Job Title: {alumInfo!.jobTitle}
        </p>
        <p className="text-black text-[25px] font-bold">
          Field of Work: {alumInfo!.fieldOfWork}
        </p>
        <p className="text-black text-[25px] font-bold">
          Affiliation: {alumInfo!.affiliation}
        </p>
      </div>
    </>
  );
}
