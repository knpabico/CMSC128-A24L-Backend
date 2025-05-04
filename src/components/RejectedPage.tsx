import { BadgeXIcon } from "lucide-react";
import { useState } from 'react';

const RejectedPage = () => {
  const [isChecked, setIsChecked] = useState(false);

  // idk pano madedelete yung account pag cinlick yung checkbox, kaya kayo na bahala dito hehe
  const handleChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return <div>
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-white space-y-10">
      <BadgeXIcon className="text-red-500 w-25 h-25"/>
      <p className="text-5xl font-bold">Your account has been rejected.</p>
      <div className="flex flex-col justify-center items-center">
        <p>This may be due to incomplete or incorrect information, failure to meet eligibility requirements, or other validation issues.</p>
        <p>If you wish to reuse your email address to create a new account, please tick the checkbox below.</p>
      </div>
      
      <div className="flex space-x-3 justify-center items-center">
        <input type="checkbox" checked={isChecked} onChange={handleChange} className="appearance-none h-4 w-4 border-2 border-[#0856ba] rounded-xs checked:appearance-auto focus:outline-none cursor-pointer"/>
        <p className="text-[#0856ba]">I want to reuse my email address for a new account.</p>
      </div>

      {/* dapat dito lang madedelete yung account; dapat din babalik to sa landing page */}
      <button className="w-50 text-sm col-span-6 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]">Exit</button>
      
    </div>
  </div>;
};

export default RejectedPage;


// import { useState } from "react";
// import { AlertTriangle, X } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { toastSuccess } from "./ui/sonner";

// // Example usage
// export default function LogoutPage() {
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
//   const { logOut, logOutAndDelete } = useAuth();

//   const handleLogout = () => {
//     logOut();
//     toastSuccess("User logged out without deleting account");
//   };

//   const handleDelete = () => {
//     logOutAndDelete();
//     toastSuccess("User logged out AND deleted account");

//     // Implement actual account deletion logic here
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
//         <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
//           {/* Content Header */}
//           <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
//             <h2 className="text-xl font-semibold text-gray-900">
//               You&apos;re rejected!!
//             </h2>
//             <p className="mt-1 text-sm text-gray-500">
//               We are sorry but we have to reject your account. You can send an
//               appeal to <strong>cmsc128a24l@gmail.com</strong>
//             </p>
//           </div>

//           {/* Content Body */}
//           <div className="px-4 py-5 sm:p-6">
//             {showDeleteConfirmation ? (
//               <div className="space-y-6">
//                 <div className="flex items-start space-x-3">
//                   <div className="mt-0.5">
//                     <AlertTriangle size={20} className="text-red-500" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-gray-900">
//                       Delete Account Confirmation
//                     </h3>
//                     <p className="text-gray-700 mt-2">
//                       Are you sure you want to delete your account? This action
//                       cannot be undone.
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       If you delete your account, you can sign up again with the
//                       same email address. Otherwise, you will need to wait for
//                       an admin to reactivate your account.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
//                   <button
//                     onClick={() => setShowDeleteConfirmation(false)}
//                     className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
//                   >
//                     Go Back
//                   </button>
//                   <button
//                     onClick={handleDelete}
//                     className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//                   >
//                     Confirm Account Deletion
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="font-medium text-gray-900">
//                     You&apos;re about to log out
//                   </h3>
//                   <p className="text-gray-700 mt-2">
//                     Would you like to permanently delete your account or just
//                     log out?
//                   </p>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Deleting your account will remove all your data from our
//                     system. Otherwise, if you sent an appeal, we recommend not
//                     deleting the account
//                   </p>
//                 </div>

//                 <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
//                   <button
//                     onClick={() => setShowDeleteConfirmation(true)}
//                     className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
//                   >
//                     Delete Account
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//                   >
//                     Just Logout
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }