"use client";
import { useAuth } from "@/context/AuthContext";
import { HourglassIcon } from "lucide-react";

const RejectedPage = () => {
  const { logOut } = useAuth();
  return (
    <div>
      <div className="flex flex-col justify-center items-center h-screen w-screen bg-white space-y-10">
        <HourglassIcon className="text-amber-400 w-25 h-25" />
        <p className="text-5xl font-bold">
          Your account has been sent for approval.
        </p>
        <div className="flex flex-col justify-center items-center">
          <p>
            Please wait for an email confirmation regarding your account status.
          </p>
        </div>

        {/* dapat din babalik to sa landing page */}
        <button
          className="w-50 text-sm col-span-6 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]"
          onClick={logOut}
        >
          Exit
        </button>
      </div>
    </div>
  );
};

export default RejectedPage;
