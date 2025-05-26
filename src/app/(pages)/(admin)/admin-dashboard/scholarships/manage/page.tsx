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
import Breadcrumb from "@/components/breadcrumb";

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
      //console.error("No scholarship ID provided.");
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
      //console.error("No scholarship ID provided.");
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

  const breadcrumbItems = [
    { label: "Home", href: "/admin-dashboard" },
    { label: "Manage Scholarships", href: "#", active: true },
  ];

  return (
    <div className="flex flex-col gap-5">
      <title>Manage Scholarships | ICS-ARMS</title>
      <Breadcrumb items={breadcrumbItems} />
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Manage Scholarships</div>
          <button
            onClick={create}
            className="bg-[var(--primary-blue)] text-[14px] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
          >
            + Create Scholarship Drive
          </button>
        </div>
      </div>
      {/* Filter tabs */}
      <div className="bg-white rounded-xl flex gap-3 p-2 pl-4 items-center">
        <div className="text-sm font-medium text-[var(--primary-blue)]">
          Filter by:
        </div>
        <div className=" pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300">
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
            className="flex items-center text-sm text-[var(--primary-blue)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full"
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
      {/* Table Container with Fixed Height for Scrolling */}
      {/* Table Container with Fixed Height for Scrolling */}
      <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
        <div
          className="rounded-xl overflow-hidden border border-gray-300 relative"
          ref={tableRef}
        >
          <table className="w-full border-collapse">
            <thead
              className={`sticky top-0 z-50 bg-blue-100 shadow-sm text-sm text-gray-600 ${
                isSticky ? "fixed top-0" : ""
              }`}
              style={{ width: isSticky ? headerWidth : "100%" }}
            >
              <tr>
                <th className="w-1/2 p-4 text-left font-semibold">
                  Scholarship Info
                </th>
                <th className="w-1/6 p-4 text-center font-semibold">Active</th>
                <th className="w-1/6 p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            {/* Spacer row to prevent content jump when header becomes fixed */}
            {isSticky && (
              <tbody>
                <tr style={{ height: "56px" }}>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            )}

            <tbody>
              {sortedScholarships.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-10 text-gray-500">
                    No scholarships available.
                  </td>
                </tr>
              ) : (
                sortedScholarships.map((scholarship, index) => (
                  <tr
                    key={scholarship.scholarshipId}
                    className={`border-t border-gray-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="text-base font-bold">
                          {scholarship.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          Date Posted:{" "}
                          {scholarship.datePosted.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Sponsors: {scholarship.alumList.length}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
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
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-10">
                        <button
                          className="text-[var(--primary-blue)] hover:underline cursor-pointer text-sm"
                          onClick={() =>
                            navigateToDetail(scholarship.scholarshipId)
                          }
                        >
                          View Details
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-400 cursor-pointer"
                          onClick={() => {
                            setSelectedScholarship(scholarship);
                            setIsConfirmationOpen(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
