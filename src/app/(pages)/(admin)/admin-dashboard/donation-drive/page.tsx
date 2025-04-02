"use client";

import { useState } from "react";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { DonationDrive } from "@/models/models";
import React from "react";
import BookmarkButton from "@/components/ui/bookmark-button";

export default function Users() {
  const {
    donationDrives,
    isLoading,
    editDonoDriveForm,
    editDonoForm,
    setEditDonoForm,
    deleteDonationDrive,
    subEditDonoDrive,
    submitDonationDrive,
    addDonoForm,
    setAddDonoForm,
    campaignName,
    setCampaignName,
    description,
    setDescription,
  } = useDonationDrives();

  // Add sorting state
  const [sortBy, setSortBy] = useState("latest");
  
  // Add status filter state
  const [statusFilter, setStatusFilter] = useState("all");
  
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

  // Filter drives based on selected status
  const filteredDrives = statusFilter === "all" 
    ? sortedDrives 
    : sortedDrives.filter(drive => drive.status === statusFilter);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Donation Drives</h1>
      
      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All Drives
          </button>
          <button 
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === "active" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === "pending" 
                ? "bg-yellow-600 text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === "rejected" 
                ? "bg-red-600 text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Rejected
          </button>
        </div>
        
        {/* Sorting Dropdown */}
        <div className="flex justify-start items-center">
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
      </div>

      {isLoading && <div className="text-center text-lg">Loading...</div>}

      {/* Donation Drive List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {statusFilter === "all" ? "All Donation Drives" :
           statusFilter === "active" ? "Active Donation Drives" :
           statusFilter === "pending" ? "Pending Donation Drives" :
           "Rejected Donation Drives"}
        </h2>
        
        {filteredDrives.length === 0 ? (
          <p className="text-gray-500">No donation drives found.</p>
        ) : (
          <div className="space-y-4">
            {filteredDrives.map((drive: DonationDrive, index: any) => (
              <div
                key={index}
                className="p-4 flex justify-between items-center border rounded-lg shadow-sm hover:shadow-md bg-white"
              >
                <div>
                  <h1 className="text-xl font-semibold">Name: {drive.campaignName}</h1>
                  <h2 className="text-sm text-gray-500">ID: {drive.donationDriveId}</h2>
                  <h2 className="text-sm text-gray-700">Description: {drive.description}</h2>
                  <h2 className={`text-sm font-medium ${
                    drive.status === "active" ? "text-green-600" : 
                    drive.status === "pending" ? "text-yellow-600" : 
                    "text-red-600"
                  }`}>
                    Status: {drive.status}
                  </h2>
                  <h2 className="text-lg font-bold text-blue-600">Total Amount: ${drive.totalAmount}</h2>
                  <h2 className="text-xs text-gray-500">Posted on: {drive.datePosted.toDate().toLocaleString()}</h2>
                </div>
                <div className="flex gap-4">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() =>
                      editDonoDriveForm(
                        drive.donationDriveId,
                        drive.campaignName,
                        drive.description
                      )
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => deleteDonationDrive(drive.donationDriveId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full shadow-md hover:bg-blue-600 transition"
        onClick={() => setAddDonoForm(!addDonoForm)}
      >
        +
      </button>

      {addDonoForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <form
            onSubmit={submitDonationDrive}
            className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w-full max-w-md"
          >
            <h2 className="text-xl mb-4">Add Donation Drive</h2>
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
              <button
                type="button"
                onClick={() => setAddDonoForm(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {editDonoForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <form
            onSubmit={subEditDonoDrive}
            className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w-full max-w-md"
          >
            <h2 className="text-xl mb-4">Edit Donation Drive</h2>
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
              <button
                type="button"
                onClick={() => {
                  setEditDonoForm(false);
                  setCampaignName("");
                  setDescription("");
                }}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}