"use client";

import { useEffect, useState } from "react";
import { Donation } from "@/models/models";
import { useDonationContext } from "@/context/DonationContext";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronDown } from "lucide-react";
import { ProofOfPaymentDialog } from "./proof-of-payment-dialog";
import SearchParamsWrapper from "@/components/SearchParamsWrapper";

const sortTypes = [
  "Latest Donation First",
  "Oldest Donation First",
  "Amount Donated (ASC)",
  "Amount Donated (DESC)",
]; //sort types
const sortValues = ["mrf", "odf", "asc", "desc"]; //sort values (query params)

const RecordOfDonations: React.FC = () => {
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    null
  );

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
    const sorting = sortType ? `?sort=${sortType}` : "";
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
    <div className="mx-50 mt-10 mb-15">
      <div className="flex flex-col gap-[10px] w-full mb-10">
        {/* Sort Tab */}
        <div className="filter-controls flex space-x-5 mb-2 justify-end items-center text-sm">
          <label htmlFor="sort" className="mr-2">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort"
              className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {displayError && <p className="text-red-500">{displayError}</p>}
        {showLoading && <p>Loading...</p>}

        {userDonations && userDonations.length > 0 ? (
          <div className="bg-[#FFFF] py-[20px] px-[20px] rounded-[10px] shadow-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                    >
                      Campaign
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                    >
                      Payment Method
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                    >
                      Anonymous
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                    >
                      Proof
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userDonations.map((donation) => (
                    <tr key={donation.donationId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-700">
                        {campaignNames[donation.donationDriveId] ||
                          "Loading campaign name..."}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-medium text-gray-900">
                        ₱ {donation.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                        {donation.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                        {new Date(donation.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                        <div className="flex justify-center items-center mt-2">
                          <label className="flex items-center cursor-pointer space-x-2">
                            <input
                              type="checkbox"
                              checked={donation.isAnonymous}
                              onChange={() =>
                                toggleAnonymity(
                                  donation.donationId,
                                  donation.isAnonymous
                                )
                              }
                              disabled={
                                updatingAnonymity === donation.donationId
                              }
                              className="w-4 h-4"
                            />
                            {updatingAnonymity === donation.donationId && (
                              <span className="ml-2 text-sm text-gray-500">
                                Updating...
                              </span>
                            )}
                          </label>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedDonationId(donation.donationId);
                            setSelectedImage("/proof.jpg");
                          }} // Adjust with the correct image path
                          className="text-blue-500 hover:underline text-sm"
                        >
                          View Proof
                        </button>
                        {selectedDonationId === donation.donationId &&
                          selectedImage && (
                            <ProofOfPaymentDialog
                              selectedImage={selectedImage}
                              setSelectedImage={setSelectedImage}
                            />
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
            <p className="text-gray-700">No donations have been made yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ReturnOfDonationsModal() {
  return (
    <SearchParamsWrapper>
      <RecordOfDonations />
    </SearchParamsWrapper>
  );
}
