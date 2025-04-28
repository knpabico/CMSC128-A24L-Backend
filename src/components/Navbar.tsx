"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { CircleUserRound, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { stat } from "fs";

export default function Navbar() {
  const {
    user,
    logOut,
    loading,
    isAdmin,
    status,
    isGoogleSignIn,
    logOutAndDelete,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dropdownRef = useRef(null);
  const menuRef = useRef(null); // Reference for mobile menu container

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Announcements", path: "/announcement" },
    { label: "Events", path: "/events" },
    { label: "Donations", path: "/donationdrive-list" },
    { label: "Scholarships", path: "/scholarship" },
    { label: "Jobs", path: "/joboffer-list" },
    { label: "Alumni", path: "/alumni-list" },
  ];

  const handleNavClick = (path) => {
    setMenuOpen(false);
    setDropdownOpen(false);
    router.push(path);
  };

  const handleProfileClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    if (status === "rejected") {
      await logOutAndDelete(); // Assuming you have a function to delete the user
    }
    await logOut();
    setMenuOpen(false);
    setDropdownOpen(false);
    router.refresh();
  };

  useEffect(() => {
    // Handle click outside to close dropdown and mobile menu
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setMenuOpen(false); // Close the mobile menu
        setDropdownOpen(false); // Close the profile dropdown
      }
    };

    // Add event listener to detect clicks outside
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 w-full shadow-md z-50">
      <div
        className="flex items-center justify-between h-18"
        style={{ paddingLeft: "10%", paddingRight: "10%" }}
      >
        {/* Logo */}
        <div className="text-white font-[800] text-xl">ICS-ARMS</div>

        <div>
          {/* Login Button */}
          {!loading && !user && !isAdmin && (
            <div className="flex items-center">
              <button
                className="pl-5 pr-5 h-18 text-[var(--primary-white)] hover:bg-[var(--blue-600)] transition"
                onClick={() => router.push("/login")}
              >
                Log In
              </button>
            </div>
          )}

          {(isAdmin ||
            isGoogleSignIn ||
            (user && status && status !== "approved")) && (
            <div className="flex items-center">
              <button
                className="pl-5 pr-5 h-18 text-[var(--primary-white)] hover:bg-[var(--blue-600)] transition"
                onClick={() => {
                  if (user && status === "rejected") {
                    setShowDeleteModal(true);
                  } else {
                    handleSignOut();
                  }
                }}
              >
                Sign Out
              </button>

              {/* Delete Account Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0  flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-xl font-semibold mb-4 text-black">
                      Account Deletion
                    </h3>
                    <p className="mb-6 text-black">
                      Your application was rejected. By signing out, your
                      account will be deleted so you can apply again. Do you
                      want to continue?
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-700 transition"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        onClick={() => {
                          setShowDeleteModal(false);
                          handleSignOut();
                        }}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation & Profile Menu for Logged-in User */}
          {user && !isGoogleSignIn && status === "approved" && (
            <div className="hidden xl:flex items-center">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  className="flex flex-col items-center cursor-pointer hover:bg-[var(--blue-600)] transition-colors"
                >
                  <div className="h-1 w-full"></div>
                  <div
                    className="h-16 flex items-center pl-5 pr-5"
                    onClick={() => handleNavClick(item.path)}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`h-1 w-full ${
                      pathname === item.path ? "bg-[var(--primary-white)]" : ""
                    }`}
                  ></div>
                </div>
              ))}

              {/* Profile Dropdown */}
              <div
                className="flex flex-col items-center cursor-pointer relative"
                ref={dropdownRef}
              >
                <div className="h-1 w-full"></div>
                <div
                  className="h-18 flex items-center pl-5 pr-5 cursor-pointer group"
                  onClick={handleProfileClick}
                >
                  <div className="h-10 w-10 flex rounded-full">
                    <img
                      src="https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                      className="w-10 h-10 mb-5 object-cover object-top rounded-full border-2 group-hover:border-[var(--blue-200)] transition-colors"
                    />
                  </div>
                  <ChevronDown className="ml-1 group-hover:text-[var(--blue-200)]" />
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute top-17 bg-white shadow-md rounded-lg py-2 text-[var(--primary-blue)]"
                    onClick={() => router.push(`/my-profile/${user?.uid}`)}
                  >
                    {
                      <button className="w-full text-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Profile
                      </button>
                    }
                    <button
                      className="w-full text-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
                <div
                  className={`h-1 w-full ${
                    pathname.startsWith("/my-profile")
                      ? "bg-[var(--primary-white)]"
                      : ""
                  }`}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        {user && !isGoogleSignIn && status === "approved" && (
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="cursor-pointer"
            >
              {menuOpen ? (
                <X color="white" size={30} />
              ) : (
                <Menu color="white" size={30} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="flex flex-col w-full pb-5 xl:hidden" ref={menuRef}>
          {navItems.map((item) => (
            <div
              key={item.path}
              className="py-3 text-center border-blue-300 text-white hover:bg-[var(--blue-600)] transition-colors cursor-pointer"
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </div>
          ))}
          <div
            className="py-3 text-center text-white hover:bg-[var(--blue-600)] transition-colors cursor-pointer"
            onClick={() => handleNavClick(`/my-profile/${user?.uid}`)}
          >
            Profile
          </div>
          <div
            className="py-3 text-center text-white hover:bg-[var(--blue-600)] transition-colors cursor-pointer"
            onClick={handleSignOut}
          >
            Sign Out
          </div>
        </div>
      )}
    </nav>
  );
}

//  {(user || isAdmin || isGoogleSignIn) && (
//                 <button
//                   onClick={async () => {
//                     await logOut();
//                     router.refresh();
//                   }}
//                   className="text-white hover:bg-white hover:text-black rounded-lg px-3 py-2 font-bold"
//                 >
//                   Sign Out
//                 </button>
//               )}
