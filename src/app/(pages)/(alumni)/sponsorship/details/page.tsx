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
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/sponsorship" 
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
        Back to Sponsorships
      </Link>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{sponsorship.campaignName}</h1>
            <span className={`px-3 py-1 text-sm rounded-full ${
              sponsorship.status === 'active' ? 'bg-green-100 text-green-800' :
              sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              sponsorship.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{sponsorship.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Funding Progress</h3>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                style={{ width: `${calculateProgress(sponsorship.currentAmount, sponsorship.targetAmount)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="font-medium">
                ${sponsorship.currentAmount?.toLocaleString() ?? '0'}
              </span>
              <span className="text-gray-500">
                of ${sponsorship.targetAmount?.toLocaleString() ?? '0'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Creator Information</h3>
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {sponsorship.creatorName || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Type:</span> {sponsorship.creatorType || 'N/A'}
              </p>
            </div>

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
                            ${donation.amount?.toLocaleString() || '0'}
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
                </div>
              ) : (
                <p className="text-gray-500 py-4 text-center">No donations have been made for this sponsorship yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipDetailsPage;