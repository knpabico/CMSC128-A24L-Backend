"use client";
import { useFeatured } from "@/context/FeaturedStoryContext";
import { uploadImage } from "@/lib/upload";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  CirclePlus,
  Plus,
  Asterisk,
  Upload,
  ArrowUpDown,
  CircleX,
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Breadcrumb from "@/components/breadcrumb";

export default function FeaturedStoriesPage() {
  const { featuredItems, isLoading, handleDelete } = useFeatured();

  const [activeTab, setActiveTab] = useState<
    "All Stories" | "Events" | "Donations" | "Scholarships"
  >("All Stories");
  const [sortOption, setSortOption] = useState("newest");
  const tableRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<{
    featuredId: string;
    title: string;
  } | null>(null);

  const tabs: Array<"All Stories" | "Events" | "Donations" | "Scholarships"> = [
    "All Stories",
    "Events",
    "Donations",
    "Scholarships",
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();

      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(tableRect.width.toString());
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth.toString());
    }

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky]);

  // Filter items based on active tab
  const filteredItems =
    activeTab === "All Stories"
      ? featuredItems
      : featuredItems.filter((item: { type: string }) => {
          const tabTypeMap = {
            Events: "event",
            Donations: "donation",
            Scholarships: "scholarship",
          };
          return item.type === tabTypeMap[activeTab as keyof typeof tabTypeMap];
        });

  // Sort filtered items based on date
  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = a.datePosted?.toDate?.() || new Date(a.datePosted);
    const dateB = b.datePosted?.toDate?.() || new Date(b.datePosted);

    if (sortOption === "newest") {
      return dateB.getTime() - dateA.getTime();
    } else {
      return dateA.getTime() - dateB.getTime();
    }
  });

  // Count items for each category
  const getCategoryCount = (category: string) => {
    if (category === "All Stories") return featuredItems.length;

    const categoryTypeMap = {
      Events: "event",
      Donations: "donation",
      Scholarships: "scholarship",
    };

    return featuredItems.filter(
      (item: { type: any }) =>
        item.type === categoryTypeMap[category as keyof typeof categoryTypeMap]
    ).length;
  };

  const router = useRouter(); // Initialize the router

  const navigateToDetail = (featuredId: any) => {
    router.push(`/admin-dashboard/create-story/${featuredId}`); // Navigate to the detail page
  };

  const navigateToCreate = () => {
    router.push(`/admin-dashboard/create-story/add`); // Navigate to create page
  };

  const toggleSortOption = () => {
    setSortOption((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  const breadcrumbItems = [
    { label: "Home", href: "/admin-dashboard" },
    { label: "Manage Featured Stories", href: "#", active: true },
  ];

  return (
    <div className="flex flex-col gap-5">
      <title>Manage Featured Stories | ICS-ARMS</title>
      <Breadcrumb items={breadcrumbItems} />

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Manage Featured Stories</div>
          <button
            onClick={navigateToCreate}
            className="bg-[var(--primary-blue)] text-[14px] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
          >
            + Write featured story
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full flex gap-2">
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
              activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-white"
            }`}
          >
            {/* Blue bar above active tab */}
            <div
              className={`w-full h-1 transition-colors ${
                activeTab === tab
                  ? "bg-[var(--primary-blue)]"
                  : "bg-transparent"
              }`}
            ></div>
            <div
              className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                activeTab === tab
                  ? "text-[var(--primary-blue)] bg-white"
                  : "text-blue-200 bg-white"
              }`}
            >
              {tab}
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                  activeTab === tab ? "bg-amber-400" : "bg-blue-200"
                }`}
              >
                {getCategoryCount(tab)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {/* Sorting Filter */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm text-[var(--primary-blue)]">Sort by:</div>
          <div
            className="pl-4 pr-4 py-2 rounded-full flex gap-2 items-center justify-between text-sm font-medium cursor-pointer border-2 border-[var(--primary-blue)] text-[var(--primary-blue)]"
            onClick={toggleSortOption}
          >
            <div>{sortOption === "newest" ? "Newest" : "Oldest"}</div>
            <ArrowUpDown size={14} />
          </div>
        </div>

        {/* Table Container with Fixed Height for Scrolling */}
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-xl">Loading...</div>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden border border-gray-300 relative"
              ref={tableRef}
            >
              {/* Sticky header */}
              <div
                className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
                  isSticky ? "fixed top-0 left-0" : ""
                }`}
                style={{
                  width: isSticky ? `${headerWidth}px` : "100%",
                  position: isSticky ? "fixed" : "relative",
                }}
              >
                <div className="flex-grow flex items-center font-semibold">
                  Featured Story Info
                </div>
                <div className="w-[270px] flex items-center justify-center font-semibold mr-7">
                  Public
                </div>
                <div className="w-[80px] flex items-center justify-center font-semibold">
                  Type
                </div>
                <div className="w-[120px] flex items-center justify-center font-semibold">
                  Actions
                </div>
              </div>

              {/* Spacer div to prevent content jump when header becomes fixed */}
              {isSticky && <div style={{ height: "56px" }}></div>}

              {/* Featured Stories Rows */}
              {sortedItems.length > 0 ? (
                sortedItems.map((item, index) => (
                  <div
                    key={index}
                    className={`w-full flex gap-4 border-t border-gray-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 cursor-pointer`}
                    onClick={() => navigateToDetail(item.featuredId)}
                  >
                    <div className="w-2/3 flex p-4 gap-4">
                      {item.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt="Featured"
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="text-base font-bold">{item.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {item.text}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.datePosted?.toDate?.().toLocaleString?.() ||
                            new Date(item.datePosted).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.isPublic}
                          onChange={async (e) => {
                            try {
                              await updateDoc(
                                doc(db, "featured", item.featuredId),
                                {
                                  isPublic: !item.isPublic,
                                }
                              );
                              console.log(
                                `isPublic set to ${!item.isPublic} for ${
                                  item.featuredId
                                }`
                              );
                            } catch (error) {
                              console.error("Error updating isPublic:", error);
                            }
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    {/* Tags and Action Icons */}
                    <div className="w-1/3 flex items-center justify-end p-5">
                      <div className="w-1/3 flex items-center justify-center">
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {item.type}
                        </div>
                      </div>

                      <div
                        className="w-1/3 flex items-center justify-center gap-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStoryToDelete(item);
                          setIsConfirmationOpen(true);
                        }}
                      >
                        <Trash2
                          size={18}
                          className="text-gray-500 hover:text-red-500 cursor-pointer"
                          //onClick={() => handleDelete(item.featuredId)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No featured stories found in this category.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirmationOpen && (
        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <DialogContent className="w-96">
            <DialogHeader className="text-red-500 flex items-center gap-5">
              <CircleX className="size-15" />
              <DialogTitle className="text-md text-center">
                Are you sure you want to delete <br />{" "}
                <strong>{storyToDelete?.title}</strong>?
              </DialogTitle>
            </DialogHeader>
            <DialogFooter className="mt-5">
              <button
                className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-red-700 bg-red-700  hover:bg-red-500 hover:cursor-pointer"
                onClick={() => {
                  if (storyToDelete) {
                    handleDelete(storyToDelete?.featuredId);
                    setIsConfirmationOpen(false);
                  }
                }}
              >
                Delete
              </button>
              <button
                className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100"
                onClick={() => setIsConfirmationOpen(false)}
              >
                Cancel
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
