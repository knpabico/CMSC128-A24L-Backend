"use client";

// import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DonationDrive, Event } from '@/models/models';
// import { DonateDialog } from '../DonateDialog';
import BookmarkButton from '@/components/ui/bookmark-button';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { useAuth } from '@/context/AuthContext';

interface DonationDriveCardProps {
  drive: DonationDrive;
  event?: Event;
  showBookmark?: boolean; 
}

const DonationDriveCard = ({ drive, event, showBookmark = false }: DonationDriveCardProps) => {
  const router = useRouter();
  const {user, alumInfo } = useAuth();
  const {
    showForm, 
    setShowForm, 
    handleSave,
    campaignName, 
    setCampaignName,
    description, 
    setDescription,
    targetAmount, 
    setTargetAmount,
    endDate, 
    setEndDate, 
  } = useDonationDrives();

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
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
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  // Handle view details click
  const handleViewDetails = (donationDriveId: string) => {
    router.push(`/donationdrive-list/details?id=${donationDriveId}`);
  };

  // Render the event-related card
  if (drive.isEvent && event) {
    return (
      <div className="border rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
        {/* Event Image */}
        <div className="w-full h-48 relative bg-gray-200">
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-blue-100">
              <span className="text-blue-500 font-medium">Event</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Header: Campaign title and status */}
          <div className="flex justify-between items-start mb-2">
            {/* Campaign Name */}
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                event.status === 'active' ? 'bg-green-100 text-green-800' : 
                event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
                }`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
        </div>
          
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
          
          {/* Event details */}
          <div className="flex items-center justify-between w-full text-sm mb-4">
            {/* Left: Date */}
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.datePosted)}</span>
            </div>

            {/* Center: Time */}
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{event.time}</span>
            </div>

            {/* Right: Location */}
            <div className="flex items-center min-w-0 max-w-[40%] truncate justify-end">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{event.location}</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="mb-3">
              {/* Patrons and Percentage */}
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{drive.donorList.length} patrons</span>
                </div>
                <span>{calculateProgress(drive.currentAmount, drive.targetAmount)}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${calculateProgress(drive.currentAmount, drive.targetAmount)}%` }}
                ></div>
              </div>
              
              {/* Current and Target amount */}
              <div className="flex justify-between mt-2 text-sm">
                <span className="font-medium">₱{drive.currentAmount?.toLocaleString() || '0'}</span>
                <span className="text-gray-500">of ₱{drive.targetAmount?.toLocaleString() || '0'}</span>
              </div>

              {/* Additional info */}
              <div className="flex justify-between text-xs text-gray-500">
                <div>
                  <p>Start: {formatDate(drive.startDate)}</p>
                  <p>End: {formatDate(drive.endDate)}</p>
                </div>
                <div className="text-right">
                  <p>{drive.isEvent ? 'Event-related' : 'General campaign'}</p>
                  <p>Posted {formatTimeAgo(drive.datePosted)}</p>
                </div>
              </div>
            </div>

            {/* View button */}
            <button 
              onClick={() => handleViewDetails(drive.donationDriveId)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
            >
              View Event Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular donation drive card (non-event)
  return (
    <div className="border rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      <div className="w-full h-48 relative bg-gray-200">
          {drive.image ? (
            <img 
              src={drive.image} 
              alt={drive.campaignName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-blue-100">
              <span className="text-blue-500 font-medium">Drive</span>
            </div>
          )}
        
      </div>
    {/* Content */}
    <div className="p-4 flex-1 flex flex-col">
      {/* Header: Campaign title and status */}
      <div className="flex justify-between items-start mb-2">
          {/* Campaign Name */}
          <h3 className="font-semibold text-lg">{drive.campaignName}</h3>
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs rounded-full ${
            drive.status === 'active' ? 'bg-green-100 text-green-800' : 
            drive.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            drive.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
            }`}>
            {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
            </span>
          </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drive.description}</p>

      <div className="mt-auto">
            <div className="mb-3">
              {/* Patrons and Percentage */}
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{drive.donorList.length} patrons</span>
                </div>
                <span>{calculateProgress(drive.currentAmount, drive.targetAmount)}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${calculateProgress(drive.currentAmount, drive.targetAmount)}%` }}
                ></div>
              </div>
              
              {/* Current and Target amount */}
              <div className="flex justify-between mt-2 text-sm">
                <span className="font-medium">₱{drive.currentAmount?.toLocaleString() || '0'}</span>
                <span className="text-gray-500">of ₱{drive.targetAmount?.toLocaleString() || '0'}</span>
              </div>

              {/* Additional info */}
              <div className="flex justify-between text-xs text-gray-500">
                <div>
                  <p>Start: {formatDate(drive.startDate)}</p>
                  <p>End: {formatDate(drive.endDate)}</p>
                </div>
                <div className="text-right">
                  <p>{drive.isEvent ? 'Event-related' : 'General campaign'}</p>
                  <p>Posted {formatTimeAgo(drive.datePosted)}</p>
                </div>
              </div>
            </div>

            {/* View button */}
            <button 
            onClick={() => handleViewDetails(drive.donationDriveId)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
            >
            View Details
            </button>

            {/* Floating Action Button (FAB) */}
            <button
                className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full shadow-md hover:bg-blue-600 transition"
                onClick={() => setShowForm(true)}
            >
                +
            </button>
        </div>
      </div>

      {/* Suggest Donation Drive Modal */}
      {showForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
            <form
              onSubmit={handleSave}
              className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-30"
            >
              <h2 className="text-xl bold mb-4">Suggest Donation Drive</h2>
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
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-[#0856BA] text-white p-2 rounded-[22px]"
                  >
                    Suggest
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
    </div>
  );
};

export default DonationDriveCard;