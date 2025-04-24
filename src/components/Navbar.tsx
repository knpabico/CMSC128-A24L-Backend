"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logOut, loading } = useAuth();
  const router = useRouter();

  const navItems = [
    // { label: "See Newsletters", path: "/newsletters" },
    // { label: "See Alums", path: "/alumni-list" },
    // { label: "See Job Offers", path: "/joboffer-list" },
    // { label: "Announcements", path: "/announcement-list" },
    // { label: "See Events", path: "/events" },
    // { label: "Donation Drives", path: "/donationdrive-list" },
    // { label: "Donations", path: "/donations" },
    // { label: "Bookmarks", path: "/bookmark-list" },
    // { label: "My Profile", path: `/my-profile/${user?.uid}` },

    { label: "Home", path: "/"},
    { label: "Updates", path: "/"},
    { label: "Events", path: "/events"},
    { label: "Donations", path: "/"},
    { label: "Scholarships", path: "/"},
    { label: "Jobs", path: "/"},
    { label: "Alumni", path: "/"},
    { label: "Profile", path: "/"},
  ];

  return (
    <nav className="fixed w-full h-20 shadow-xl bg-blue-800">
      <div className="flex justify-between items-center h-full w-full px-10 2xl:px-30">
        <div>
          <div className="text-white font-bold">
            ICS-ARMS
          </div>
        </div>
        <div>
          <div className="hidden sm:flex">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="text-white hover:bg-blue-900 hover:text-white px-4 py-7"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

    </nav>
    // <nav style={{ backgroundColor: "#0856BA" }} >
    //   <div className="max-w-5xl mx-auto px-1 sm:px-2 lg:px-4">
    //     <div className="flex items-center justify-between h-18 bg-orange-400">
    //       <div className="flex items-center">
    //         <Link href="/" className="text-white font-bold text-lg">
    //           ICS-ARMS
    //         </Link>
    //       </div>

    //       <div className="hidden md:block">
    //         <div className="ml-4 flex items-center space-x-6">
    //           {!loading && !user && (
    //             <Link
    //               href="/"
    //               className="text-white hover:bg-white hover:text-black rounded-lg px-3 py-2"
    //             >
    //               Home
    //             </Link>
    //           )}

    //           {user &&
    //             navItems.map((item) => (
    //               <button
    //                 key={item.path}
    //                 onClick={() => router.push(item.path)}
    //                 className="text-white hover:bg-white hover:text-black rounded-lg px-3 py-2"
    //               >
    //                 {item.label}
    //               </button>
    //             ))}

    //           {user && (
    //             <button
    //               onClick={async () => {
    //                 await logOut();
    //                 router.refresh();
    //               }}
    //               className="text-white hover:bg-white hover:text-black rounded-lg px-3 py-2 font-bold"
    //             >
    //               Sign Out
    //             </button>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </nav>
  );
}
