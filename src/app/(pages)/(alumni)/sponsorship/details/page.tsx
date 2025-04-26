"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSponsorships } from '@/context/SponsorshipContext';
import { useDonationContext } from '@/context/DonationContext';
import { useAuth } from '@/context/AuthContext';
import { Sponsorship, Donation } from '@/models/models';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { MoveLeft, Users, Clock, HandHeart, Calendar, MapPin, X } from 'lucide-react';

const SponsorshipDetailsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sponsorshipId = searchParams.get('id');
  const { getSponsorshipById } = useSponsorships();
  const { getDonationsBySponsorship } = useDonationContext();
  const [sponsorship, setSponsorship] = useState<Sponsorship | null>(null);
  const [donations, setDonations] = useState<(Donation & { displayName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonors, setShowDonors] = useState(false);

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

	//Calculate Days Remaining
  const getRemainingDays = (startDate: any, endDate: any) => {
    try {
        const start = startDate.toDate();
        const end = endDate.toDate();
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		if (diffDays <= 0) return "Expired";
		else if (diffDays == 1) return "1 day";
		else return `${diffDays} days left`;
    } catch (err) {
        return 'Invalid Date';
    }
  };

  // Calculate progress percentage with type safety
  const calculateProgress = (current: number, target: number): string => {
    if (target <= 0 || isNaN(target) || isNaN(current)) return '0';
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  useEffect(() => {
    if (!sponsorshipId) {
      setError('No sponsorship ID provided');
      setLoading(false);
      return;
    }

    const fetchSponsorship = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getSponsorshipById(sponsorshipId);
        if (!data) {
          throw new Error('Sponsorship not found');
        }
        setSponsorship(data);
      } catch (err) {
        console.error('Error fetching sponsorship:', err);
        setError(err instanceof Error ? err.message : 'Failed to load sponsorship details');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsorship();
  }, [sponsorshipId, getSponsorshipById]);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!sponsorshipId) return;
      
      try {
        setDonationsLoading(true);
        const donationsData = await getDonationsBySponsorship(sponsorshipId);
        
        // Fetch alumni details for non-anonymous donations
        const enhancedDonations = await Promise.all(
          donationsData.map(async (donation) => {
            // Skip fetching details for anonymous donations
            if (donation.isAnonymous) {
              return { ...donation, displayName: 'Anonymous' };
            }
            
            try {
              // Fetch alumni details from Firestore
              const alumniRef = doc(db, "alumni", donation.alumniId);
              const alumniSnap = await getDoc(alumniRef);
              
              if (alumniSnap.exists()) {
                const alumniData = alumniSnap.data();
                return { 
                  ...donation, 
                  displayName: `${alumniData.firstName || ''} ${alumniData.lastName || ''}`.trim() || 'Unknown'
                };
              } else {
                return { ...donation, displayName: 'Unknown' };
              }
            } catch (error) {
              console.error(`Error fetching alumni info for ${donation.alumniId}:`, error);
              return { ...donation, displayName: 'Unknown' };
            }
          })
        );
        
        setDonations(enhancedDonations);
      } catch (err) {
        console.error('Error fetching donations:', err);
        // We don't set the main error state here to avoid blocking the whole view
      } finally {
        setDonationsLoading(false);
      }
    };

    fetchDonations();
  }, [sponsorshipId, getDonationsBySponsorship]);

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
            href="/sponsorship" 
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Back to Sponsorships
          </Link>
        </div>
      </div>
    );
  }

  if (!sponsorship) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">Sponsorship not found</h3>
          <Link 
            href="/sponsorship" 
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Back to Sponsorships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEAEA] mx-auto px-10 py-8">
		<Link href="/sponsorship" className="text-sm mb-4 inline-flex gap-2 items-center hover:underline">
			<MoveLeft className='size-[17px]'/>
			Back to Sponsorships
		</Link>

		<div className="flex flex-col gap-[20px] md:px-[70px] lg:px-[100px] xl:px-[100px]">
			{/* Title */}
			<div className="flex justify-between items-start">
				<h1 className="text-5xl font-bold text-gray-800">{sponsorship.campaignName}</h1>
				{/* <span className={`px-3 py-1 text-sm rounded-full ${
					sponsorship.status === 'active' ? 'bg-green-100 text-green-800' :
					sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
					sponsorship.status === 'completed' ? 'bg-blue-100 text-blue-800' :
					'bg-gray-100 text-gray-800'
				}`}>
					{sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
				</span> */}
			</div>

			{/* Event Body */}
			<div className='flex flex-col xl:flex-row xl:gap-10'>
				{/* Body */}
				<div className='flex flex-col gap-[10px]'>
					{/* Image */}
					<div className="bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
					{/* Event details */}
					<div className='flex justify-between items-center mt-[30px]'>
						<div className='flex gap-[10px] content-center'>
							<Calendar className='size-[17px]'/>
							<p className='text-sm'>Event date</p>
						</div>
						<div className='flex gap-[10px] content-center'>
							<Clock className='size-[17px]'/>
							<p className='text-sm'>Event time</p>
						</div>
						<div className='flex gap-[10px] content-center'>
							<MapPin className='size-[17px]'/>
							<p className='text-sm'>Event Location</p>
						</div>
					</div>
					<p className="mb-6">{sponsorship.description}</p>
					<div className="grid grid-cols-2 gap-6 mb-6">
						{/* Creator Details */}
						<div>
							<h3 className="font-semibold text-gray-700 mb-2">Creator Information</h3>
							<p className="text-gray-600">
								<span className="font-medium">Name:</span> {sponsorship.creatorName || 'N/A'}
							</p>
							<p className="text-gray-600">
								<span className="font-medium">Type:</span> {sponsorship.creatorType || 'N/A'}
							</p>
						</div>
						{/* Campaign Details */}
						<div>
							<h3 className="font-semibold text-gray-700 mb-2">Campaign Dates</h3>
							<p className="text-gray-600">
								<span className="font-medium">Start:</span> {formatDate(sponsorship.startDate)}
							</p>
							<p className="text-gray-600">
								<span className="font-medium">End:</span> {formatDate(sponsorship.endDate)}
							</p>
							<p className="text-gray-600">
								<span className="font-medium">Status:</span> {sponsorship.isAcceptingtrue ? 'Accepting sponsors' : 'Not accepting'}
							</p>
						</div>
					</div>
				</div>
				{/* Action Bar */}
				<div className='xl:w-[450px]'>
					{/* Side bar */}
					<div className='flex flex-col gap-[10px]'>
						{/* Invitation Status */}
						<div className='bg-[#FFFF] py-[10px] px-[30px] rounded-[10px]'>
							<p>Invitation Status: </p>
						</div>
						{/* Donation Bar */}
						<div className='bg-[#FFFF] py-[30px] px-[30px] rounded-[10px] flex flex-col gap-3'>
							{/* Progress bar */}
							<div className="">
								<div className="flex justify-between mb-1">
									<div className='flex gap-2'>
										<Users className='size-[20px] text-[#616161]'/>
										<span className="text-sm text-gray-500">Patrons</span>
									</div>
									<div className='flex gap-2'>
										<Clock className='size-[17px] text-[#616161]'/>
										<span className="text-sm text-gray-500">{getRemainingDays(sponsorship.startDate, sponsorship.endDate)}</span>
									</div>
								</div>
								<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
									<div 
										className="h-full bg-blue-500 rounded-full" 
										style={{ width: `${calculateProgress(sponsorship.currentAmount, sponsorship.targetAmount)}%` }}
									></div>
								</div>
								<div className="flex justify-between my-1 text-sm">
									<span className="font-medium">${sponsorship.currentAmount.toLocaleString()}</span>
									<span className="text-gray-500">of ${sponsorship.targetAmount.toLocaleString()}</span>
								</div>
							</div>
							{/* Recent Donation */}
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<HandHeart className='size[17px]' />
									<div>
										<p className='text-sm'>Alum Name</p>
										<p className='text-xs'>Amount</p>
									</div>
								</div>
								<div>
									<p className='text-xs'>Recent Donation</p>
								</div>
							</div>
							{/* Top Donation */}
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<HandHeart className='size[17px]' />
									<div>
										<p className='text-sm'>Alum Name</p>
										<p className='text-xs'>Amount</p>
									</div>
								</div>
								<div>
									<p className='text-xs'>Major Donation</p>
								</div>
							</div>
							{/* Buttons */}
							<div className='flex gap-[10px] w-full'>
								<button className='text-sm bg-[#0856BA] w-full px-1 py-[5px] rounded-full text-white font-semibold hover:bg-[#0855baa2]'> Donate </button>
								<button className='text-sm bg-[#FFFF] w-full px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:bg-accent'
									onClick={() => setShowDonors(true)}> 
									View All Donations
								</button>
							</div>
						</div>
					</div>
					{/* Donors */}
					{showDonors && (
						<div className="bg-[#FFFF] py-[30px] px-[30px] rounded-[10px] mt-3">
							<div className='flex justify-between items-start'>
								<h3 className="font-semibold text-l mb-4">Donation History</h3>
								<button onClick={() => setShowDonors(false)}>
									<X className='size-[17px]'/>
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

export default SponsorshipDetailsPage;