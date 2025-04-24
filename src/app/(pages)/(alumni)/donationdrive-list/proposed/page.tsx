// donationdrive-list/proposed/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { useAuth } from '@/context/AuthContext';
import DonationDriveSidebar from '../components/Sidebar';
import DonationDrivesList from '../components/DonationDrivesList';
import { DonationDrive } from '@/models/models';

export default function ProposedDrivesPage() {
  const { donationDrives, isLoading } = useDonationDrives();
  const { user } = useAuth();
  const [proposedDrives, setProposedDrives] = useState<DonationDrive[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');

  useEffect(() => {
    if (donationDrives.length > 0) {
      // Filter for proposed drives
      const pendingDrives = donationDrives.filter((drive: { status: string; }) => drive.status === 'pending');
      
      // Apply sorting
      const sorted = [...pendingDrives].sort((a, b) => {
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
            return b.targetAmount - a.targetAmount;
          case 'amount-low':
            return a.targetAmount - b.targetAmount;
          default:
            return 0;
        }
      });
      
      setProposedDrives(sorted);
    } else {
      setProposedDrives([]);
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
            <h2 className="text-xl font-semibold">Proposed Drives</h2>
            
            {proposedDrives.length > 0 && (
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
                  <option value="amount-high">Target Amount (High to Low)</option>
                  <option value="amount-low">Target Amount (Low to High)</option>
                </select>
              </div>
            )}
          </div>
          
          {!user ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Only authenticated users can view proposed drives.</p>
            </div>
          ) : (
            <DonationDrivesList 
              drives={proposedDrives}
              isLoading={isLoading}
              emptyMessage="There are no proposed donation drives at the moment."
            />
          )}
        </div>
      </div>
    </div>
  );
}