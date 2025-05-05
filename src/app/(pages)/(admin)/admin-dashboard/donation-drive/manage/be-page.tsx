
"use client";

import { useEffect, useState } from "react";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { DonationDrive } from "@/models/models";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Clock, MapPin } from "lucide-react";
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
	handleGcashChange,
	handlePaymayaChange,
	handleImageChange,
	handleBenefiaryChange,
	handleAddBeneficiary,
	handleRemoveBeneficiary,
	handleSave,
	handleEdit,
	handleDelete,
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
	<div className="container mx-auto p-6">
	  <h1 className="text-3xl font-bold mb-6 text-gray-800">Donation Drives Management</h1>
	  
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
			onClick={() => setStatusFilter("completed")}
			className={`px-4 py-2 rounded-md font-medium transition-colors ${
			  statusFilter === "completed" 
				? "bg-purple-600 text-white" 
				: "bg-gray-200 text-gray-800 hover:bg-gray-300"
			}`}
		  >
			Completed
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
		   "Completed Donation Drives"}
		</h2>
		
		{filteredDrives.length === 0 ? (
		<p className="text-gray-500">No donation drives found.</p>
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

	  <button
		className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full shadow-md hover:bg-blue-600 transition"
		onClick={() => {
		  setShowForm(true)
		  setIsEvent(false);
		  setShowForm(true);
		}}
	  >
		+
	  </button>

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
				{/* <label
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
				/>                 */}
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
	{showForm && !editForm && (
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
				<div className="flex justify-between my-1">
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
				  <label
					htmlFor="gcash-upload"
					className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				  >
					Upload GCash QR Code
				  </label>
				  <input
					id="gcash-upload"
					type="file"
					accept="image/*"
					onChange={handleGcashChange}
					className="hidden"
					required
				  />
				  <label
					htmlFor="paymaya-upload"
					className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				  >
					Upload PayMaya QR Code
				  </label>
				  <input
					id="paymaya-upload"
					type="file"
					accept="image/*"
					onChange={handlePaymayaChange}
					className="hidden"
					required
				  />                   
				</div>
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
		  )}
	</div>
  );
}


"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { useDonationContext } from '@/context/DonationContext';
import { useAuth } from '@/context/AuthContext';
import { DonationDrive, Donation, Event } from '@/models/models';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
// import { DonateDialog } from '../DonateDialog';
import BookmarkButton from '@/components/ui/bookmark-button';
import { MoveLeft, Users, Clock, HandHeart, Calendar, MapPin, X, CircleCheck } from 'lucide-react';
// import { ThankYouDialog } from '../ThankYouDialog';


const DonationDriveDetailsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const donationDriveId = searchParams.get('id');
  const { getDonationDriveById } = useDonationDrives();
  const { getDonationsByDonationDrive } = useDonationContext();
  const [donationDrive, setDonationDrive] = useState<DonationDrive | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [donations, setDonations] = useState<(Donation & { displayName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonors, setShowDonors] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false); // Track thank you dialog


  // Format date function with improved type safety
  const formatDate = (timestamp: any): string => {
	try {
	  if (!timestamp) return 'N/A';
	  const date = timestamp.toDate?.() || new Date(timestamp);
	  return isNaN(date.getTime()) 
		? 'Invalid Date' 
		: date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		  });
	} catch (err) {
	  console.error('Date formatting error:', err);
	  return 'Invalid Date';
	}
  };

  // Format time ago
  const formatTimeAgo = (timestamp: any) => {
	try {
	  if (!timestamp) return '';
	  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
	  const now = new Date();
	  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	  if (diffInSeconds < 60) return 'just now';
	  if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	  }
	  if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	  }
	  if (diffInSeconds < 2592000) {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	  }
	  if (diffInSeconds < 31536000) {
		const months = Math.floor(diffInSeconds / 2592000);
		return `${months} month${months > 1 ? 's' : ''} ago`;
	  }
	  const years = Math.floor(diffInSeconds / 31536000);
	  return `${years} year${years > 1 ? 's' : ''} ago`;
	} catch (err) {
	  return '';
	}
  };

