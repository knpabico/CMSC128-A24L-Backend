import { useAuth } from "@/context/AuthContext";
import { BadgeXIcon } from "lucide-react";
import { useState } from "react";
import { toastSuccess } from "./ui/sonner";

const RejectedPage = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { loading, logOutAndDelete, logOut } = useAuth();

  // idk pano madedelete yung account pag cinlick yung checkbox, kaya kayo na bahala dito hehe
  interface HandleChangeEvent {
    target: {
      checked: boolean;
    };
  }

  const handleChange = (event: HandleChangeEvent): void => {
    setIsChecked(event.target.checked);
  };

  const handleLogOut = () => {
    if (isChecked) {
      logOutAndDelete();
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center h-screen w-screen bg-white space-y-10">
        <BadgeXIcon className="text-red-500 w-25 h-25" />
        <p className="text-5xl font-bold">Your account has been rejected.</p>
        <div className="flex flex-col justify-center items-center">
          <p>
            This may be due to incomplete or incorrect information, failure to
            meet eligibility requirements, or other validation issues.
          </p>
          <p>
            If you wish to reuse your email address to create a new account,
            please tick the checkbox below.
          </p>
        </div>

        <div className="flex space-x-3 justify-center items-center">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="appearance-none h-4 w-4 border-2 border-[#0856ba] rounded-xs checked:appearance-auto focus:outline-none cursor-pointer"
          />
          <p className="text-[#0856ba]">
            I want to reuse my email address for a new account.
          </p>
        </div>

        {showModal && isChecked && (
          <div className="fixed inset-0  flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-black">
                Account Deletion
              </h3>
              <p className="mb-6 text-black">
                Your application was rejected. By signing out, your account will
                be deleted so you can apply again. Do you want to continue?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-700 transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  onClick={() => {
                    handleLogOut();
                    setShowModal(false);
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* dapat dito lang madedelete yung account; dapat din babalik to sa landing page */}
        <button
          disabled={loading}
          onClick={() => {
            setShowModal(true);
            logOut();
          }}
          className="w-50 text-sm col-span-6 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]"
        >
          {isChecked ? "Sign Out & Delete" : "Sign Out"}
        </button>
      </div>
    </div>
  );
};

export default RejectedPage;
