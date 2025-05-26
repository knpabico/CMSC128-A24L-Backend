"use client";
import { useAuth } from "@/context/AuthContext";
import { HourglassIcon } from "lucide-react";
import { toastSuccess } from "./ui/sonner";

const RejectedPage = () => {
  const { logOut, logOutAndDelete } = useAuth();

  const handleLogout = () => {
    logOut();
    toastSuccess("User logged out");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center h-screen w-screen space-y-10">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
          {/* Content Header */}
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="pb-5 space-y-3">
              <HourglassIcon className="text-amber-400 w-10 h-10" />
              <h2 className="text-xl font-semibold text-gray-900">
                Your account has been sent for approval.
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Please wait for an email confirmation regarding your account
              status.
            </p>
          </div>

          {/* Content Body */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleLogout}
                className="w-40 text-sm col-span-6 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RejectedPage;
