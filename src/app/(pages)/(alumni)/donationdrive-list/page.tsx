"use client";

import { useDonationDrives } from "@/context/DonationDriveContext";
import { useBookmarks } from "@/context/BookmarkContext";
import { DonationDrive } from "@/models/models";
import { DonateDialog } from "./DonateDialog";

export default function DonationDrivesPage() {
  const { donationDrives, isLoading, addDonoForm, setAddDonoForm,suggestDonationDrive, campaignName, setCampaignName, description, setDescription } = useDonationDrives();
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
    <button
      className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full"
      onClick={() => setAddDonoForm(!addDonoForm)}
    >
      +
    </button>

      {addDonoForm && (
       <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <form onSubmit={suggestDonationDrive} className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w">
            <h2 className="text-xl mb-4">Suggest Donation Drive</h2>
            <input
              type="text"
              placeholder="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <div className="flex justify-between">
              <button type="button" onClick={() => setAddDonoForm(false)} className="text-gray-500">Cancel</button>
              <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
