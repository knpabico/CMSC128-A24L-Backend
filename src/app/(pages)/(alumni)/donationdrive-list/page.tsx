"use client";

import React, { useState, useEffect } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { DonationDrive } from '@/models/models';
import { useRouter } from 'next/navigation';
import { DonateDialog } from './DonateDialog';
import BookmarkButton from "@/components/ui/bookmark-button";

const DonationDrivePage: React.FC = () => {
  const router = useRouter();
  const { donationDrives, loading, error, refreshDonationDrives } = useDonationDrives();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filteredDonationDrives, setFilteredDonationDrives] = useState<DonationDrive[]>([]);
  const [showBookmarked, setShowBookmarked] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('recentlyPosted');

  // Handle view details click
  const handleViewDetails = (donationDriveId: string) => {
    router.push(`/donationdrive-list/details?id=${donationDriveId}`);
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

  // Filter and sort donation drives
  useEffect(() => {
    let filtered = [...donationDrives];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(d => d.status === activeFilter);
    }
    
    // Apply bookmarked filter
    // if (showBookmarked) {
    //   filtered = filtered.filter(d => {
    //     const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
    //     return bookmarks[`donationdrive-${d.donationDriveId}`];
    //   });
    // }

    // Apply sorting
    switch (sortOption) {
      case 'recentlyPosted':
        filtered.sort((a, b) => {
          const dateA = a.datePosted?.toDate?.() || new Date(0);
          const dateB = b.datePosted?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'oldestFirst':
        filtered.sort((a, b) => {
          const dateA = a.datePosted?.toDate?.() || new Date(0);
          const dateB = b.datePosted?.toDate?.() || new Date(0);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.campaignName.localeCompare(b.campaignName));
        break;
      default:
        break;
    }

    setFilteredDonationDrives(filtered);
  }, [donationDrives, activeFilter, showBookmarked, sortOption]);

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Handle bookmarked toggle
  // const handleBookmarkedToggle = () => {
  //   setShowBookmarked(!showBookmarked);
  // };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
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
          onClick={() => refreshDonationDrives()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Donation Drives</h1>
      
      <div className="flex flex-col md:flex-row md:justify-between mb-6">
        {/* Filter tabs */}
        <div className="flex mb-4 md:mb-0 border-b">
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
          {/* <button 
            className={`px-4 py-2 mr-2 ${showBookmarked ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'}`}
            onClick={handleBookmarkedToggle}
          >
            Bookmarked
          </button> */}
        </div>
        
        {/* Sort dropdown */}
        <div className="flex items-center">
          <label htmlFor="sort-select" className="mr-2 text-gray-700">Sort by:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recentlyPosted">Recently Posted</option>
            <option value="oldestFirst">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>
      
      {filteredDonationDrives.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600">No donation drives found</h3>
          <p className="text-gray-500 mt-2">There are no donation drives with the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonationDrives.map((donationDrive) => (
            <div 
              key={donationDrive.donationDriveId} 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-800 truncate">{donationDrive.campaignName}</h2>
                  <div className="flex items-center space-x-2">
                    <BookmarkButton entryId={donationDrive.donationDriveId} type="donationdrive" size="md" />
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      donationDrive.status === 'active' ? 'bg-green-100 text-green-800' :
                      donationDrive.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      donationDrive.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {donationDrive.status.charAt(0).toUpperCase() + donationDrive.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3 h-16">{donationDrive.description}</p>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${calculateProgress(donationDrive.currentAmount, donationDrive.totalAmount)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="font-medium">${donationDrive.currentAmount}</span>
                    <span className="text-gray-500">of ${donationDrive.totalAmount}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-4">
                  <div>
                    <p>Start: {formatDate(donationDrive.startDate)}</p>
                    <p>End: {formatDate(donationDrive.endDate)}</p>
                  </div>
                  <div className="text-right">
                    <p>{donationDrive.isEvent ? 'Event-related' : 'General campaign'}</p>
                    <p>Posted {formatTimeAgo(donationDrive.datePosted)}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleViewDetails(donationDrive.donationDriveId)}
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
                >
                  View Details
                </button>
                <div className="flex space-x-3 mt-2"> 
                  <DonateDialog drive={donationDrive} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationDrivePage;