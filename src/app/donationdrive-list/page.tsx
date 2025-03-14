"use client";

import { useDonationDrives } from "@/context/DonationDriveContext";
import { useBookmarks } from "@/context/BookmarkContext";
import { DonationDrive } from "@/models/models";

export default function DonationDrivesPage() {
  const { donationDrives, isLoading } = useDonationDrives();
  const { addBookmark } = useBookmarks();

  if (!donationDrives) return <h1>Loading donation drives...</h1>;

  return (
    <div>
      <h1>Donation Drives</h1>
      {isLoading && <h1>Loading...</h1>}

      {donationDrives.map((drive: DonationDrive ) => (
        <div key={drive.id} className="p-4 border rounded-lg">
          <h2>Name: {drive.campaignName}</h2>
          <p>ID: {drive.id}</p>
          <p>Description: {drive.description}</p>
          <p>Total Amount: ${drive.totalAmount}</p>
          <p>Posted on: {drive.datePosted.toDate().toLocaleString()}</p>

        <button onClick={() => addBookmark(drive.id, "donation_drive")}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
            Bookmark
        </button>

        </div>
      ))}
    </div>
  );
}
