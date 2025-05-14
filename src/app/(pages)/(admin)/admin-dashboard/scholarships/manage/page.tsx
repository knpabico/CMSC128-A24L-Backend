"use client";

import { Scholarship } from "@/models/models";
import { useScholarship } from "@/context/ScholarshipContext";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toastSuccess } from "@/components/ui/sonner";
import { ChevronRight, CircleX, Trash2 } from "lucide-react";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";

export default function ManageScholarship() {
  const { scholarships, updateScholarship, deleteScholarship } =
    useScholarship();
  const tableRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();
  const navigateToDetail = (scholarshipId: string) => {
    router.push(`/admin-dashboard/scholarships/manage/${scholarshipId}`);
  };

  const [sortOption, setSortOption] = useState<
    | "newest"
    | "oldest"
    | "number of sponsors (asc)"
    | "number of sponsors (dsc)"
  >("newest");
  const sortScholarships = (scholarships: Scholarship[]) =>
    [...scholarships].sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return (
            new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime()
          );
        case "newest":
          return (
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
          );
        case "number of sponsors (asc)":
          return a.alumList.length - b.alumList.length; // ascending = small to big
        case "number of sponsors (dsc)":
          return b.alumList.length - a.alumList.length; // descending = big to small
        default:
          return 0;
      }
    });
  const sortedScholarships = sortScholarships(scholarships);

  //  Scholarship Deletion
  const handleDelete = (scholarship: Scholarship) => {
    if (!scholarship.scholarshipId) {
      console.error("No scholarship ID provided.");
      return;
    }
    deleteScholarship(scholarship.scholarshipId);
    toastSuccess(`${scholarship.title} has been deleted successfully.`);
  };

  // Toggle scholarship status (active/closed)
  const handleStatusToggle = async (
    scholarship: Scholarship,
    isActive: boolean
  ) => {
    if (!scholarship.scholarshipId) {
      console.error("No scholarship ID provided.");
      return;
    }
    const newStatus = isActive ? "active" : "closed";
    await updateScholarship(scholarship.scholarshipId, { status: newStatus });
    toastSuccess(`${scholarship.title} status has been set to ${newStatus}.`);
  };

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship>();

  // Track scroll position and update header state
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

  const create = () => {
    router.push("/admin-dashboard/scholarships/add");
  };

  const home = () => {
    router.push("/admin-dashboard");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="hover:text-blue-600 cursor-pointer" onClick={home}>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          {" "}
          Manage Scholarships{" "}
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Manage Scholarships</div>
          <div
            className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600"
            onClick={create}
          >
            + Create Scholarship
          </div>
        </div>
      </div>
      {/* Filter tabs */}
      <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
        <div className="text-sm font-medium">Filter by:</div>
        <div className=" pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300">
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
            className="flex items-center text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="number of sponsors (asc)">
              Number of Sponsors (ASC)
            </option>
            <option value="number of sponsors (dsc)">
              Number of Sponsors (DSC)
            </option>
          </select>
        </div>
      </div>
      {/* Table Container with Fixed Height for Scrolling */}
      <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
        <div
          className="rounded-xl overflow-hidden border border-gray-300 relative"
          ref={tableRef}
        >
          <div
            className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
              isSticky ? "fixed top-0" : ""
            }`}
            style={{ width: isSticky ? headerWidth : "100%" }}
          >
            <div className="w-1/2 flex items-center justify-baseline font-semibold">
              Scholarship Info
            </div>
            <div className="w-1/2 flex justify-end items-center">
              <div className="w-1/6 flex items-center justify-center font-semibold">
                Active
              </div>
              <div className="w-1/6 flex items-center justify-center font-semibold">
                Actions
              </div>
              <div className="w-1/6 flex items-center justify-center"></div>
            </div>
          </div>

          {/* Spacer div to prevent content jump when header becomes fixed */}
          {isSticky && <div style={{ height: "56px" }}></div>}

          {/* Dynamic rows */}
          {sortedScholarships.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
              'No scholarships available.'
            </div>
          ) : (
            <div className="">
              {sortedScholarships.map((scholarship: Scholarship, index) => (
                <div
                  key={scholarship.scholarshipId}
                  className={`w-full flex gap-4 border-t border-gray-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  <div className="w-1/2 flex flex-col p-4 gap-1">
                    <div className="text-base font-bold">
                      {scholarship.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      Date Posted: {scholarship.datePosted.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Sponsors: {scholarship.alumList.length}
                    </div>
                  </div>
                  <div className="w-1/2 flex items-center justify-end p-5">
                    <div className="w-1/6 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() =>
                            handleStatusToggle(
                              scholarship,
                              scholarship.status === "closed"
                            )
                          }
                          className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${
                            scholarship.status !== "closed"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span className="sr-only">Toggle status</span>
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              scholarship.status !== "closed"
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="w-1/6 flex items-center justify-center">
                      <button
                        className="text-[var(--primary-blue)] hover:underline cursor-pointer text-sm"
                        onClick={() =>
                          navigateToDetail(scholarship.scholarshipId)
                        }
                      >
                        View Details
                      </button>
                    </div>
                    <div className="w-1/6 flex items-center justify-center">
                      <button
                        className="text-red-700 hover:cursor-pointer"
                        onClick={() => {
                          setSelectedScholarship(scholarship);
                          setIsConfirmationOpen(true);
                        }}
                      >
                        <Trash2 className="size-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                <strong>{selectedScholarship?.title}</strong>?
              </DialogTitle>
            </DialogHeader>
            <DialogFooter className="mt-5">
              <button
                className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-red-700 bg-red-700  hover:bg-red-500 hover:cursor-pointer"
                onClick={() => {
                  if (selectedScholarship) {
                    handleDelete(selectedScholarship);
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
