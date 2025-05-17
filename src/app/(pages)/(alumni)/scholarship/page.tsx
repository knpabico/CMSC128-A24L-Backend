"use client";

import React, { useState, useEffect } from "react";
import { useScholarship } from "@/context/ScholarshipContext";
import BookmarkButton from "@/components/ui/bookmark-button";
import {
  CalendarDays,
  Bookmark,
  HandHeart,
  BookOpen,
  Clock,
  User,
  Filter,
  ChevronDown,
  Calendar,
  CircleCheck,
  CircleX,
  HelpCircle,
} from "lucide-react";
import { useBookmarks } from "@/context/BookmarkContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFeatured } from "@/context/FeaturedStoryContext";
import {
  Featured,
  Scholarship,
  ScholarshipStudent,
  Student,
} from "@/models/models";
import Banner from "@/components/Banner";
import { PdfPreviewDialog } from "./PdfPreviewDialog";
import Image from "next/image";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";

  if (status === "active") {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (status === "closed") {
    bgColor = "bg-gray-100";
    textColor = "text-gray-800";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${bgColor} ${textColor} capitalize`}
    >
      {status}
    </span>
  );
};

// Status Filter Component
type FilterOption =
  | "all"
  | "active"
  | "closed"
  | "approved"
  | "pending"
  | "rejected";

interface StatusFilterProps {
  activeFilter: FilterOption;
  setActiveFilter: (filter: FilterOption) => void;
  options?: FilterOption[];
}

const StatusFilterDropdown = ({
  activeFilter = "all",
  setActiveFilter,
  options = ["all", "active", "closed"],
}: StatusFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectOption = (option: FilterOption) => {
    setActiveFilter(option);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    switch (activeFilter) {
      case "all":
        return "All";
      case "active":
        return "Active";
      case "closed":
        return "Closed";
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return "All";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Status:</span>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between min-w-32 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="text-gray-900">{getDisplayText()}</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <ul className="py-1" role="listbox">
              {options.map((option) => (
                <li key={option} role="option" aria-selected={activeFilter === option}>
                  <button
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                      activeFilter === option
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                    onClick={() => selectOption(option)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

type SortOption = "latest" | "oldest" | "most-sponsors" | "least-sponsors";
interface SortControlProps {
  sortOrder: SortOption;
  setSortOrder: (order: SortOption) => void;
  activeTab: string;
}
const SortControlDropdown = ({
  sortOrder = "latest",
  setSortOrder,
  activeTab,
}: SortControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const selectOption = (option: SortOption) => {
    setSortOrder(option);
    setIsOpen(false);
  };
  const getDisplayText = () => {
    switch (sortOrder) {
      case "latest":
        return "Latest first";
      case "oldest":
        return "Oldest first";
      case "most-sponsors":
        return "Most sponsors";
      case "least-sponsors":
        return "Least sponsors";
      default:
        return "Latest first";
    }
  };
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Sort:</span>

      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between min-w-36 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="text-gray-900">{getDisplayText()}</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <ul className="py-1" role="listbox">
              <li role="option" aria-selected={sortOrder === "latest"}>
                <button
                  className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    sortOrder === "latest"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                  onClick={() => selectOption("latest")}
                >
                  Latest first
                </button>
              </li>
              <li role="option" aria-selected={sortOrder === "oldest"}>
                <button
                  className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    sortOrder === "oldest"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                  onClick={() => selectOption("oldest")}
                >
                  Oldest first
                </button>
              </li>

              {/* Only show sponsor-related options if the active tab is not "stories" */}
              {activeTab !== "stories" && (
                <>
                  <li
                    role="option"
                    aria-selected={sortOrder === "most-sponsors"}
                  >
                    <button
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        sortOrder === "most-sponsors"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                      onClick={() => selectOption("most-sponsors")}
                    >
                      Most sponsors
                    </button>
                  </li>
                  <li
                    role="option"
                    aria-selected={sortOrder === "least-sponsors"}
                  >
                    <button
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        sortOrder === "least-sponsors"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                      onClick={() => selectOption("least-sponsors")}
                    >
                      Least sponsors
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ScholarshipPage: React.FC = () => {
  const { scholarships, students, scholarshipStudents, loading, error } =
    useScholarship();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FilterOption>("all");
  const [sortOrder, setSortOrder] = useState<
    "latest" | "oldest" | "most-sponsors" | "least-sponsors"
  >("latest");
  const router = useRouter();

  const { featuredItems, isLoading: featuredLoading } = useFeatured();
  const [selectedScholarshipStudentId, setSelectedScholarshipStudentId] =
    useState<string | null>(null);
  const [userScholarshipStudent, setUserScholarshipStudent] = useState<
    ScholarshipStudent[]
  >([]);
  const [scholarshipStories, setScholarshipStories] = useState<Featured[]>([]);
  const [scholarshipMapping, setScholarshipMapping] = useState<
    Record<string, string>
  >({});
  const [studentMapping, setStudentMapping] = useState<Record<string, string>>(
    {}
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    // Filter featured items with type "scholarship"
    if (featuredItems && featuredItems.length > 0) {
      const filteredStories = featuredItems.filter(
        (item: Featured) => item.type === "scholarship"
      );
      setScholarshipStories(filteredStories);
    }
  }, [featuredItems]);

  useEffect(() => {
    //function to fetch student while being mapped to studentId
    const mapStudent = async () => {
      if (students.length === 0) return;
      if (!students) return;

      try {
        //intialize as empty record
        const studentMap: Record<string, string> = {};
        //fetch student
        const fetchStudent = students.forEach((student: Student) => {
          studentMap[student.studentId] = student.name;
        });
        //set scholarship student map
        setStudentMapping(studentMap);
      } catch (error) {
        console.error("Error fetching scholarshipStudent:", error);
        return [];
      }
    };

    //function to fetch scholarship while being mapped to scholarshipId
    const mapScholarship = async () => {
      if (scholarshipStudents.length === 0) return;
      if (!scholarshipStudents) return;

      try {
        //intialize as empty record
        const scholarshipMap: Record<string, string> = {};
        //fetch student
        const fetchScholarship = scholarships.forEach(
          (scholarships: Scholarship) => {
            scholarshipMap[scholarships.scholarshipId] = scholarships.title;
          }
        );
        //set scholarship student map
        setScholarshipMapping(scholarshipMap);
      } catch (error) {
        console.error("Error fetching scholarshipStudent:", error);
        return [];
      }
    };

    const fetchUserScholarshipStudent = async () => {
      if (scholarshipStudents.length === 0) return;
      if (!scholarshipStudents) return;

      try {
        //fetch scholarshipStudent of user
        const scholarshipStudentList = scholarshipStudents.filter(
          (scholarship: ScholarshipStudent) => scholarship.alumId === user?.uid
        );
        //set user scholarship student
        setUserScholarshipStudent(scholarshipStudentList);
      } catch (error) {
        console.error("Error fetching scholarshipStudent:", error);
        return [];
      }
    };

    mapStudent();
    mapScholarship();
    fetchUserScholarshipStudent();
  }, [students, scholarships, scholarshipStudents]);

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      if (date?.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return "Invalid date";
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleToggleBookmark = async (
    e: React.MouseEvent,
    scholarshipId: string
  ) => {
    // Stop event propagation to prevent navigation when clicking the bookmark button
    e.stopPropagation();
    await toggleBookmark(scholarshipId, "scholarship");
  };

  const navigateToDetail = (scholarshipId: string) => {
    router.push(`/scholarship/${scholarshipId}`);
  };

  const navigateToFeaturedDetail = (featuredId: string) => {
    router.push(`/scholarship/featured/${featuredId}`);
  };

  // Function to determine if scholarship is active based on deadline
  const isScholarshipActive = (scholarship: Scholarship) => {
    if (scholarship.status === "deleted") return false;

    if (scholarship.status) {
      return scholarship.status === "active";
    }

    // Default to active if no status or deadline
    return true;
  };

  // Get scholarship status
  const getScholarshipStatus = (scholarship: Scholarship) => {
    if (scholarship.status === "deleted") return "deleted";

    if (scholarship.status) {
      return scholarship.status;
    }

    // Default
    return "active";
  };

  if (loading || featuredLoading)
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  // First filter based on tab
  const tabFilteredScholarships = (() => {
    // Remove all scholarships with status "deleted"
    const nonDeletedScholarships = scholarships.filter(
      (scholarship: Scholarship) => getScholarshipStatus(scholarship) !== "deleted"
    );

    switch (activeTab) {
      case "saved":
        return nonDeletedScholarships.filter((scholarship: Scholarship) =>
          isBookmarked(scholarship.scholarshipId)
        );
      case "myScholars":
        // Only show scholarships where the current user is in the alumList
        return user
          ? nonDeletedScholarships.filter((scholarship: Scholarship) =>
              scholarship.alumList.includes(user.uid)
            )
          : [];
      case "stories":
        return [];
      default:
        return nonDeletedScholarships;
    }
  })();

  // Then filter based on status
  const filteredScholarships = (() => {
    if (statusFilter === "all") {
      return tabFilteredScholarships;
    } else if (statusFilter === "active") {
      return tabFilteredScholarships.filter((scholarship: Scholarship) =>
        isScholarshipActive(scholarship)
      );
    } else {
      // closed
      return tabFilteredScholarships.filter(
        (scholarship: Scholarship) => !isScholarshipActive(scholarship)
      );
    }
  })();

  // Sort the scholarships based on datePosted or sponsors
  const sortedScholarships = [...filteredScholarships].sort((a, b) => {
    // Sort by date
    if (sortOrder === "latest" || sortOrder === "oldest") {
      const dateA = new Date(a.datePosted).getTime();
      const dateB = new Date(b.datePosted).getTime();

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    }

    // Sort by number of sponsors
    if (sortOrder === "most-sponsors" || sortOrder === "least-sponsors") {
      const sponsorsA = a.alumList ? a.alumList.length : 0;
      const sponsorsB = b.alumList ? b.alumList.length : 0;

      return sortOrder === "most-sponsors"
        ? sponsorsB - sponsorsA
        : sponsorsA - sponsorsB;
    }

    return 0;
  });

  // Sort the scholarship stories based on datePosted
  const sortedScholarshipStories = [...scholarshipStories].sort((a, b) => {
    const dateA = a.datePosted && new Date(a.datePosted).getTime();

    const dateB = b.datePosted && new Date(b.datePosted).getTime();

    return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
  });

  // Filtering and sorting for myScholars tab
const filteredUserScholarshipStudent = [...userScholarshipStudent]
  .filter((scholarshipStudent) => {
    const status = scholarshipStudent.status?.toLowerCase();
    if (activeTab === "myScholars") {
      if (statusFilter === "all") {
        return ["approved", "pending", "rejected"].includes(status);
      }
      return status === statusFilter;
    }
    return true;
  });

  // Status filter options based on tab
  const statusFilterOptions: FilterOption[] =
    activeTab === "myScholars"
      ? ["all", "approved", "pending", "rejected"]
      : ["all", "active", "closed"];

  return (
    <div className="bg-[#EAEAEA] h-full">
      {/*Page Title*/}
      <Banner
        title="Scholarship Drives"
        description="Make a difference by participating in ICS and alumni scholarship drives, providing essential support for the next generation of ICS scholars."
      />

      {/* Tabs */}
      <div className="my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[100px] xl:mx-[200px] static">
        <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7">
          <button
            onClick={() => setActiveTab("all")}
            className="flex items-center gap-3"
          >
            <CalendarDays />
            <p
              className={`group w-max relative py-1 transition-all ${
                activeTab === "all"
                  ? "font-semibold border-b-3 border-blue-500"
                  : "text-gray-700 group"
              }`}
            >
              <span>All Scholarships</span>
              {activeTab !== "all" && (
                <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              )}
            </p>
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className="flex items-center gap-3"
          >
            <Bookmark />
            <p
              className={`group w-max relative py-1 transition-all ${
                activeTab === "saved"
                  ? "font-semibold border-b-3 border-blue-500"
                  : "text-gray-700 group"
              }`}
            >
              <span>Saved Scholarships</span>
              {activeTab !== "saved" && (
                <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              )}
            </p>
          </button>
          <button
            onClick={() => setActiveTab("myScholars")}
            className="flex items-center gap-3"
          >
            <HandHeart />
            <p
              className={`group w-max relative py-1 transition-all ${
                activeTab === "myScholars"
                  ? "font-semibold border-b-3 border-blue-500"
                  : "text-gray-700 group"
              }`}
            >
              <span>My Scholars</span>
              {activeTab !== "myScholars" && (
                <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              )}
            </p>
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className="flex items-center gap-3"
          >
            <BookOpen />
            <p
              className={`group w-max relative py-1 transition-all ${
                activeTab === "stories"
                  ? "font-semibold border-b-3 border-blue-500"
                  : "text-gray-700 group"
              }`}
            >
              <span>Featured Stories</span>
              {activeTab !== "stories" && (
                <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
              )}
            </p>
          </button>
        </div>

        <div className="flex flex-col gap-[10px] w-full mb-10">
          {/* Filter and Sort Controls */}
          <div className="bg-[#FFFFFF] rounded-[10px] px-5 py-2 lg:py-1 flex flex-col items-start lg:flex-row lg:justify-between lg:items-center shadow-md border border-gray-200">
            <h2 className="text-md lg:text-lg font-semibold">
              {activeTab === "all"
                ? "All Scholarships"
                : activeTab === "saved"
                ? "Saved Scholarships"
                : activeTab === "myScholars"
                ? "My Scholars"
                : "Featured Stories"}
            </h2>
            <div className="flex justify-between items-center gap-2">
              {/* Status Filter - Only show on non-stories tabs */}
              {activeTab !== "stories" ? (
                <div className="flex justify-center items-center">
                  <StatusFilterDropdown
                    activeFilter={statusFilter}
                    setActiveFilter={setStatusFilter}
                    options={statusFilterOptions}
                  />
                  <div>|</div>
                </div>
              ) : (
                <div></div> /* Empty div as placeholder for layout when filter is not shown */
              )}
              {/* Simple Sort Control - Show on all tabs */}
              {activeTab !== "myScholars" && (
              <SortControlDropdown
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                activeTab={activeTab}
              />
              )}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "stories" ? (
            <>
              {scholarshipStories.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
                  No featured scholarship stories available.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {sortedScholarshipStories.map((story: Featured) => (
                    <div
                      key={story.featuredId}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigateToFeaturedDetail(story.featuredId)}
                    >
                      {/* Image */}
                      <div className="relative rounded-t-[10px] h-[230px]">
                        <Image
                          src={story.image || "/default-image.jpg"}
                          alt={story.title || "Scholarship story"}
                          fill
                          className="object-cover object-center rounded-t-[10px]"
                          priority
                        />
                      </div>
                      {/* Body */}
                      <div className="px-6 pt-3 pb-6">
                        {/* Title */}
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-xl font-semibold truncate">
                            {story.title}
                          </h2>
                        </div>
                        {/* Description */}
                        <div className="mb-5 text-sm h-20 overflow-hidden text-clip">
                          <p className="text-start whitespace-pre-wrap">
                            {story.text && story.text.length > 150
                              ? story.text.slice(0, 150) + "..."
                              : story.text}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 w-full items-center">
                          {/* Date */}
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <p className="text-sm text-gray-600">
                              {formatDate(story.datePosted)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === "myScholars" ? (
            <div className="bg-[#FFFF] py-[20px] px-[20px] rounded-[10px] mt-3 shadow-md border border-gray-200">
              <div className="overflow-x-auto">
                {filteredUserScholarshipStudent.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider"
                        >
                          Scholarship
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                        >
                          Student
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                        >
                          Agreement
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUserScholarshipStudent.map((scholarshipStudent) => (
                        <tr
                          key={scholarshipStudent.ScholarshipStudentId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-left whitespace-nowrap text-sm text-gray-700">
                            {
                              scholarshipMapping[
                                scholarshipStudent.scholarshipId
                              ]
                            }
                            {/* {'Loading campaign name...'} */}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-medium text-gray-900">
                            {studentMapping[scholarshipStudent.studentId]}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                            {/* Status column */}
                            <div className="flex justify-center items-center">
                              <button
                                className={`flex text-sm rounded-full px-3 py-1 shadow-lg transition-colors justify-center items-center gap-2
                                                                        ${(() => {
                                      const status =
                                        scholarshipStudent.status?.toLowerCase();

                                      switch (status) {
                                        case "approved":
                                          return "bg-green-500 text-white hover:bg-green-600";
                                        case "pending":
                                          return "bg-yellow-500 text-white hover:bg-yellow-600";
                                        case "rejected":
                                          return "bg-red-500 text-white hover:bg-red-600";
                                        default:
                                          return "bg-gray-400 text-white hover:bg-gray-500";
                                      }
                                    })()}`}
                              >
                                {(() => {
                                  const status =
                                    scholarshipStudent.status.toLowerCase();

                                  switch (status) {
                                    case "approved":
                                      return <CircleCheck className="size-4" />;
                                    case "pending":
                                      return <Clock className="size-4" />;
                                    case "rejected":
                                      return <CircleX className="size-4" />;
                                    default:
                                      return <HelpCircle className="size-4" />;
                                  }
                                })()}

                                <span className="whitespace-nowrap">
                                  {scholarshipStudent.status
                                    ? scholarshipStudent.status
                                        ?.charAt(0)
                                        .toUpperCase() +
                                      scholarshipStudent.status?.slice(1)
                                    : "None"}
                                </span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                if (scholarshipStudent.status === "approved") {
                                  setSelectedScholarshipStudentId(
                                    scholarshipStudent.ScholarshipStudentId
                                  );
                                  setSelectedFile(scholarshipStudent.pdf);
                                }
                              }}
                              disabled={
                                scholarshipStudent.status !== "approved"
                              }
                              className={`text-sm ${
                                scholarshipStudent.status === "approved"
                                  ? "text-blue-500 hover:underline cursor-pointer"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              View PDF
                            </button>
                            {selectedScholarshipStudentId ===
                              scholarshipStudent.ScholarshipStudentId &&
                              selectedFile && (
                                <PdfPreviewDialog
                                  selectedFile={selectedFile}
                                  setSelectedFile={setSelectedFile}
                                />
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
                    <h3 className="text-xl font-medium text-gray-600">
                      No Sponsorship have been made yet.{" "}
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Waiting for your first Sponsor!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Regular scholarships list display for other tabs
            <>
              {sortedScholarships.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
                  {activeTab === "saved"
                    ? `No ${
                        statusFilter !== "all" ? statusFilter : ""
                      } saved scholarships`
                    : activeTab === "myScholars"
                    ? `No ${
                        statusFilter !== "all" ? statusFilter : ""
                      } scholarships available.`
                    : `No ${
                        statusFilter !== "all" ? statusFilter : ""
                      } scholarships available.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {sortedScholarships.map((scholarship: Scholarship) => {
                    const status = getScholarshipStatus(scholarship);
                    return (
                      <div
                        key={scholarship.scholarshipId}
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() =>
                          navigateToDetail(scholarship.scholarshipId)
                        }
                      >
                        {/* Image */}
                        <div className="relative rounded-t-[10px] h-[230px]">
                          <Image
                            src={scholarship.image || "/default-image.jpg"}
                            alt={scholarship.title || "Scholarship"}
                            fill
                            className="object-cover object-center rounded-t-[10px]"
                            priority
                          />
                                                    <span className="absolute bottom-2 right-2 px-2 py-1 text-lg rounded-full font-bold ">
                                                            <StatusBadge status={status} />
                                                    </span>
                        </div>
                        {/* Body */}
                        <div className="px-6 pt-3 pb-6">
                          {/* Name */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex flex-col gap-1">
                              <h2 className="text-xl font-semibold truncate">
                                {scholarship.title}
                              </h2>
                            </div>
                            <div
                              onClick={(e) =>
                                handleToggleBookmark(
                                  e,
                                  scholarship.scholarshipId
                                )
                              }
                            >
                              <BookmarkButton
                                entryId={scholarship.scholarshipId}
                                type="scholarship"
                                size="lg"
                              />
                            </div>
                          </div>
                          {/* Description */}
                          <div className="mb-5 text-sm h-20 overflow-hidden text-clip">
                            <p className="text-start whitespace-pre-wrap">
                              {scholarship.description.length > 150
                                ? scholarship.description.slice(0, 150) + "..."
                                : scholarship.description}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 w-full items-center">
                            {/* Date */}
                            <div className="flex items-center">
                              <p className="text-sm text-gray-600">
                                Posted on{" "}
                                {scholarship.datePosted.toLocaleDateString()}
                              </p>
                            </div>
                            {/* Sponsors */}
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">Sponsors:</span>
                              <span className="font-medium">
                                {scholarship.alumList.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipPage;