"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logOut, loading } = useAuth();
  const router = useRouter();

  const navItems = [
    { label: "See Newsletters", path: "/newsletters" },
    { label: "See Alums", path: "/alumni-list" },
    { label: "See Job Offers", path: "/joboffer-list" },
    { label: "Announcements", path: "/announcement-list" },
    { label: "See Events", path: "/events" },
    { label: "Donation Drives", path: "/donationdrive-list" },
    { label: "Sponsorship", path: "/sponsorship" },
    { label: "Donations", path: "/donations" },
    { label: "Bookmarks", path: "/bookmark-list" },
    { label: "My Profile", path: `/my-profile/${user?.uid}` },
  ];

  return (
    <div className="flex">
      <div className="p-3">
        <Link className="text-black font-bold p-3" href="/">
          Website Logo
        </Link>
      </div>

      {!loading && !user && (
        <>
          <div className="p-3">
            <Link href="/login" className="text-black font-bold">
              Log In
            </Link>
          </div>
          <div className="p-3">
            <Link href="/sign-up" className="text-black font-bold">
              Sign Up
            </Link>
          </div>
        </>
      )}

      {user && (
        <>
          {navItems.map((item) => (
            <div key={item.path} className="p-3 text-black font-bold ">
              <button
                onClick={() => router.push(item.path)}
                className=" cursor-pointer"
              >
                {item.label}
              </button>
            </div>
          ))}
          <div className="p-3 text-black font-bold ">
            <button
              className=" cursor-pointer"
              onClick={async () => {
                await logOut();
                router.refresh();
              }}
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
