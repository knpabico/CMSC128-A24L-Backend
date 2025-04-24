"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logOut, loading, isAdmin, status } = useAuth();
  const router = useRouter();

  const navItems = [
    { label: "Announcement", path: "/announcement" },
    { label: "Events", path: "/events" },
    { label: "Donations", path: "/donationdrive-list" },
    { label: "Scholarships", path: "/scholarship" },
    { label: "Job Posting", path: "/joboffer-list" },
    { label: "Alumni Records", path: "/alumni-list" },
    // { label: "Bookmarks", path: "/bookmark-list" },
    // { label: "My Profile", path: `/my-profile/${user?.uid}` },
  ];

  return (
    <nav style={{ backgroundColor: "#0856BA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex-shrink-0">
            <Link href="/" className="text-white font-bold text-lg">
              ICS-ARMS
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-6">
              {!loading && !user && (
                <Link
                  href="/"
                  className="text-white hover:bg-white hover:text-black rounded-lg px-3 py-2"
                >
                  Home
                </Link>
              )}

              {user &&
                status == "approved" &&
                navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className="text-white hover:bg-white hover:text-black rounded-lg px-3 py-2"
                  >
                    {item.label}
                  </button>
                ))}

              {(user || isAdmin) && (
                <button
                  onClick={async () => {
                    await logOut();
                    router.refresh();
                  }}
                  className="text-white hover:bg-white hover:text-black rounded-lg px-3 py-2 font-bold"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
