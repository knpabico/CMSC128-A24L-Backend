// donationdrive-list/event-related/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import DonationDriveSidebar from '../components/Sidebar';
import DonationDrivesList from '../components/DonationDrivesList';
import { DonationDrive } from '@/models/models';

export default function EventRelatedDrivesPage() {
  const { donationDrives, events, isLoading } = useDonationDrives();
  const [eventDrives, setEventDrives] = useState<DonationDrive[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');

  useEffect(() => {
    if (donationDrives.length > 0) {
      // Filter for event-related drives
      const eventRelated = donationDrives.filter((drive: { isEvent: boolean; }) => drive.isEvent);
      
      // Apply sorting
      const sorted = [...eventRelated].sort((a, b) => {
        switch (sortOption) {
          case 'newest':
            const dateA = a.datePosted?.toDate?.() || new Date(0);
            const dateB = b.datePosted?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          case 'oldest':
            const dateA2 = a.datePosted?.toDate?.() || new Date(0);
            const dateB2 = b.datePosted?.toDate?.() || new Date(0);
            return dateA2.getTime() - dateB2.getTime();
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
      
      setEventDrives(sorted);
    } else {
      setEventDrives([]);
    }
  }, [donationDrives, sortOption]);

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
            <h2 className="text-xl font-semibold">Event Related Drives</h2>
            
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
          </div>
          
          <DonationDrivesList 
            drives={eventDrives}
            events={events}
            isLoading={isLoading}
            emptyMessage="No event-related donation drives have been created yet."
          />
        </div>
      </div>
    </div>
  );
}