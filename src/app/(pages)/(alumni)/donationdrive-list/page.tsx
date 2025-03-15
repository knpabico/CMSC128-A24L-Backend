"use client";

import { useDonationDrives } from "@/context/DonationDriveContext";
import { useBookmarks } from "@/context/BookmarkContext";
import { DonationDrive } from "@/models/models";
import { DonateDialog } from "./DonateDialog";

export default function DonationDrivesPage() {
  const { donationDrives, isLoading } = useDonationDrives();
  const { addBookmark } = useBookmarks();

  if (!donationDrives) return <h1>Loading donation drives...</h1>;

  return (
    <div>
      <h1>Donation Drives</h1>
      {isLoading && <h1>Loading...</h1>}

      {donationDrives.map((drive: DonationDrive) => (
        <div key={drive.donationDriveId} className="p-4 border rounded-lg">
          <h2>Name: {drive.campaignName}</h2>
          <p>ID: {drive.donationDriveId}</p>
          <p>Description: {drive.description}</p>
          <p>Total Amount: ${drive.totalAmount}</p>
          <p>Posted on: {drive.datePosted.toDate().toLocaleString()}</p>

          <button
            onClick={() => addBookmark(drive.donationDriveId, "donation_drive")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition mr-5"
          >
            Bookmark
          </button>

          {/* button for donating */}
          {/* it opens a donation dialog box */}
          <DonateDialog drive={drive} />
        </div>
      ))}
    </div>
  );
}
