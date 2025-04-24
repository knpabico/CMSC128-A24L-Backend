// donationdrive-list/saved/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { useAuth } from '@/context/AuthContext';
import { useBookmarks } from '@/context/BookmarkContext';
import DonationDriveSidebar from '../components/Sidebar';
import DonationDrivesList from '../components/DonationDrivesList';
import { DonationDrive } from '@/models/models';

export default function SavedDrivesPage() {
  const { donationDrives, events, isLoading } = useDonationDrives();
  const { user } = useAuth();
  const { bookmarks, entries, isLoading: isLoadingBookmarks } = useBookmarks();
  const [savedDrives, setSavedDrives] = useState<DonationDrive[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');

  // Filter donation drives based on bookmarks
  useEffect(() => {
    if (donationDrives.length > 0 && bookmarks.length > 0) {
      // Get donation drive bookmarks
      const donationDriveBookmarks = bookmarks.filter(bookmark => 
        bookmark.type === "donation_drive"
      );
      
      // Get saved donation drive IDs
      const savedDriveIds = donationDriveBookmarks.map(bookmark => bookmark.entryId);
      
      // Filter for saved drives
      const filteredDrives = donationDrives.filter((drive: { donationDriveId: string; }) => 
        savedDriveIds.includes(drive.donationDriveId)
      );
      
      // Apply sorting
      const sorted = [...filteredDrives].sort((a, b) => {
        switch (sortOption) {
          case 'newest':
            return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
          case 'oldest':
            return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
          case 'amount-high':
            return b.currentAmount - a.currentAmount;
          case 'amount-low':
            return a.currentAmount - b.currentAmount;
          case 'progress':
            const progressA = a.currentAmount / a.targetAmount;
            const progressB = b.currentAmount / b.targetAmount;
            return progressB - progressA;
          default:
            return 0;
        }
      });
      
      setSavedDrives(sorted);
    } else {
      setSavedDrives([]);
    }
  }, [donationDrives, bookmarks, sortOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Donation Drives</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <DonationDriveSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Saved Drives</h2>
            
            {user && savedDrives.length > 0 && (
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
                <select 
                  id="sort"
                  value={sortOption} 
                  onChange={handleSortChange}
                  className="text-sm border rounded-md p-1.5"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="amount-high">Amount (High to Low)</option>
                  <option value="amount-low">Amount (Low to High)</option>
                  <option value="progress">Progress</option>
                </select>
              </div>
            )}
          </div>
          
          {!user ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Please log in to view your saved drives.</p>
            </div>
          ) : (
            <DonationDrivesList 
              drives={savedDrives}
              events={events}
              isLoading={isLoading || isLoadingBookmarks}
              emptyMessage="You haven't saved any donation drives yet."
            />
          )}
        </div>
      </div>
    </div>
  );
}