//Calculate Days Remaining
const getRemainingDays = (endDate: any) => {
	try {
		const today = new Date(); // Current date
		const end = endDate.toDate(); // Firestore Timestamp to JS Date
		const diffTime = end.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 0) return "Expired";
		else if (diffDays === 1) return "1 day left";
		else return `${diffDays} days left`;
	} catch (err) {
		return 'Invalid Date';
	}
};

  // Calculate progress percentage 
  const calculateProgress = (current: number, target: number): string => {
	if (target <= 0 || isNaN(target) || isNaN(current)) return '0';
	const percentage = (current / target) * 100;
	return Math.min(percentage, 100).toFixed(0);
  };

	// Get most recent donation
	const recentDonation = donations.reduce((latest, donation) => {
		return new Date(donation.date) > new Date(latest.date) ? donation : latest;
	}, donations[0]);
	
	// Get the highest donation
	const highestDonation = donations.reduce((max, donation) => {
		return donation.amount > max.amount ? donation : max;
	}, donations[0]);

  useEffect(() => {
	if (!donationDriveId) {
	  setError('No donation drive ID provided');
	  setLoading(false);
	  return;
	}

	const fetchDonationDrive = async () => {
	  try {
		setLoading(true);
		setError(null);

		const data = await getDonationDriveById(donationDriveId);
		if (!data) {
		  throw new Error('Donation drive not found');
		}
		setDonationDrive(data);

		// If this is an event-related donation drive, fetch the event details
		if (data.isEvent && data.eventId) {
		  await fetchEventDetails(data.eventId);
		}
	  } catch (err) {
		console.error('Error fetching donation drive:', err);
		setError(err instanceof Error ? err.message : 'Failed to load donation drive details');
	  } finally {
		setLoading(false);
	  }
	};

	fetchDonationDrive();
  }, [donationDriveId, getDonationDriveById]);

  // Fetch event details if this donation drive is related to an event
  const fetchEventDetails = async (eventId: string) => {
	try {
	  setEventLoading(true);
	  const eventRef = doc(db, "event", eventId);
	  const eventSnap = await getDoc(eventRef);

	  if (eventSnap.exists()) {
		const eventData = eventSnap.data() as Event;
		setEvent({ ...eventData, eventId });
	  } else {
		console.warn('Event not found for ID:', eventId);
	  }
	} catch (err) {
	  console.error('Error fetching event details:', err);
	} finally {
	  setEventLoading(false);
	}
  };

  useEffect(() => {
	const fetchDonations = async () => {
	  if (!donationDriveId) return;

	  try {
		setDonationsLoading(true); // Set loading to true at the start

		// Use the updated function with donationDriveId parameter
		const donationsData = await getDonationsByDonationDrive(donationDriveId);

		// Fetch donor details for non-anonymous donations
		const enhancedDonations = await Promise.all(
		  donationsData.map(async (donation) => {
			// Skip fetching details for anonymous donations
			if (donation.isAnonymous) {
			  return { ...donation, displayName: 'Anonymous' };
			}

			try {
			  // Directly fetch donor details from Firestore using the alumniId from the donation
			  const donorRef = doc(db, "alumni", donation.alumniId);
			  const donorSnap = await getDoc(donorRef);

			  if (donorSnap.exists()) {
				const donorData = donorSnap.data();
				return { 
				  ...donation, 
				  displayName: `${donorData.firstName || ''} ${donorData.lastName || ''}`.trim() || 'Unknown'
				};
			  } else {
				return { ...donation, displayName: 'Unknown' };
			  }
			} catch (error) {
			  console.error(`Error fetching donor info for ${donation.alumniId}:`, error);
			  return { ...donation, displayName: 'Unknown' };
			}
		  })
		);

		setDonations(enhancedDonations);
		setDonationsLoading(false);
	  } catch (err) {
		console.error('Error fetching donations:', err);
	  } finally {
		setDonationsLoading(false); // Make sure loading is set to false whether successful or not
	  }
	};

	fetchDonations();
  }, [donationDriveId, getDonationsByDonationDrive]);

  const handleDonationSuccess = () => {
	setIsThankYouOpen(true); // Trigger the Thank You dialog when donation is successful
  };

  if (loading) {
	return (
	  <div className="flex justify-center items-center h-64">
		<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
	  </div>
	);
  }

  if (error) {
	return (
	  <div className="container mx-auto px-4 py-8">
		<div className="p-4 bg-red-100 text-red-700 rounded-md">
		  <h2 className="font-bold text-lg">Error</h2>
		  <p>{error}</p>
		  <Link 
			href="/donationdrive-list" 
			className="mt-2 inline-block text-blue-600 hover:underline"
		  >
			Back to Donation Drives
		  </Link>
		</div>
	  </div>
	);
  }

  if (!donationDrive) {
	return (
	  <div className="container mx-auto px-4 py-8">
		<div className="text-center py-12">
		  <h3 className="text-xl font-medium text-gray-600">Donation drive not found</h3>
		  <Link 
			href="/donationdrive-list" 
			className="mt-2 inline-block text-blue-600 hover:underline"
		  >
			Back to Donation Drives
		  </Link>
		</div>
	  </div>
	);
  }

  return (
	<div className="bg-[#EAEAEA] mx-auto px-10 py-8">
		<Link href="/admin-dashboard/donation-drive" className="text-sm mb-4 inline-flex gap-2 items-center hover:underline">
			<MoveLeft className='size-[17px]'/>
			Back to Donation Drives
		</Link>

		<div className="flex flex-col gap-[20px] md:px-[50px] xl:px-[85px]">
			{/* Title */}
			<div className="flex justify-between items-start">
				<h1 className="text-5xl font-bold text-gray-800">{donationDrive.isEvent && event ? event.title : donationDrive.campaignName}</h1>
				{/* <span className={`px-3 py-1 text-sm rounded-full ${
					donationDrive.status === 'active' ? 'bg-green-100 text-green-800' :
					donationDrive.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
					donationDrive.status === 'completed' ? 'bg-blue-100 text-blue-800' :
					donationDrive.status === 'rejected' ? 'bg-red-100 text-red-800' :
					'bg-gray-100 text-gray-800'  
				}`}> */}
				<span className={`px-3 py-1 text-sm rounded-full ${
					donationDrive.status === 'active' ? 'bg-green-100 text-green-800' :
					donationDrive.status === 'completed' ? 'bg-blue-100 text-blue-800' :
					'bg-gray-100 text-gray-800'  
				}`}>
					{donationDrive.status.charAt(0).toUpperCase() + donationDrive.status.slice(1)}
				</span>
				{/* <BookmarkButton entryId={donationDrive.donationDriveId} type="donationdrive" size="lg" /> */}
			</div>

			{/* Event Body */}
			<div className='flex flex-col xl:flex-row xl:gap-10 w-full'>
				{/* Body */}
				<div className='flex flex-col gap-[10px] w-full'>
					{/* Image */}
					<div className="bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
					{donationDrive.isEvent && event && (
							<div className="absolute top-4 right-4 flex space-x-2">
								<span className={`px-3 py-1 text-sm rounded-full ${
									event.status === 'active' ? 'bg-green-100 text-green-800' : 
									event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
									event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
									'bg-gray-100 text-gray-800'
								}`}>
									{event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || "N/A"}
								</span>
								<span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">Event</span>
							</div>
					)}
					{/* Event details */}
					{donationDrive.isEvent && event && (
						<div className='mt-5 px-5'>
							<div className=' flex justify-between items-center gap-4'>
								<div className='flex gap-1 items-center justify-center'>
									<Calendar className='size-[20px]' />
									<p className='text-sm'>{formatDate(event.datePosted)}</p>
								</div>
								<div className='flex gap-1 items-center justify-center'>
									<Clock className='size-[20px]' />
									<p className='text-sm'>{event.time}</p>
								</div>
								<div className='flex gap-1 items-center justify-center'>
									<MapPin className='size-[20px]' />
									<p className='text-sm'>{event.location}</p>
								</div>
								<div className='flex gap-1 items-center justify-center'>
									<Users className='size-[20px]' />
									<p className='text-sm'>{event.numofAttendees || 0} attendees</p>
								</div>
							</div>
						</div>
					)}
					{/* Event description */}
					<p className="mb-6">{donationDrive.isEvent && event ? event.description : donationDrive.description}</p>
					{/* Event Detaisl */}
					<div className="grid lg:grid-cols-2 gap-6 mb-6">
						{/* Creator Details */}
						{/* <div>
							<h3 className="font-semibold text-gray-700 mb-2">Creator Information</h3>
							<p className="text-gray-600">
								<span className="font-medium">Name:</span> {sponsorship.creatorName || 'N/A'}
							</p>
							<p className="text-gray-600">
								<span className="font-medium">Type:</span> {sponsorship.creatorType || 'N/A'}
							</p>
						</div> */}
						{/* Campaign Details */}
						<div>
							<h3 className="font-semibold text-gray-700 mb-2">Campaign Details</h3>
							<p className="text-gray-600">
								<span className="font-medium">Start:</span> {formatDate(donationDrive.startDate)}
							</p>
							<p className="text-gray-600">
								<span className="font-medium">End:</span> {formatDate(donationDrive.endDate)}
							</p>
							<p className="text-gray-600">
								<span className="font-medium">Date Posted:</span> {formatDate(donationDrive.datePosted)} 
								<span className="text-gray-400 text-sm ml-2">({formatTimeAgo(donationDrive.datePosted)})</span>
							</p>

						</div>
						{/* Beneficiary Details */}
						<div>
							<h3 className="font-semibold text-gray-700 mb-2">Beneficiary Information</h3>
							<p className="text-gray-600">
								<span className="font-medium">Beneficiaries:</span> {donationDrive.beneficiary?.join(', ') || 'N/A'}
							</p>
							<p className="text-gray-600">
								<span className="font-medium">Event Related:</span> {donationDrive.isEvent ? 'Yes' : 'No'}
							</p>
							{donationDrive.isEvent && (
								<p className="text-gray-600">
								<span className="font-medium">Event ID:</span> {donationDrive.eventId || 'N/A'}
								</p>
							)}
						</div>
					</div>
					<div>
						{/* Target guests */}
						{event?.targetGuests && event.targetGuests.length > 0 && (
							<div>
							<p className="text-sm text-gray-600 mb-2">Target audience:</p>
							<div className="flex flex-wrap gap-2">
								{event.targetGuests.map((guest, index) => (
								<span 
									key={index} 
									className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
								>
									{guest}
								</span>
								))}
							</div>
							</div>
						)}
					</div>
				</div>
				{/* Action Bar */}
				<div className='min-w-[390px]'>
					{/* Side bar */}
					<div className='flex flex-col gap-[10px] w-full'>
						{/* Invitation Status */}
						{ donationDrive.isEvent && event && (
							<div className='bg-[#FFFF] py-[10px] px-[20px] rounded-[10px] flex justify-between w-full'>
							<div className='w-1/2'>
								<p>Event Status: </p>
							</div>
							<div className='w-full flex'>
								{event?.stillAccepting ? (
									<div className="flex items-center justify-end  text-green-600 font-medium gap-2 w-full">
										Still accepting guests
										<CircleCheck />
									</div>
								) : (
									<div className="flex items-center justify-end  text-red-600 font-medium gap-2 w-full">
										<X />
										Registration closed
									</div>
								)}
							</div>
						</div>
						)}
						{/* Donation Bar */}
						<div className='bg-[#FFFF] py-[30px] px-[20px] rounded-[10px] flex flex-col gap-3'>
							{/* Progress bar */}
							<div className="">
								<div className="flex justify-between mb-1">
									<div className='flex gap-2'>
										<Users className='size-[20px] text-[#616161]'/>
										<span className="text-sm text-gray-500"> {donationDrive.donorList.length ?? '0'} Patrons</span>
									</div>
									<div className='flex gap-2'>
										<Clock className='size-[17px] text-[#616161]'/>
										<span className="text-sm text-gray-500">{getRemainingDays(donationDrive.endDate)}</span>
									</div>
								</div>
								<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
									<div 
										className="h-full bg-blue-500 rounded-full" 
										style={{ width: `${calculateProgress(donationDrive.currentAmount, donationDrive.targetAmount)}%` }}
									></div>
								</div>
								<div className="flex justify-between my-1 text-sm">
									<span className="font-medium">₱ {donationDrive.currentAmount.toLocaleString()}</span>
									<span className="text-gray-500"> ₱ {donationDrive.targetAmount.toLocaleString()}</span>
								</div>
							</div>
							{donationDrive.donorList.length > 0 && recentDonation && highestDonation &&(
								<>
									{/* Recent Donation */}
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<HandHeart className='size-[17px]' />
											<div>
												<p className='text-sm'>
													{recentDonation.isAnonymous ? 'Anonymous' : recentDonation.displayName || 'Unknown'}
												</p>
												<p className='text-xs'>
													₱{recentDonation.amount?.toLocaleString() || '0'}
												</p>
											</div>
										</div>
										<div>
											<p className='text-xs'>Recent Donation</p>
										</div>
									</div>

									{/* Top Donation */}
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<HandHeart className='size-[17px]' />
											<div>
												<p className='text-sm'>
													{highestDonation.isAnonymous ? 'Anonymous' : highestDonation.displayName || 'Unknown'}
												</p>
												<p className='text-xs'>
													₱{highestDonation.amount?.toLocaleString() || '0'}
												</p>
											</div>
										</div>
										<div>
											<p className='text-xs'>Major Donation</p>
										</div>
									</div>
								</>
							)}
							{/* Buttons */}
							<div className='flex gap-[10px] w-full'>
								{/* <div className='w-full'> 
									<DonateDialog drive={donationDrive} onDonationSuccess={handleDonationSuccess}/> 
								</div> */}
								<button className='text-sm bg-[#FFFF] w-full px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:bg-gray-100 hover:cursor-pointer'
									onClick={() => setShowDonors(true)}> 
									View All Donations
								</button>
							</div>
						</div>
					</div>
					{/* {isThankYouOpen && (<ThankYouDialog />)} */}
					{/* Donors */}
					{showDonors && (
						<div className="bg-[#FFFF] py-[30px] px-[30px] rounded-[10px] mt-3">
							<div className='flex justify-between items-start'>
								<h3 className="font-semibold text-l mb-4">Donation History</h3>
								<button onClick={() => setShowDonors(false)}>
									<X className='size-[17px] hover:cursor-pointer hover:text-gray-600'/>
								</button>
							</div>
							<div className="bg-gray-50 rounded-lg">
								{donationsLoading ? (
									<div className="flex justify-center py-4">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
									</div>
								) : donations.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-100">
												<tr>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Donor
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Amount
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Date
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{donations.map((donation) => (
													<tr key={donation.donationId} className="hover:bg-gray-50">
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
															{donation.isAnonymous ? 'Anonymous' : donation.displayName || 'Unknown'}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
															${donation.amount?.toLocaleString() || '0'}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
															{formatDate(donation.date)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<p className="text-gray-500 py-4 text-center">No donations have been made for this sponsorship yet.</p>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>    
	</div>
  );
};

export default DonationDriveDetailsPage;