"use client";

import React, { useState, useEffect } from 'react';
import { useSponsorships } from '@/context/SponsorshipContext';
import { Sponsorship } from '@/models/models';
import { useRouter } from 'next/navigation';


const SponsorshipPage: React.FC = () => {
  const router = useRouter();
  const { sponsorships, loading, error, refreshSponsorships } = useSponsorships();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filteredSponsorships, setFilteredSponsorships] = useState<Sponsorship[]>([]);

  // Handle view details click
  const handleViewDetails = (sponsorshipId: string) => {
    router.push(`/sponsorship/details?id=${sponsorshipId}`);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Format time ago (simple implementation without date-fns)
  const formatTimeAgo = (timestamp: any) => {
    try {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      // Less than a minute
      if (diffInSeconds < 60) {
        return 'just now';
      }
      
      // Less than an hour
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      
      // Less than a day
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      
      // Less than a month (approx)
      if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
      
      // Less than a year
      if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      }
      
      // More than a year
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } catch (err) {
      return '';
    }
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  // Filter sponsorships
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredSponsorships(sponsorships);
    } else {
      setFilteredSponsorships(sponsorships.filter((s: { status: string; }) => s.status === activeFilter));
    }
  }, [sponsorships, activeFilter]);

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
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
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <h2 className="font-bold text-lg">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => refreshSponsorships()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sponsorships</h1>
      
      {/* Filter tabs */}
      <div className="flex mb-6 border-b">
        <button 
          className={`px-4 py-2 mr-2 ${activeFilter === 'all' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
          onClick={() => handleFilterChange('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeFilter === 'active' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
          onClick={() => handleFilterChange('active')}
        >
          Active
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeFilter === 'pending' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
          onClick={() => handleFilterChange('pending')}
        >
          Pending
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeFilter === 'completed' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
          onClick={() => handleFilterChange('completed')}
        >
          Completed
        </button>
      </div>
      
      {filteredSponsorships.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600">No sponsorships found</h3>
          <p className="text-gray-500 mt-2">There are no sponsorships with the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsorships.map((sponsorship) => (
            <div 
              key={sponsorship.sponsorshipId} 
              className="..."
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-800 truncate">{sponsorship.campaignName}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sponsorship.status === 'active' ? 'bg-green-100 text-green-800' :
                    sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    sponsorship.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-2">
                  By <span className="font-medium">{sponsorship.creatorName}</span> · {sponsorship.creatorType}
                </p>
                
                <p className="text-gray-600 mb-4 line-clamp-3 h-16">{sponsorship.description}</p>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${calculateProgress(sponsorship.currentAmount, sponsorship.targetAmount)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="font-medium">${sponsorship.currentAmount.toLocaleString()}</span>
                    <span className="text-gray-500">of ${sponsorship.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-4">
                  <div>
                    <p>Start: {formatDate(sponsorship.startDate)}</p>
                    <p>End: {formatDate(sponsorship.endDate)}</p>
                  </div>
                  <div className="text-right">
                    <p>{sponsorship.isAcceptingtrue ? 'Accepting sponsors' : 'Not accepting'}</p>
                    <p>Suggested {formatTimeAgo(sponsorship.dateSuggested)}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleViewDetails(sponsorship.sponsorshipId)}
                  className="..."
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorshipPage;