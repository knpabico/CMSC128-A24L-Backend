"use client";

import { useState } from "react";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { DonationDrive } from "@/models/models";
import React from "react";

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

  return (
    <div>
      <h1>Donation Drives</h1>
      {isLoading && <h1>Loading</h1>}
      {donationDrives.map((drive: DonationDrive, index: any) => (
        <div
          key={index}
          className="p-1 flex justify-between items-center border-b pb-2"
        >
          <div>
            <h1>Name: {drive.campaignName}</h1>
            <h2>ID: {drive.donationDriveId}</h2>
            <h2>Description: {drive.description}</h2>
            <h2>Status: {drive.status}</h2>
            <h2>Total Amount: ${drive.totalAmount}</h2>
            <h2>Posted on: {drive.datePosted.toDate().toLocaleString()}</h2>
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

      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full"
        onClick={() => setAddDonoForm(!addDonoForm)}
      >
        +
      </button>

      {addDonoForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <form
            onSubmit={submitDonationDrive}
            className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w"
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
            className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w"
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
