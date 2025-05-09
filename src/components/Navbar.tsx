"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  CircleUserRound,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { stat } from "fs";
import Image from "next/image";

export default function Navbar() {
  const {
    user,
    logOut,
    loading,
    isAdmin,
    status,
    isGoogleSignIn,
    logOutAndDelete,
    alumInfo,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Dynamic navigation configuration
  const navConfig = [
    {
      id: "alumni",
      label: "Alumni",
      initiallyCollapsed: false,
      subItems: [
        {
          id: "manage-alumni",
          label: "Manage Alumni",
          path: "/admin-dashboard/manage-users",
        },
        {
          id: "pending-alumni",
          label: "View Pending Alumni",
          path: "/admin-dashboard/manage-users",
        },
        {
          id: "stats-alumni",
          label: "Statistical Report",
          path: "/admin-dashboard/alum-statistical-reports",
        },
      ],
    },
    {
      id: "events",
      label: "Events",
      initiallyCollapsed: true,
      subItems: [
        {
          id: "manage-events",
          label: "Manage Events",
          path: "/admin-dashboard/organize-events",
        },
        { id: "add-events", label: "Add Events", path: "/admin/events/add" },
        {
          id: "pending-events",
          label: "View Pending Events",
          path: "/admin-dashboard/organize-events",
        },
        {
          id: "stats-events",
          label: "Statistical Report",
          path: "/admin-dashboard/events-statistical-reports",
        },
      ],
    },
    {
      id: "donations",
      label: "Donations",
      initiallyCollapsed: true,
      subItems: [
        {
          id: "manage-donations",
          label: "Manage Donations",
          path: "/admin-dashboard/donation-drive/manage",
        },
        {
          id: "add-donations",
          label: "Add Donations",
          path: "/admin-dashboard/donation-drive/add",
        },
        {
          id: "stats-donation",
          label: "Statistical Report",
          path: "/admin-dashboard/donations-statistical-reports",
        },
      ],
    },
    {
      id: "scholarships",
      label: "Scholarship Grants",
      initiallyCollapsed: true,
      subItems: [
        {
          id: "manage-scholarships",
          label: "Manage Scholarships",
          path: "/admin-dashboard/scholarships/manage",
        },
        {
          id: "add-scholarships",
          label: "Add Scholarship Drive",
          path: "/admin-dashboard/scholarships/add",
        },
      ],
    },
    {
      id: "jobs",
      label: "Job Posting",
      initiallyCollapsed: true,
      subItems: [
        {
          id: "manage-jobs",
          label: "Manage Job Posting",
          path: "/admin-dashboard/job-postings",
        },
        { id: "add-jobs", label: "Add Job Posting", path: "/admin/jobs/add" },
      ],
    },
    {
      id: "announcements",
      label: "Announcements",
      initiallyCollapsed: true,
      subItems: [
        {
          id: "manage-announcements",
          label: "Manage Posts",
          path: "/admin-dashboard/create-announcements",
        },
        {
          id: "add-announcements",
          label: "Add Posts",
          path: "/admin-dashboard/create-announcements",
        },
      ],
    },
    {
      id: "featuredStory",
      label: "featuredStory",
      initiallyCollapsed: true,
      subItems: [
        {
          id: "manage-featuredStory",
          label: "Write A Story",
          path: "/admin-dashboard/create-story",
        },
        // { id: 'add-featuredStory', label: 'Add Feat', path: '/admin/announcements/add' },
      ],
    },
  ];

  // Generate initial collapsed state from config
  const generateInitialCollapsedState = () => {
    const initialState = {};
    navConfig.forEach((section) => {
      initialState[section.id] = section.initiallyCollapsed;
    });
    return initialState;
  };

  // State to track which sections are collapsed
  const [collapsedSections, setCollapsedSections] = useState(
    generateInitialCollapsedState()
  );

  // State to track active section and subheading
  const [activeSection, setActiveSection] = useState(null);
  const [activeSubheading, setActiveSubheading] = useState(null);

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
    { label: "Story", path: "/create-story" },
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
  };

  // Toggle section collapse
  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
    setActiveSection(sectionId);
    setActiveSubheading(null); // Clear active subheading when changing sections
  };

  // Handle subheading click
  const handleSubheadingClick = (sectionId, subheadingId, path = null) => {
    setActiveSection(sectionId);
    setActiveSubheading(subheadingId);
    if (path) {
      router.push(path);
    }
  };

  // Function to check if a subitem is active based on the current path
  const isSubItemActive = (path) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Function to find and set active section and subheading based on current pathname
  const findActiveFromPath = () => {
    if (!pathname) return;

    for (const section of navConfig) {
      for (const subItem of section.subItems) {
        if (isSubItemActive(subItem.path)) {
          setActiveSection(section.id);
          setActiveSubheading(subItem.id);

          // Ensure the section is expanded
          setCollapsedSections((prev) => ({
            ...prev,
            [section.id]: false,
          }));
          return;
        }
      }
    }
  };

  // Update active state when path changes
  useEffect(() => {
    findActiveFromPath();
  }, [pathname]);

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
  }, [dropdownRef, menuRef]);

  return (
    <div>
      {!loading && !user && !isAdmin && <></>}

      {user && !isGoogleSignIn && status === "approved" && (
        <nav className="fixed top-0 w-full shadow-md z-50">
          <div
            className="flex items-center justify-between h-18"
            style={{ paddingLeft: "10%", paddingRight: "10%" }}
          >
            {/* Logo */}
            <div
              className="text-white font-[800] text-xl"
              onClick={() => router.push("/")}
            >
              ICS-ARMS
            </div>

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
                        pathname === item.path
                          ? "bg-[var(--primary-white)]"
                          : ""
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
                      <Image
                        alt="Pic"
                        priority
                        width={0}
                        height={0}
                        sizes="100vw"
                        src={
                          alumInfo &&
                          alumInfo!.image !== "" &&
                          alumInfo!.image !== null
                            ? alumInfo!.image
                            : "https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                        }
                        className="w-10 h-10 mb-5 object-cover object-top rounded-full border-2 group-hover:border-[var(--blue-200)] transition-colors"
                      />
                    </div>
                    <ChevronDown className="ml-1 group-hover:text-[var(--blue-200)]" />
                  </div>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute top-17 bg-white shadow-md rounded-lg py-2 text-[var(--primary-blue)]">
                      {
                        <button
                          className="w-full text-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() =>
                            router.push(`/my-profile/${user?.uid}`)
                          }
                        >
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

            {/* Mobile Menu */}
            {menuOpen && (
              <div
                className="flex flex-col w-full pb-5 xl:hidden"
                ref={menuRef}
              >
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
          </div>
        </nav>
      )}

      {isAdmin && (
        <nav
          className="fixed top-0 left-0 w-20 md:w-64 h-screen flex flex-col justify-between gap-5 bg-gray-900 text-white"
          style={{ paddingTop: "2%", paddingBottom: "2%" }}
        >
          <div className="text-xl font-bold px-5">ICS-ARMS</div>
          <div className="flex-1 overflow-y-auto">
            {/* Dynamically generate menu sections */}
            {navConfig.map((section) => (
              <div className="mb-2" key={section.id}>
                <div
                  className={`flex items-center justify-between cursor-pointer hover:text-blue-300 ${
                    activeSection === section.id ? "bg-[var(--blue-600)]" : ""
                  }`}
                  style={{ padding: "3% 10% 3% 10%" }}
                  onClick={() => toggleSection(section.id)}
                >
                  {section.label}
                  {collapsedSections[section.id] ? (
                    <ChevronDown className="cursor-pointer" size={20} />
                  ) : (
                    <ChevronUp className="cursor-pointer" size={20} />
                  )}
                </div>
                {!collapsedSections[section.id] && (
                  <div>
                    {section.subItems.map((subItem) => (
                      <div
                        key={subItem.id}
                        className={`hover:bg-[var(--blue-600)] cursor-pointer ${
                          activeSection === section.id &&
                          activeSubheading === subItem.id
                            ? "text-sky-400 font-bold"
                            : ""
                        }`}
                        style={{ padding: "3% 10% 3% 18%" }}
                        onClick={() =>
                          handleSubheadingClick(
                            section.id,
                            subItem.id,
                            subItem.path
                          )
                        }
                      >
                        {subItem.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            className="hover:bg-[var(--blue-600)] cursor-pointer"
            style={{ padding: "5% 10% 5% 10%" }}
          >
            <button
              className="text-white flex items-center gap-2 cursor-pointer"
              onClick={() => handleSignOut()}
            >
              <LogOut size={20} /> Log Out
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
