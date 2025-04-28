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
import { DonateDialog } from '../DonateDialog';
import BookmarkButton from '@/components/ui/bookmark-button';

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
	<div className="container mx-auto px-4 py-8">
	  {/* <Link 
		href="/donationdrive-list" 
		className="mb-4 inline-flex items-center text-blue-600 hover:underline"
	  >
		<svg 
		  xmlns="http://www.w3.org/2000/svg" 
		  className="h-5 w-5 mr-1" 
		  viewBox="0 0 20 20" 
		  fill="currentColor"
		>
		  <path 
			fillRule="evenodd" 
			d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
			clipRule="evenodd" 
		  />
		</svg>
		Back to Donation Drives
	  </Link> */}

	  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
		{/* Event Image Header for Event-Related Drives */}
		{/* {donationDrive.isEvent && event && (
		  <div className="w-full h-64 relative bg-gray-200">
			{event.image ? (
			  <img 
				src={event.image} 
				alt={event.title} 
				className="w-full h-full object-cover"
			  />
			) : (
			  <div className="flex items-center justify-center h-full bg-blue-100">
				<span className="text-blue-500 font-medium text-xl">{event.title || "Event"}</span>
			  </div>
			)}
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
		  </div>
		)} */}

		{/* <div className="p-6">
		  <div className="flex justify-between items-start mb-4">
			<h1 className="text-2xl font-bold text-gray-800">
			  {donationDrive.isEvent && event ? event.title : donationDrive.campaignName}
			</h1>
			<div className="flex items-center space-x-2">
			  {!donationDrive.isEvent && (
				<span className={`px-3 py-1 text-sm rounded-full ${
				  donationDrive.status === 'active' ? 'bg-green-100 text-green-800' :
				  donationDrive.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
				  donationDrive.status === 'completed' ? 'bg-blue-100 text-blue-800' :
				  'bg-gray-100 text-gray-800'
				}`}>
				  {donationDrive.status.charAt(0).toUpperCase() + donationDrive.status.slice(1)}
				</span>
			  )}
			  <BookmarkButton entryId={donationDrive.donationDriveId} type="donationdrive" size="md" />
			</div>
		  </div> */}

		  {/* <p className="text-gray-600 mb-6">
			{donationDrive.isEvent && event ? event.description : donationDrive.description}
		  </p> */}

		  {/* Event-specific information */}
		  {/* {donationDrive.isEvent && event && (
			<div className="mb-6 bg-blue-50 p-4 rounded-lg">
			  <h3 className="font-semibold text-gray-700 mb-3">Event Details</h3>
			  
			  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<div className="flex items-center">
				  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				  </svg>
				  <span className="text-gray-700">{formatDate(event.datePosted)}</span>
				</div>
				
				<div className="flex items-center">
				  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				  </svg>
				  <span className="text-gray-700">{event.time || 'Time not specified'}</span>
				</div>
				
				<div className="flex items-start md:col-span-2">
				  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				  </svg>
				  <span className="text-gray-700">{event.location || 'Location not specified'}</span>
				</div>
			  </div>
			  
			  <div className="flex flex-wrap justify-between mb-4">
				<div className="flex items-center mb-2 mr-4">
				  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				  </svg>
				  <span className="text-gray-700">{event.numofAttendees || 0} attendees</span>
				</div> */}
				
				{/* {event.stillAccepting ? (
				  <span className="inline-flex items-center text-green-600 font-medium">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Still accepting guests
				  </span>
				) : (
				  <span className="inline-flex items-center text-red-600 font-medium">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Registration closed
				  </span>
				)}
			  </div> */}
			  
			  {/* Target guests */}
			  {event.targetGuests && event.targetGuests.length > 0 && (
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
		  )}

		  {/* <div className="mb-6">
			<h3 className="font-semibold text-gray-700 mb-2">Funding Progress</h3>
			<div className="flex justify-end text-sm font-medium text-gray-700 mb-1">
			  {calculateProgress(donationDrive.currentAmount, donationDrive.targetAmount)}%
			</div>
			<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
			  <div 
				className="h-full bg-blue-500 rounded-full" 
				style={{ width: `${calculateProgress(donationDrive.currentAmount, donationDrive.targetAmount)}%` }}
			  ></div>
			</div>
			<div className="flex justify-between mt-2 text-sm">
			  <span className="font-medium">
				₱{donationDrive.currentAmount?.toLocaleString() ?? '0'}
			  </span>
			  <span className="text-gray-500">
				of ₱{donationDrive.targetAmount?.toLocaleString() ?? '0'}
			  </span>
			</div>
		  </div> */}

		  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
			</div> */}

			{/* <div>
			  <h3 className="font-semibold text-gray-700 mb-2">Campaign Dates</h3>
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
		  </div> */}

		  <div className="mt-8">
			<h3 className="font-semibold text-xl text-gray-700 mb-4">Donation Details</h3>
			<div className="bg-gray-50 p-4 rounded-lg">
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
						<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						  Payment Method
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
							₱{donation.amount?.toLocaleString() || '0'}
						  </td>
						  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
							{formatDate(donation.date)}
						  </td>
						  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
							{donation.paymentMethod || 'N/A'}
						  </td>
						</tr>
					  ))}
					</tbody>
				  </table>
				  <div className="mt-4 mx-auto w-fit">
					<DonateDialog drive={donationDrive} />
				  </div>
				</div>
			  ) : (
				<div className="py-4 text-center space-y-4">
				  <p className="text-gray-500">No donations have been made for this donation drive yet.</p>
				  <DonateDialog drive={donationDrive} />
				</div>
			  )}
			</div>
		  </div>
		</div>
	  </div>
	</div>
  );
};

export default DonationDriveDetailsPage;