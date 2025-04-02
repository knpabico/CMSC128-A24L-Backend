"use client";

import { useDonationDrives } from "@/context/DonationDriveContext";
import { DonationDrive } from "@/models/models";
import { DonateDialog } from "./DonateDialog";
import { useState } from "react";
import BookmarkButton from "@/components/ui/bookmark-button";

export default function DonationDrivesPage() {
  const {
    donationDrives,
    isLoading,
    addDonoForm,
    setAddDonoForm,
    suggestDonationDrive,
    campaignName,
    setCampaignName,
    description,
    setDescription,
  } = useDonationDrives();

  const [sortBy, setSortBy] = useState("latest");
  const [selectedDrive, setSelectedDrive] = useState<DonationDrive | null>(null);
  
  if (!donationDrives) return <div>Loading donation drives...</div>;
  
  // Sort donation drives based on selected option
  const sortedDrives = [...donationDrives].sort((a, b) => {
    switch (sortBy) {
      case "ascending":
        return a.totalAmount - b.totalAmount;
      case "descending":
        return b.totalAmount - a.totalAmount;
      case "oldest":
        return a.datePosted.toDate().getTime() - b.datePosted.toDate().getTime();
      case "latest":
        return b.datePosted.toDate().getTime() - a.datePosted.toDate().getTime();
      case "alphabetical":
        return a.campaignName.localeCompare(b.campaignName);
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Donation Drives</h1>
      
      {/* Sorting Dropdown */}
      <div className="mb-6 flex justify-start items-center">
        <label htmlFor="sort" className="mr-2 font-medium text-gray-700">Sort by:</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="ascending">Amount (Low to High)</option>
          <option value="descending">Amount (High to Low)</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {isLoading && <div className="text-center text-lg">Loading...</div>}

      {/* Donation Drive Cards */}
      <div className="space-y-8">
        {/* Active Donation Drives */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Donation Drives</h2>
          {sortedDrives.filter(drive => drive.status === "active").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDrives
                .filter((drive) => drive.status === "active")
                .map((drive) => (
                  <div 
                    key={drive.donationDriveId} 
                    className="relative bg-white border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer w-full h-56 flex flex-col justify-between"
                    onClick={() => setSelectedDrive(drive)}
                  >
                    {/* Bookmark Button */}
                    <div className="absolute top-3 right-3">
                      <BookmarkButton 
                        entryId={drive.donationDriveId}  
                        type="donation_drive" 
                        size="lg"
                      />
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{drive.campaignName}</h2>
                    <p className="text-sm text-gray-700 line-clamp-3">{drive.description}</p>
                    <p className="font-bold text-lg text-blue-600">Total Amount: ${drive.totalAmount}</p>
                    <p className="text-sm text-gray-500">
                      Date Posted: {drive.datePosted.toDate().toLocaleString()}
                    </p>

                    <div className="flex space-x-3"> 
                      <DonateDialog drive={drive} />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No active donation drives found.</p>
            </div>
          )}
        </div>

        {/* Pending Donation Drives */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Donation Drives</h2>
          {sortedDrives.filter(drive => drive.status === "pending").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDrives
                .filter((drive) => drive.status === "pending")
                .map((drive) => (
                  <div 
                    key={drive.donationDriveId} 
                    className="relative bg-white border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer w-full h-56 flex flex-col justify-between"
                    onClick={() => setSelectedDrive(drive)}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">{drive.campaignName}</h2>
                    <p className="text-sm text-gray-700 line-clamp-3">{drive.description}</p>
                    <p className="font-bold text-lg text-blue-600">Total Amount: ${drive.totalAmount}</p>
                    <p className="text-sm text-gray-500">
                      Date Posted: {drive.datePosted.toDate().toLocaleString()}
                    </p>

                    <div className="flex space-x-3"> 
                      <DonateDialog drive={drive} />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No pending donation drives found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full shadow-md hover:bg-blue-600 transition"
        onClick={() => setAddDonoForm(!addDonoForm)}
      >
        +
      </button>

      {/* Donation Drive Details Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
        <div className="bg-white p-8 rounded-lg border-2 border-gray-200 shadow-xl w-[90%] max-w-lg relative">
          {/* Bookmark Button */}
          <div className="absolute top-3 right-3">
            <BookmarkButton 
              entryId={selectedDrive.donationDriveId}  
              type="donation_drive" 
              size="lg"
            />
          </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{selectedDrive.campaignName}</h2>
            <p className="text-gray-700 mb-4">{selectedDrive.description}</p>
            <p className="font-bold text-lg text-blue-600 mb-4">Total Amount: ${selectedDrive.totalAmount}</p>
            <p className="text-sm text-gray-500 mb-6">
              Posted on: {selectedDrive.datePosted.toDate().toLocaleString()}
            </p>

            <div className="flex justify-between">
              <button 
                onClick={() => setSelectedDrive(null)} 
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              <DonateDialog drive={selectedDrive} />
            </div>
          </div>
        </div>
      )}

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