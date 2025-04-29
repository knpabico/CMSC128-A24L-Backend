"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { CircleUserRound, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, logOut, loading, isAdmin, status, isGoogleSignIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <div>
      {(isAdmin || isGoogleSignIn) && (
        <nav className="fixed top-0 left-0 w-64 h-screen">
          <div>
            ICS-ARMS
          </div>
          <div>
            <div>
              <div>
                Alumni
              </div>
              <div>
                <div>Manage Alumni</div>
                <div>View Pending Alumni</div>
                <div>Statistical Report</div>
              </div>
            </div>
            <div>
              <div>
                Events
              </div>
              <div>
                <div>Manage Events</div>
                <div>Add Events</div>
                <div>View Pending Events</div>
              </div>
            </div>
            <div>
              <div>
                Donations
              </div>
              <div>
                <div>Manage Donations</div>
                <div>Add Donations</div>
              </div>
            </div>
            <div>
              <div>
                Scholarship Grants
              </div>
              <div>
                <div>Manage Scholarships</div>
                <div>Add Scholarship Drive</div>
              </div>
            </div>
            <div>
              <div>
                Job Posting
              </div>
              <div>
                <div>Manage Job Posting</div>
                <div>Add Job Posting</div>
                <div>View Job Posting</div>
              </div>
            </div>
            <div>
              <div>
                Announcements
              </div>
              <div>
                <div>Manage Posts</div>
                <div>Add Posts</div>
              </div>
            </div>
          </div>
          <div>
            <button
              className="pl-5 pr-5 h-18 text-[var(--primary-white)] hover:bg-[var(--blue-600)] transition"
              onClick={() => handleSignOut()}
            >
              Sign Out
            </button>
          </div>
        </nav>

      )}

      {(user) && (
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

              {(isAdmin || isGoogleSignIn) && (
                <div className="flex items-center">
                  <button
                    className="pl-5 pr-5 h-18 text-[var(--primary-white)] hover:bg-[var(--blue-600)] transition"
                    onClick={() => handleSignOut()}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Navigation & Profile Menu for Logged-in User */}
              {user && !isGoogleSignIn && (
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
            {user && (
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
      )}
    </div>
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
