"use client";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutButtonWithConfirmation() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const cancelLogout = () => {
    setShowConfirmation(false);
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    await auth.signOut();
    router.push("/");
    setIsLoading(false);
  };

  return (
    <>
      <Button
        className="w-1/2 border-2 border-blue-500 text-blue-500 p-5 rounded-full cursor-pointer hover:bg-blue-100 hover:text-blue-700"
        onClick={handleLogoutClick}
      >
        Log Out
      </Button>

      {showConfirmation && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Logout</h3>
            <p className="mb-6">
              You have unsaved changes. Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={confirmLogout}
              >
                {isLoading ? <Loader2 className=" animate-spin" /> : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
