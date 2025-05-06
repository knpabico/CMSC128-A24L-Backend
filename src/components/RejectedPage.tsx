import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toastSuccess } from "./ui/sonner";
import { BadgeXIcon } from "lucide-react";

// Example usage
export default function LogoutPage() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { logOut, logOutAndDelete } = useAuth();

  const handleLogout = () => {
    logOut();
    toastSuccess("User logged out");
  };

  const handleDelete = () => {
    logOutAndDelete();
    toastSuccess("User logged out AND deleted account");

    // Implement actual account deletion logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center h-screen w-screen space-y-10">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
          {/* Content Header */}
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="pb-5 space-y-3">
              <BadgeXIcon className="text-red-500 w-10 h-10"/>
              <h2 className="text-xl font-semibold text-gray-900">
                Your account has been rejected.
              </h2>
            </div>
            
            <p className="mt-1 text-sm text-gray-500">
            This may be due to incomplete or incorrect information, failure to meet eligibility requirements, or other validation issues. You can send an
              appeal to <strong>cmsc128a24l@gmail.com</strong>&nbsp;
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=cmsc128a24l@gmail.com&su=Registration%20Appeal%20Request"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline"
              >
                here
              </a>.
            </p>
          </div>

          {/* Content Body */}
          <div className="px-4 py-5 sm:p-6">
            {showDeleteConfirmation ? (
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 pb-3">
                      Are you sure you want to delete your account? This action
                      cannot be undone.
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      If you delete your account, you can sign up again with the
                      same email address. Otherwise, you will need to wait for
                      an admin to reactivate your account.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="w-40 text-sm col-span-6 bg-white border-1 border-gray-500 p-2 rounded-full cursor-pointer hover:bg-gray-100"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-60 text-sm col-span-6 hover:bg-red-300 text-white p-2 rounded-full cursor-pointer bg-red-500"
                  >
                    Confirm Account Deletion
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 pb-3">
                    Would you like to permanently delete your account or just
                    log out?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Deleting your account will remove all your data from our
                    system. Otherwise, if you sent an appeal, we recommend not
                    deleting the account.
                  </p>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="w-40 text-sm col-span-6 hover:bg-red-200 text-red-500 p-2 rounded-full cursor-pointer border-1 border-red-500"
                  >
                    Delete Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-40 text-sm col-span-6 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]"
                  >
                    Just Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}