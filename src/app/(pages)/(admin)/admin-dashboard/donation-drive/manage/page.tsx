"use client";

import { useEffect, useRef, useState } from "react";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { DonationDrive } from "@/models/models";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
// import { useAuth } from "@/context/AuthContext";
import { ChevronRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toastError, toastSuccess } from "@/components/ui/sonner";
// import { Dialog, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
// import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
// import { formatDistance } from "date-fns";

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
  const [creatorNames, setCreatorNames] = useState<{ [key: string]: string }>(
    {}
  );

  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");

  const tableRef = useRef(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});

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
        const aName =
          a.isEvent && events[a.eventId]
            ? events[a.eventId]!.title
            : a.campaignName;
        const bName =
          b.isEvent && events[b.eventId]
            ? events[b.eventId]!.title
            : b.campaignName;

        return aName.toLowerCase().localeCompare(bName.toLowerCase());
      }
      default:
        return 0;
    }
  });

  const filteredDrives =
    statusFilter === "all"
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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const navigateToDetails = (id: string) => {
    router.push(`manage/details?id=${id}`);
  };

  // Fixed useEffect to prevent hanging when changing filters
  useEffect(() => {
    // Keep track of mounted state to prevent state updates after unmount
    let isMounted = true;

    const fetchCreators = async () => {
      // Only fetch creators that haven't been fetched already
      const drivesToFetch = filteredDrives.filter(
        (drive) =>
          drive.creatorType === "alumni" && !creatorNames[drive.donationDriveId]
      );

      if (drivesToFetch.length === 0) return;

      const names = { ...creatorNames };

      await Promise.all(
        drivesToFetch.map(async (drive) => {
          try {
            const creator = await fetchAlumnusById(drive.creatorId);
            if (creator && isMounted) {
              names[
                drive.donationDriveId
              ] = `${creator.firstName} ${creator.lastName}`;
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
      // Determine the new status
      const newStatus = currentStatus === "active" ? "completed" : "active";

      // Update in Firestore
      const donationRef = doc(db, "donation_drive", driveId);
      await updateDoc(donationRef, { status: newStatus });

      // Update local state
      if (localDrives) {
        const updatedDrives = localDrives.map((drive: DonationDrive) =>
          drive.donationDriveId === driveId
            ? { ...drive, status: newStatus }
            : drive
        );
        setLocalDrives(updatedDrives);
        toastSuccess(`Donation Drive status updated successfully.`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toastError("Failed to update Donation Drive status.");

      // Revert the toggle in case of error
      setToggles((prev) => ({ ...prev, [driveId]: !prev[driveId] }));
    }
  }

  const handleToggleClick = (drive: DonationDrive) => {
    // First update the toggle state for immediate UI feedback
    setToggles((prev) => ({
      ...prev,
      [drive.donationDriveId]: !prev[drive.donationDriveId],
    }));

    // Then update the status in the database
    toggleStatus(drive.donationDriveId, drive.status);
  };
  //  Scholarship Deletion
  // const handleDeleteClick = (donationDrive : DonationDrive) => {
  // 	if (!donationDrive.donationDriveId) {
  // 		console.error("No scholarship ID provided.");
  // 		return;
  // 	}
  // 	handleDelete(donationDrive);
  // 	toastSuccess(`${donationDrive.campaignName} has been deleted successfully.`)
  // }
  // const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedDonationDrive, setSelectedDonationDrive] =
    useState<DonationDrive>();

  const create = () => {
    router.push("/admin-dashboard/donation-drive/add");
  };

  const home = () => {
    router.push("/admin-dashboard");
  };

  return (
    <div className="flex flex-col gap-5">
      <title>Manage Donation Drives | ICS-ARMS</title>
      {/* Path */}
      <div className="flex items-center gap-2">
        <div className="hover:text-blue-600 cursor-pointer" onClick={home}>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>Manage Donation Drives</div>
      </div>
      {/* Header */}
      <div className="w-full">
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="font-bold text-3xl">Manage Donation Drive</div>
          <div
            className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600"
            onClick={create}
          >
            + Create Donation Drive
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-col gap-3">
        <div className="w-full flex gap-2">
          <div
            onClick={() => setStatusFilter("all")}
            className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
              statusFilter === "all" ? "bg-[var(--primary-blue)]" : "bg-white"
            }`}
          >
            <div
              className={`w-full h-1 transition-colors ${
                statusFilter === "all"
                  ? "bg-[var(--primary-blue)]"
                  : "bg-transparent"
              }`}
            >
              {" "}
            </div>
            <div
              className={`w-full py-3 flex gap-1 items-center justify-center rounded-t-2xl font-semibold text-base ${
                statusFilter === "all"
                  ? "text-[var(--primary-blue)] bg-white"
                  : "text-blue-200 bg-white"
              }`}
            >
              All Drives
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                  statusFilter === "all" ? "bg-amber-400" : "bg-blue-200"
                }`}
              >
                {donationDrives.length}
              </div>
            </div>
          </div>
          <div
            onClick={() => setStatusFilter("active")}
            className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
              statusFilter === "active"
                ? "bg-[var(--primary-blue)]"
                : "bg-white"
            }`}
          >
            <div
              className={`w-full h-1 transition-colors ${
                statusFilter === "active"
                  ? "bg-[var(--primary-blue)]"
                  : "bg-transparent"
              }`}
            >
              {" "}
            </div>
            <div
              className={`w-full py-3 flex items-center gap-1 justify-center rounded-t-2xl font-semibold text-base ${
                statusFilter === "active"
                  ? "text-[var(--primary-blue)] bg-white"
                  : "text-blue-200 bg-white"
              }`}
            >
              Active
              <div
                className={`h-6 w-6 rounded-full flex  items-center justify-center text-[13px] text-white ${
                  statusFilter === "active" ? "bg-amber-400" : "bg-blue-200"
                }`}
              >
                {
                  donationDrives.filter(
                    (drive: DonationDrive) => drive.status === "active"
                  ).length
                }
              </div>
            </div>
          </div>
          <div
            onClick={() => setStatusFilter("completed")}
            className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
              statusFilter === "completed"
                ? "bg-[var(--primary-blue)]"
                : "bg-white"
            }`}
          >
            <div
              className={`w-full h-1 transition-colors ${
                statusFilter === "completed"
                  ? "bg-[var(--primary-blue)]"
                  : "bg-transparent"
              }`}
            >
              {" "}
            </div>
            <div
              className={`w-full py-3 flex gap-1 items-center justify-center rounded-t-2xl font-semibold text-base ${
                statusFilter === "completed"
                  ? "text-[var(--primary-blue)] bg-white"
                  : "text-blue-200 bg-white"
              }`}
            >
              Closed
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                  statusFilter === "completed" ? "bg-amber-400" : "bg-blue-200"
                }`}
              >
                {
                  donationDrives.filter(
                    (drive: DonationDrive) => drive.status === "completed"
                  ).length
                }
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
          <div className="bg-gray-200 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs"
            >
              <option value="latest" className="text-xs">
                Latest
              </option>
              <option value="oldest" className="text-xs">
                Oldest
              </option>
              <option value="alphabetical" className="text-xs">
                Alphabetical
              </option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && <div className="text-center text-lg">Loading...</div>}

      {/* Donation Drive List */}
      <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
        <div
          className="rounded-xl overflow-hidden border border-gray-300 relative"
          ref={tableRef}
        >
          {/* Blue Header */}
          <div
            className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
              isSticky ? "fixed top-0" : ""
            }`}
            style={{ width: isSticky ? headerWidth : "100%" }}
          >
            <div className="w-1/2 flex items-center justify-baseline font-semibold">
              Donation Drive Info
            </div>
            <div className="w-1/2 flex justify-end items-center">
              <div className="w-1/3 md:w-1/6 flex items-center justify-center font-semibold">
                Active
              </div>
              <div className="w-1/3 md:w-1/6 flex items-center justify-center font-semibold">
                Actions
              </div>
              <div className="w-1/3 md:w-1/6 flex items-center justify-center"></div>
            </div>
          </div>
          {isSticky && <div style={{ height: "56px" }}></div>}
        </div>

        {filteredDrives.length === 0 ? (
          <p className="text-gray-500 mt-4 text-center">
            No donation drives found.
          </p>
        ) : (
          <>
            {filteredDrives.map((drive: DonationDrive, index) => {
              const ev = events[drive.eventId];
              return (
                <div
                  key={drive.donationDriveId}
                  className={`w-full flex gap-4 border-t border-gray-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  <div className="w-1/2 flex flex-col p-4 gap-1">
                    <div className="text-base font-bold">
                      {drive.isEvent && ev ? ev.title : drive.campaignName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {/* Donation Type */}
                      {drive.isEvent && ev ? (
                        <div>
                          <p>Donation Type: Event-related Campaign</p>
                        </div>
                      ) : (
                        <div>
                          <p>Donation Type: General Campaign</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-1/2 flex items-center justify-end p-5 gap-2">
                    <div className="w-1/3 md:w-1/6 flex items-center justify-center">
                      {/* <div className="w-1/6 flex items-center justify-center"> */}
                      {/* Toggle for status */}
                      <div
                        onClick={() => handleToggleClick(drive)}
                        className={`w-10 md:w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          toggles[drive.donationDriveId]
                            ? "bg-[var(--primary-blue)]"
                            : "bg-gray-300"
                        }`}
                      >
                        {/* Toggle switch inner button */}
                        <div
                          className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform ${
                            toggles[drive.donationDriveId]
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="w-1/3 md:w-1/6 flex text-center items-center justify-center text-xs">
                      <div
                        className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                        onClick={() => navigateToDetails(drive.donationDriveId)}
                      >
                        View Details
                      </div>
                    </div>
                    <div className="w-1/3 md:w-1/6 flex items-center justify-center">
                      {/* <Trash2 size={20} className="text-gray-500 hover:text-red-500 cursor-pointer" onClick={() =>{
										setSelectedDonationDrive(drive);
										setIsConfirmationOpen(true);
									}} /> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      {/* Confirmation Dialog */}
      {/* {isConfirmationOpen && (
			<Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
				<DialogContent className='w-96'>
					<DialogHeader className='text-red-500 flex items-center gap-5'>
						<CircleX className='size-15'/>
						<DialogTitle className="text-md text-center">
							Are you sure you want to delete <br /> <strong>{selectedDonationDrive?.campaignName}</strong>?
						</DialogTitle>
					</DialogHeader>
					<DialogFooter className='mt-5'>
						<button className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-red-700 bg-red-700  hover:bg-red-500 hover:cursor-pointer" 
							onClick={() => {
								if(selectedDonationDrive){
									handleDeleteClick(selectedDonationDrive);
									setIsConfirmationOpen(false);
								}
							}} >Delete</button>
						<button className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100" onClick={() => setIsConfirmationOpen(false)}>Cancel</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		  )} */}
    </div>
  );
}
