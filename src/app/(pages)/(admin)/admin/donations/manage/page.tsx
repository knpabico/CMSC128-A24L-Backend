"use client";

import { useEffect, useRef, useState } from "react";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { DonationDrive } from "@/models/models";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
// import { formatDistance } from "date-fns";

export default function DonationDrives() {
  const router = useRouter();
  const {
    donationDrives,
    events,
    isLoading,
    addDonationDrive,
    showForm,
    setShowForm,
    handleImageChange,
    handleBenefiaryChange,
    handleAddBeneficiary,
    handleRemoveBeneficiary,
    handleSave,
    handleEdit,
    handleDelete,
    // handleReject,
    // handleAccept,
    campaignName,
    setCampaignName,
    description,
    setDescription,
    creatorId,
    setCreatorId,
    image,
    setImage,
    fileName,
    setFileName,
    preview,
    setPreview,
    targetAmount,
    setTargetAmount,
    isEvent,
    setIsEvent,
    eventId,
    setEventId,
    endDate,
    setEndDate,
    status,
    setStatus,
    oneBeneficiary, 
    setOneBeneficiary,
    beneficiary,
    setBeneficiary,
    getDonationDriveById,
    getEventById,
    fetchAlumnusById,
  } = useDonationDrives();

  const [editForm, setEditForm] = useState(false);
  const [donationDriveId, setDonationDriveId] = useState("");
  const [creatorNames, setCreatorNames] = useState<{ [key: string]: string }>({});
  
  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");

	const tableRef = useRef(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  
  if (!donationDrives) return <div>Loading donation drives...</div>;

  // Sort donation drives based on selected option
  const sortedDrives = [...donationDrives].sort((a, b) => {
    switch (sortBy) {
      case "ascending":
        return a.targetAmount - b.targetAmount;
      case "descending":
        return b.targetAmount - a.targetAmount;
      case "oldest":
        return a.datePosted.toDate().getTime() - b.datePosted.toDate().getTime();
      case "latest":
        return b.datePosted.toDate().getTime() - a.datePosted.toDate().getTime();
      case "alphabetical": {
        const aName = (a.isEvent && events[a.eventId])
          ? events[a.eventId]!.title
          : a.campaignName;
        const bName = (b.isEvent && events[b.eventId])
          ? events[b.eventId]!.title
          : b.campaignName;
      
        return aName.toLowerCase().localeCompare(bName.toLowerCase());
      }
      default:
        return 0;
    }
  });

  const filteredDrives = statusFilter === "all" 
    ? sortedDrives 
    : sortedDrives.filter(drive => drive.status === statusFilter);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const navigateToDetails = (id: string) => {
    router.push(`donation-drive/details?id=${id}`);
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj = typeof date === 'object' && date.toDate 
      ? date.toDate() 
      : new Date(date);
      
    return dateObj.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fixed useEffect to prevent hanging when changing filters
  useEffect(() => {
    // Keep track of mounted state to prevent state updates after unmount
    let isMounted = true;
    
    const fetchCreators = async () => {
      // Only fetch creators that haven't been fetched already
      const drivesToFetch = filteredDrives.filter(drive => 
        drive.creatorType === "alumni" && !creatorNames[drive.donationDriveId]
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

  return (
    <div className="flex flex-col gap-5">
			{/* Path */}
		 <div className="flex items-center gap-2">
        <div>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>
          Manage Donation Drives
        </div>
      </div>
			{/* Header */}
			<div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Manage Donation Drive
          </div>
          {/* <div className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600">
            + Create Donation Drive
          </div> */}
        </div>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex flex-col gap-3">
        <div className="w-full flex gap-2">
					<div onClick={() => setStatusFilter("all")} className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${ statusFilter === "all" ? "bg-[var(--primary-blue)]" : "bg-white" }`}>
						<div className={`w-full h-1 transition-colors ${statusFilter === "all" ? "bg-[var(--primary-blue)]" : "bg-transparent"}`}> </div>
						<div className={`w-full py-3 flex items-center justify-center rounded-t-2xl font-semibold text-base ${ statusFilter === "all" ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"}`}>
							All Drives
						</div>
					</div>
					<div onClick={() => setStatusFilter("active")} className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${ statusFilter === "active" ? "bg-[var(--primary-blue)]" : "bg-white" }`}>
						<div className={`w-full h-1 transition-colors ${statusFilter === "active" ? "bg-[var(--primary-blue)]" : "bg-transparent"}`}> </div>
						<div className={`w-full py-3 flex items-center justify-center rounded-t-2xl font-semibold text-base ${ statusFilter === "active" ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"}`}>
							Active
						</div>
					</div>
          {/* <button 
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === "pending" 
                ? "bg-yellow-600 text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Pending
          </button> */}
          <div onClick={() => setStatusFilter("completed")} className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${ statusFilter === "completed" ? "bg-[var(--primary-blue)]" : "bg-white" }`}>
						<div className={`w-full h-1 transition-colors ${statusFilter === "completed" ? "bg-[var(--primary-blue)]" : "bg-transparent"}`}> </div>
						<div className={`w-full py-3 flex items-center justify-center rounded-t-2xl font-semibold text-base ${ statusFilter === "completed" ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"}`}>
							Closed
						</div>
					</div>
          {/* <button 
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              statusFilter === "rejected" 
                ? "bg-red-600 text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Rejected
          </button> */}
        </div>

				{/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
          <div className="bg-gray-200 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Any Date</div>
            <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs">
							<option value="latest" className="text-xs">Latest</option>
							<option value="oldest" className="text-xs">Oldest</option>
							<option value="ascending" className="text-xs">Amount (Low to High)</option>
							<option value="descending" className="text-xs">Amount (High to Low)</option>
							<option value="alphabetical" className="text-xs">Alphabetical</option>
						</select>
          </div>
        </div>
      </div>

      {isLoading && <div className="text-center text-lg">Loading...</div>}

      {/* Donation Drive List */}
      <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
				<div className="rounded-xl overflow-hidden border border-gray-300 relative" ref={tableRef}>
					{/* Blue Header */}
					<div className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${isSticky ? 'fixed top-0' : ''}`} style={{ width: isSticky ? headerWidth : '100%' }} >
						<div className="w-1/2 flex items-center justify-baseline font-semibold">
							Donation Drive Info
						</div>
						<div className="w-1/2 flex justify-end items-center">
							<div className="w-1/6 flex items-center justify-center font-semibold">Active</div>
							<div className="w-1/6 flex items-center justify-center font-semibold">Actions</div>
							<div className="w-1/6 flex items-center justify-center"></div>
						</div>
					</div>
					{/* Spacer div to prevent content jump when header becomes fixed */}
					{isSticky && <div style={{ height: '56px' }}></div>}
				</div>
      
        {filteredDrives.length === 0 ? (
        	<p className="text-gray-500 mt-4 text-center">No donation drives found.</p>
        ) : (
        <div className="flex flex-col gap-4">
          {filteredDrives.map((drive: DonationDrive) => {
          // grab the event from your context's events map
          const ev = events[drive.eventId];
          return (
            <div
              key={drive.donationDriveId}
              className="border rounded-lg shadow-sm hover:shadow-md bg-white overflow-hidden flex flex-row"
            >
              {/* Image Section */}
              <div
                className="cursor-pointer w-1/4 min-w-64 bg-gray-200"
                onClick={() => navigateToDetails(drive.donationDriveId)}
              >
                {drive.image ? (
                  <img
                    src={drive.image}
                    alt={drive.campaignName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div
                className="p-4 flex-grow cursor-pointer"
                onClick={() => navigateToDetails(drive.donationDriveId)}
              >
                {/* Campaign / Event Title with Status */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold truncate flex-1">
                    {drive.isEvent && ev ? ev.title : drive.campaignName}
                  </h2>
                  <span
                    className={`ml-4 px-2 py-0.5 text-xs font-medium rounded-full ${
                      drive.status === "active"
                        ? "bg-green-100 text-green-800"
                        // : drive.status === "pending"
                        // ? "bg-yellow-100 text-yellow-800"
                        : drive.status === "completed"
                        ? "bg-purple-100 text-purple-800"
                        // : drive.status === "rejected"
                        // ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-5 text-sm max-h-[40px] overflow-hidden text-clip">
                  <p className="text-start">
                    {drive.isEvent && ev ? ev.description : drive.description}
                  </p>
                </div>

                {/* Event Details */}
                {drive.isEvent && ev ? (
                  <div className="mt-5">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex gap-1 items-center w-1/3 justify-center">
                        <Calendar size={16} />
                        <p className="text-xs">{formatDate(ev.datePosted)}</p>
                      </div>
                      <div className="flex gap-1 items-center w-1/3 justify-center">
                        <Clock size={16} />
                        <p className="text-xs">{ev.time}</p>
                      </div>
                      <div className="flex gap-1 items-center w-1/3 justify-center">
                        <MapPin size={16} />
                        <p className="text-xs truncate">{ev.location}</p>
                      </div>
                    </div>
                    <div className="mt-5 text-xs text-start">
                      <p>Donation Type: Event-related Campaign</p>
                    </div>
                  </div>
                  ) : (
                    <div className="mt-5 text-xs text-start">
                      <p>Donation Type: General Campaign</p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        drive.status === "completed" ? "bg-purple-600" : "bg-blue-600"
                      }`}
                      style={{
                        width: `${getProgressPercentage(
                          drive.currentAmount,
                          drive.targetAmount
                        )}%`,
                      }}
                    ></div>
                  </div>

                  {/* Amount & Progress */}
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-bold text-blue-600">
                      ${drive.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      of ${drive.targetAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      {getProgressPercentage(drive.currentAmount, drive.targetAmount)}%
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-gray-500">
                    <p>Date Posted: {formatDate(drive.datePosted)}</p>
                    <p>Start date: {formatDate(drive.startDate)}</p>
                    <p>End date: {formatDate(drive.endDate)}</p>
                  </div>

                  {/* Creator */}
                  <div className="text-xs text-gray-700 mt-2">
                    <p>
                      Created by: {creatorNames[drive.donationDriveId] ?? "Admin"}
                    </p>
                    <p>Creator Type: {drive.creatorType}</p>
                  </div>
                </div>
                  
                  {/* Action Buttons - Right Side */}
                  <div className="p-4 bg-gray-50 border-l flex flex-col justify-center gap-2 min-w-32">
                    {/* {drive.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(drive.donationDriveId)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition w-full"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(drive.donationDriveId)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition w-full"
                        >
                          Reject
                        </button>
                      </>
                    )} */}

                    { drive.status !== "rejected" &&
                      <button
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition w-full"
                      onClick={() => {
                        setEditForm(true);
                        setDonationDriveId(drive.donationDriveId);
                        setCampaignName(drive.campaignName);
                        setImage(drive.image);
                        setBeneficiary(drive.beneficiary);
                        setDescription(drive.description);
                        setTargetAmount(drive.targetAmount);
                        setEndDate(drive.endDate);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>}
                    
                    <button
                      onClick={() => handleDelete(drive.donationDriveId)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition w-full"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
        )}
      </div>

      {/* <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full shadow-md hover:bg-blue-600 transition"
        onClick={() => {
          setShowForm(true)
          setEventId(event.eventId)
          setDonationDriveId(event.donationDriveId);
          setCampaignName(event.title);
          setImage(event.image);
          setDescription(event.description);
          setEndDate(event.date);
          setShowForm(true);
        }}
      >
        +
      </button> */}

    {/* Edit Donation Drive Modal */}
    {setShowForm && setEditForm && donationDriveId && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
              <form
                onSubmit={
                  (e) => {
                  e.preventDefault();
                  handleEdit(donationDriveId, { campaignName, description, image, beneficiary, targetAmount, endDate }); // Pass the current value if it will be edited
                  setShowForm(false);
                  setEditForm(false);
                  setDonationDriveId("");
                  setCreatorId("");
                  setCampaignName("");
                  setDescription("");
                  setOneBeneficiary("");
                  setBeneficiary([]);
                  setTargetAmount(0);
                  setEndDate(new Date());
                  }
                }
                className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]"
              >
                <h2 className="text-xl mb-4">
                  Edit Donation Drive
                </h2>
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
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload Photo
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />                
                {beneficiary.map( (beneficiaries: string, index: number) => (
                  <div key = {index} className="flex justify-between my-1">
                    <input
                      type="text"
                      placeholder="Beneficiary"
                      value={beneficiaries}
                      onChange={(e) => handleBenefiaryChange(e,index)}
                      className="w-full mb-4 p-2 border rounded"
                      required
                    />
                    {beneficiary.length > 1 && (
                      <button 
                        type="button" 
                        className='px-4 py-2 bg-red-500 text-white rounded-md'
                        onClick={() => handleRemoveBeneficiary(index)}>
                        Remove
                      </button>
                              )}
                          </div>						
                  ))}
                  <button 
                    type="button" 
                    className='px-4 py-2 bg-green-500 text-white rounded-md'
                    onClick={handleAddBeneficiary}>
                    Add Beneficiary
                  </button>
                <input
                  type="number"
                  placeholder="Target Amount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                <label htmlFor="">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                  min={
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                  }
                />

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => {       
                      setEditForm(false);
                      setShowForm(false);
                      setEditForm(true);
                      setDonationDriveId("");
                      setCampaignName("");
                      setDescription("");
                      setTargetAmount(0);
                      setEndDate(new Date());}}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          )}
    {/* Add Donation Drive Modal */}
    {/* {showForm && !editForm && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
              <form
                onSubmit={handleSave}
                className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]"
              >
                <h2 className="text-xl mb-4">
                  Add Donation Drive
                </h2>
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
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload Photo
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />                
                {beneficiary.map( (beneficiaries: string, index: number) => (
                  <div key = {index} className="flex justify-between my-1">
                    <input
                      type="text"
                      placeholder="Beneficiary"
                      value={beneficiaries}
                      onChange={(e) => handleBenefiaryChange(e,index)}
                      className="w-full mb-4 p-2 border rounded"
                      required
                    />
                    {beneficiary.length > 1 && (
                      <button 
                        type="button" 
                        className='px-4 py-2 bg-red-500 text-white rounded-md'
                        onClick={() => handleRemoveBeneficiary(index)}>
                        Remove
                      </button>
                    )}
                  </div>						
                  ))}
                  <button 
                    type="button" 
                    className='px-4 py-2 bg-green-500 text-white rounded-md'
                    onClick={handleAddBeneficiary}>
                    Add Beneficiary
                  </button>
                <input
                  type="number"
                  placeholder="Target Amount"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />
                <label htmlFor="">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                  min={
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                  }
                />

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
          )} */}
    </div>
  );
}