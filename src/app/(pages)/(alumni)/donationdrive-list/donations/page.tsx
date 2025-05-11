"use client";

import { useDonationContext } from "@/context/DonationContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Donation } from "@/models/models";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DonationDriveSidebar from "../components/Sidebar";
import { ProofOfPaymentDialog } from "./ProofOfPaymentDialog";

const sortTypes = [
  "MOST RECENT FIRST",
  "OLDEST DONATION FIRST",
  "AMOUNT DONATED (ASC)",
  "AMOUNT DONATED (DESC)",
]; //sort types
const sortValues = ["mrf", "odf", "asc", "desc"]; //sort values (query params)

const Donations: React.FC = () => {
  const { userDonations: originalDonations, isLoading: contextLoading, error: contextError } = useDonationContext();
  const [userDonations, setUserDonations] = useState<Donation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingAnonymity, setUpdatingAnonymity] = useState<string | null>(null);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});

  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null); 

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
	const uniqueDriveIds = [...new Set(sortedDonations.map(d => d.donationDriveId))];
	
	// Fetch campaign names for all unique donation drives
	uniqueDriveIds.forEach(async (driveId) => {
	  try {
		const driveRef = doc(db, "donation_drive", driveId);
		const driveSnap = await getDoc(driveRef);
		
		if (driveSnap.exists()) {
		  const driveData = driveSnap.data();
		  setCampaignNames(prev => ({
			...prev,
			[driveId]: driveData.campaignName || "Unnamed Campaign"
		  }));
		} else {
		  setCampaignNames(prev => ({
			...prev,
			[driveId]: "Unknown Campaign"
		  }));
		}
	  } catch (error) {
		console.error(`Error fetching campaign name for drive ${driveId}:`, error);
		setCampaignNames(prev => ({
		  ...prev,
		  [driveId]: "Unknown Campaign"
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
		isAnonymous: !currentStatus
	  });
	  
	  // Update local state
	  if (userDonations) {
		const updatedDonations = userDonations.map(donation => 
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
	<div className="bg-[#EAEAEA]">
		{/*Page Title*/}
		<div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
			<div className="absolute inset-0 bg-blue-500/50" />
				<div className="relative z-10">
				<h1 className="text-5xl font-bold my-2 text-white">Donation Drives</h1>
				<p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
			</div>
		</div>
		{/* Body */}
		<div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[50px] xl:mx-[200px] static '>
			{/* Sidebar */}
			<div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7'>
				<DonationDriveSidebar />
			</div>
			{/* Main content */}
			<div className='flex flex-col gap-[10px] w-full mb-10'>
				{/* Sort Tab */}
				<div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center shadow-md border border-gray-200 ">
					<h2 className="text-lg font-semibold">Your Donations</h2>
					<div className="flex items-center">
						<label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
						<select id="sort" defaultValue={getDefaultSort()} onChange={(e) => { handleSortChange(e.target.value); }}>
							{sortTypes.map((sortType, index) => (
								<option key={index} value={sortValues[index]}>{sortType}</option>
							))}
						</select>
					</div>
				</div>
				{displayError && <p className="text-red-500">{displayError}</p>}
				{showLoading && <p>Loading...</p>}

				<div className="bg-[#FFFF] py-[20px] px-[20px] rounded-[10px] mt-3 shadow-md border border-gray-200">
					{userDonations && userDonations.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-100">
									<tr>
										<th scope="col" className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
											Campaign
										</th>
										<th scope="col" className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
											Amount
										</th>
										<th scope="col" className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
											Payment Method
										</th>
										<th scope="col" className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
											Date
										</th>
										<th scope="col" className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
											Anonymous
										</th>
										<th scope="col" className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
											Proof
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{userDonations.map((donation) => (
										<tr key={donation.donationId} className="hover:bg-gray-50">
											<td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-700">
												{campaignNames[donation.donationDriveId] || 'Loading campaign name...'}
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
														<input type="checkbox" checked={donation.isAnonymous} onChange={() => toggleAnonymity(donation.donationId, donation.isAnonymous)} disabled={updatingAnonymity === donation.donationId} className="w-4 h-4" />
														{updatingAnonymity === donation.donationId && (
															<span className="ml-2 text-sm text-gray-500">Updating...</span>
														)}
													</label>
												</div>
											</td>
											<td>
											<button onClick={() => { setSelectedDonationId(donation.donationId); setSelectedImage(donation.imageProof); }} // Adjust with the correct image path
												className="text-blue-500 hover:underline text-sm">
												View Proof
											</button>
												{selectedDonationId === donation.donationId && selectedImage && (
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
					) : (
						<div className="text-center py-12 bg-gray-50 rounded-lg w-full">
							<h3 className="text-xl font-medium text-gray-600">No donations have been made yet. </h3>
							<p className="text-gray-500 mt-2">Waiting for your first donation!</p>
						</div>
					)}
				</div>
			</div>
		</div>
	</div>
	);
}

export default Donations;