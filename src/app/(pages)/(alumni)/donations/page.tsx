"use client";

import { useDonationContext } from "@/context/DonationContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Donation } from "@/models/models";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SearchParamsWrapper from "@/components/SearchParamsWrapper";

const sortTypes = [
  "MOST RECENT FIRST",
  "OLDEST DONATION FIRST",
  "AMOUNT DONATED (ASC)",
  "AMOUNT DONATED (DESC)",
]; //sort types
const sortValues = ["mrf", "odf", "asc", "desc"]; //sort values (query params)

export default function Donations() {
  return (
    <SearchParamsWrapper>
      <DonationsContent />
    </SearchParamsWrapper>
  );
}

function DonationsContent() {
  const {
    userDonations: originalDonations,
    isLoading: contextLoading,
    error: contextError,
  } = useDonationContext();
  const [userDonations, setUserDonations] = useState<Donation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingAnonymity, setUpdatingAnonymity] = useState<string | null>(
    null
  );
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>(
    {}
  );

  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
  const router = useRouter();

  // Sort the donations when original donations change or sort parameter changes
  useEffect(() => {
    if (!originalDonations) {
      setUserDonations(null);
      return;
    }

    setIsLoading(true);

    // Create a copy of the donations to sort
    const sortedDonations = [...originalDonations];

    // Apply sorting based on the sort parameter
    if (sort === "odf") {
      // Oldest donation first
      sortedDonations.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    } else if (sort === "asc") {
      // Amount donated (asc)
      sortedDonations.sort((a, b) => a.amount - b.amount);
    } else if (sort === "desc") {
      // Amount donated (desc)
      sortedDonations.sort((a, b) => b.amount - a.amount);
    } else {
      // Default: most recent first (mrf)
      sortedDonations.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    setUserDonations(sortedDonations);
    setIsLoading(false);

    // Get all unique donation drive IDs
    const uniqueDriveIds = [
      ...new Set(sortedDonations.map((d) => d.donationDriveId)),
    ];

    // Fetch campaign names for all unique donation drives
    uniqueDriveIds.forEach(async (driveId) => {
      try {
        const driveRef = doc(db, "donation_drive", driveId);
        const driveSnap = await getDoc(driveRef);

        if (driveSnap.exists()) {
          const driveData = driveSnap.data();
          setCampaignNames((prev) => ({
            ...prev,
            [driveId]: driveData.campaignName || "Unnamed Campaign",
          }));
        } else {
          setCampaignNames((prev) => ({
            ...prev,
            [driveId]: "Unknown Campaign",
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching campaign name for drive ${driveId}:`,
          error
        );
        setCampaignNames((prev) => ({
          ...prev,
          [driveId]: "Unknown Campaign",
        }));
      }
    });
  }, [originalDonations, sort]);

  //function for handling change on sort type
  function handleSortChange(sortType: string) {
    let sorting = sortType ? `?sort=${sortType}` : "";
    //will push the parameters to the url
    router.push(`${sorting}`);
  }

  //function for getting the defaultValue for the sort by dropdown using the current query
  function getDefaultSort(): string {
    let defaultSort = "mrf";
    for (let i = 0; i < sortValues.length; i++) {
      if (sortValues[i] === sort) {
        defaultSort = sortValues[i];
        break;
      }
    }
    return defaultSort;
  }

  // Function to handle anonymity toggle
  async function toggleAnonymity(donationId: string, currentStatus: boolean) {
    try {
      setUpdatingAnonymity(donationId);

      // Update in Firestore
      const donationRef = doc(db, "donation", donationId);
      await updateDoc(donationRef, {
        isAnonymous: !currentStatus,
      });

      // Update local state
      if (userDonations) {
        const updatedDonations = userDonations.map((donation) =>
          donation.donationId === donationId
            ? { ...donation, isAnonymous: !currentStatus }
            : donation
        );
        setUserDonations(updatedDonations);
      }
    } catch (err) {
      console.error("Error updating anonymity:", err);
      setError("Failed to update anonymity status.");
    } finally {
      setUpdatingAnonymity(null);
    }
  }

  // Display loading state while context is loading or we're sorting
  const showLoading = contextLoading || isLoading;
  // Use context error or local error
  const displayError = contextError || error;

  return (
    <>
      <title>Donations | ICS-ARMS</title>
      {/*sorting dropdown*/}
      <div>
        <div className="flex">
          <h1>Sort by:</h1>
          <div>
            <select
              id="sort"
              className="outline rounded-xs ml-2"
              defaultValue={getDefaultSort()}
              onChange={(e) => {
                handleSortChange(e.target.value);
              }}
            >
              {sortTypes.map((sortType, index) => (
                <option key={index} value={sortValues[index]}>
                  {sortType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <h1>User donations:</h1>
      {displayError && <p className="text-red-500">{displayError}</p>}
      {showLoading && <p>Loading...</p>}
      <div className="flex flex-col gap-10 mt-5">
        {userDonations && userDonations.length > 0 ? (
          userDonations.map((donation) => (
            <div
              key={donation.donationId}
              className="p-4 border rounded-md shadow-sm"
            >
              <p>
                <strong>Campaign:</strong>{" "}
                {campaignNames[donation.donationDriveId] ||
                  "Loading campaign name..."}
              </p>
              {/* <p><strong>Donation Drive ID:</strong> {donation.donationDriveId}</p>
              <p><strong>Alumni ID:</strong> {donation.alumniId}</p> */}
              <p>
                <strong>Amount:</strong> ₱{donation.amount.toLocaleString()}
              </p>
              <p>
                <strong>Payment Method:</strong> {donation.paymentMethod}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(donation.date).toLocaleString()}
              </p>

              <div className="flex items-center mt-2">
                <strong className="mr-2">Anonymous:</strong>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donation.isAnonymous}
                    className="sr-only peer"
                    onChange={() =>
                      toggleAnonymity(donation.donationId, donation.isAnonymous)
                    }
                    disabled={updatingAnonymity === donation.donationId}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  {updatingAnonymity === donation.donationId && (
                    <span className="ml-2 text-sm text-gray-500">
                      Updating...
                    </span>
                  )}
                </label>
              </div>

              {donation.imageProof && (
                <div className="mt-2">
                  <p>
                    <strong>Payment Proof:</strong>
                  </p>
                  <img
                    src={donation.imageProof}
                    alt="Payment Proof"
                    className="mt-2 max-w-xs"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No donations found</p>
        )}
      </div>
    </>
  );
}
