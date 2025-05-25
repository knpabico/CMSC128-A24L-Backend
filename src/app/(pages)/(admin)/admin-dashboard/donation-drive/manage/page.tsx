"use client";

import { useEffect, useRef, useState } from "react";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { DonationDrive } from "@/models/models";
import { useRouter } from "next/navigation";
import React from "react";
import { ChevronRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toastError, toastSuccess } from "@/components/ui/sonner";

export default function ManageDonationDrive() {
  const router = useRouter();
  const {
    donationDrives,
    events,
    isLoading,
    setCampaignName,
    setDescription,
    setIsEvent,
    setQrGcash,
    setFileGcashName,
    setPreviewGcash,
    setQrPaymaya,
    setFilePaymayaName,
    setPreviewPaymaya,
    setImage,
    setFileName,
    setPreview,
    setTargetAmount,
    setStatus,
    setBeneficiary,
    fetchAlumnusById,
    setImageChange,
    setPaymayaChange,
    setGcashChange,
  } = useDonationDrives();

  const [localDrives, setLocalDrives] = useState<DonationDrive[]>([]);
  const [creatorNames, setCreatorNames] = useState<{ [key: string]: string }>({});
  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});
  const [selectedDonationDrive, setSelectedDonationDrive] = useState<DonationDrive>();

  if (!donationDrives) return <div>Loading donation drives...</div>;

  // Sort donation drives based on selected option
  const sortedDrives = [...donationDrives].sort((a, b) => {
    switch (sortBy) {
      case "ascending":
        return a.targetAmount - b.targetAmount;
      case "descending":
        return b.targetAmount - a.targetAmount;
      case "oldest":
        const dateA2 = a.datePosted?.toDate?.() || new Date(0);
        const dateB2 = b.datePosted?.toDate?.() || new Date(0);
        return dateA2.getTime() - dateB2.getTime();
      case "latest":
        const dateA = a.datePosted?.toDate?.() || new Date(0);
        const dateB = b.datePosted?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      case "alphabetical": {
        const aName = a.isEvent && events[a.eventId] ? events[a.eventId]!.title : a.campaignName;
        const bName = b.isEvent && events[b.eventId] ? events[b.eventId]!.title : b.campaignName;
        return aName.toLowerCase().localeCompare(bName.toLowerCase());
      }
      default:
        return 0;
    }
  });

  const filteredDrives = statusFilter === "all" 
    ? sortedDrives 
    : sortedDrives.filter((drive) => drive.status === statusFilter);

  useEffect(() => {
    if (donationDrives) {
      const toggleStates: { [key: string]: boolean } = {};
      donationDrives.forEach((drive: DonationDrive) => {
        toggleStates[drive.donationDriveId] = drive.status === "active";
      });
      setToggles(toggleStates);
    }
    setLocalDrives(donationDrives);
  }, [donationDrives]);

  const navigateToDetails = (id: string) => {
    router.push(`manage/details?id=${id}`);
  };

  // Fixed useEffect to prevent hanging when changing filters
  useEffect(() => {
    let isMounted = true;

    const fetchCreators = async () => {
      const drivesToFetch = filteredDrives.filter(
        (drive) => drive.creatorType === "alumni" && !creatorNames[drive.donationDriveId]
      );

      if (drivesToFetch.length === 0) return;

      const names = { ...creatorNames };

      await Promise.all(
        drivesToFetch.map(async (drive) => {
          try {
            const creator = await fetchAlumnusById(drive.creatorId);
            if (creator && isMounted) {
              names[drive.donationDriveId] = `${creator.firstName} ${creator.lastName}`;
            } else if (isMounted) {
              names[drive.donationDriveId] = "Unknown";
            }
          } catch (error) {
            console.error("Error fetching creator:", error);
            if (isMounted) {
              names[drive.donationDriveId] = "Unknown";
            }
          }
        })
      );

      if (isMounted) {
        setCreatorNames(names);
      }
    };

    fetchCreators();

    return () => {
      isMounted = false;
    };
  }, [filteredDrives, creatorNames]);

  useEffect(() => {
    const setReset = () => {
      setCampaignName("");
      setDescription("");
      setBeneficiary([]);
      setTargetAmount(0);
      setIsEvent(false);
      setStatus("active");
      setQrGcash(null);
      setFileGcashName("");
      setPreviewGcash(null);
      setQrPaymaya(null);
      setFilePaymayaName("");
      setPreviewPaymaya(null);
      setImage(null);
      setFileName("");
      setPreview(null);
      setImageChange(false);
      setPaymayaChange(false);
      setGcashChange(false);
    };

    setReset();
  }, []);

  async function toggleStatus(driveId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === "active" ? "completed" : "active";
      const donationRef = doc(db, "donation_drive", driveId);
      await updateDoc(donationRef, { status: newStatus });

      if (localDrives) {
        const updatedDrives = localDrives.map((drive: DonationDrive) =>
          drive.donationDriveId === driveId ? { ...drive, status: newStatus } : drive
        );
        setLocalDrives(updatedDrives);
        toastSuccess(`Donation Drive status updated successfully.`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toastError("Failed to update Donation Drive status.");
      setToggles((prev) => ({ ...prev, [driveId]: !prev[driveId] }));
    }
  }

  const handleToggleClick = (drive: DonationDrive) => {
    setToggles((prev) => ({
      ...prev,
      [drive.donationDriveId]: !prev[drive.donationDriveId],
    }));
    toggleStatus(drive.donationDriveId, drive.status);
  };

  const create = () => {
    router.push("/admin-dashboard/donation-drive/add");
  };

  const home = () => {
    router.push("/admin-dashboard");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="hover:text-blue-600 cursor-pointer hover:underline" onClick={home}>
          Home
        </div>
        <ChevronRight size={15} />
        <span className="text-[var(--primary-blue)] font-semibold">Manage Donation Drives</span>
      </div>

      {/* Header */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Manage Donation Drive</div>
          <button
            className="bg-[var(--primary-blue)] text-[14px] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
            onClick={create}
          >
            + Create Donation Drive
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col gap-3">
        <div className="w-full flex gap-2">
          {[
            { key: "all", label: "All Drives", count: donationDrives.length },
            { 
              key: "active", 
              label: "Active", 
              count: donationDrives.filter((drive: DonationDrive) => drive.status === "active").length 
            },
            { 
              key: "completed", 
              label: "Closed", 
              count: donationDrives.filter((drive: DonationDrive) => drive.status === "completed").length 
            }
          ].map((tab) => (
            <div
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                statusFilter === tab.key ? "bg-[var(--primary-blue)]" : "bg-white"
              }`}
            >
              <div
                className={`w-full h-1 transition-colors ${
                  statusFilter === tab.key ? "bg-[var(--primary-blue)]" : "bg-transparent"
                }`}
              />
              <div
                className={`w-full py-3 flex gap-1 items-center justify-center rounded-t-2xl font-semibold text-base ${
                  statusFilter === tab.key
                    ? "text-[var(--primary-blue)] bg-white"
                    : "text-blue-200 bg-white"
                }`}
              >
                {tab.label}
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                    statusFilter === tab.key ? "bg-amber-400" : "bg-blue-200"
                  }`}
                >
                  {tab.count}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium text-[var(--primary-blue)]">Filter by:</div>
          <div className="relative">
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] rounded-full px-4 py-2 text-sm font-medium cursor-pointer appearance-none pr-8"
            >
              <option value="latest">Latest </option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="ascending">Target Amount (Low to High)</option>
              <option value="descending">Target Amount (High to Low)</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <div className="text-center text-lg">Loading...</div>}

      {/* Table Container */}
      <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
        <div className="rounded-xl overflow-hidden border border-gray-300 relative">
          {/* Table with proper HTML table elements */}
          <table className="w-full border-collapse">
            {/* Table Header - Using position: sticky */}
            <thead className="sticky top-0 z-50 bg-blue-100 shadow-sm text-sm text-gray-600">
              <tr>
                <th className="text-left p-4 font-semibold w-2/4">Donation Drive Info</th>
                <th className="text-center p-4 font-semibold w-1/6">Status</th>
                <th className="text-center p-4 font-semibold w-1/6">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredDrives.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-10 text-gray-500">
                    No donation drives found.
                  </td>
                </tr>
              ) : (
                filteredDrives.map((drive: DonationDrive, index: number) => {
                  const ev = events[drive.eventId];
                  return (
                    <tr
                      key={drive.donationDriveId}
                      className={`border-t border-gray-300 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                    >
                      {/* Donation Drive Info */}
                      <td className="p-4 w-2/4">
                        <div className="flex flex-col gap-1">
                          <div className="text-base font-bold">
                            {drive.isEvent && ev ? ev.title : drive.campaignName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {drive.isEvent && ev ? (
                              <p className="text-xs font-light">
                                Donation Type: Event-related Campaign
                              </p>
                            ) : (
                              <p className="text-xs font-light">
                                Donation Type: General Campaign
                              </p>
                            )}
                            {drive.creatorType === "alumni" && (
                              <p className="text-xs font-light">
                                Created by: {creatorNames[drive.donationDriveId] || "Loading..."}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 w-1/6">
                        <div className="flex items-center justify-center">
                          <div
                            onClick={() => handleToggleClick(drive)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                              toggles[drive.donationDriveId]
                                ? "bg-[var(--primary-blue)]"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform ${
                                toggles[drive.donationDriveId]
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 w-1/6">
                        <div className="flex items-center justify-center">
                          <button
                            className="text-[var(--primary-blue)] hover:underline cursor-pointer text-sm"
                            onClick={() => navigateToDetails(drive.donationDriveId)}
                          >
                            View Details
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}