// donationdrive-list/saved/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { useAuth } from '@/context/AuthContext';
import { useBookmarks } from '@/context/BookmarkContext';
import DonationDriveSidebar from '../components/Sidebar';
import DonationDrivesList from '../components/DonationDrivesList';
import { DonationDrive } from '@/models/models';
import Banner from '@/components/Banner';

export default function SavedDrivesPage() {
  const { donationDrives, events, isLoading } = useDonationDrives();
  const { user, alumInfo } = useAuth();
  const { bookmarks, entries, isLoading: isLoadingBookmarks } = useBookmarks();
  const [savedDrives, setSavedDrives] = useState<DonationDrive[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [statusOption, setStatusOption] = useState<string>('all');

  // Filter donation drives based on bookmarks
  useEffect(() => {
    if (donationDrives.length > 0 && bookmarks.length > 0 && user) {
      // Get donation drive bookmarks
      const donationDriveBookmarks = bookmarks.filter(bookmark => 
        bookmark.type === "donation_drive" &&
		bookmark.alumniId === alumInfo?.alumniId
      );
      
      // Get saved donation drive IDs
      const savedDriveIds = donationDriveBookmarks.map(bookmark => bookmark.entryId);
      
      // Filter for saved drives
      const filteredDrives = donationDrives.filter(
		(drive: { donationDriveId: string; status: string;}) => (
			statusOption ==="all"? drive.status === 'active' || drive.status === 'completed':drive.status === statusOption &&
			savedDriveIds.includes(drive.donationDriveId)
		)
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
  }, [donationDrives, bookmarks, sortOption, statusOption]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleStatusSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
	setStatusOption(e.target.value);
  };

  return (
	<div className="bg-[#EAEAEA]">
		{/*Page Title*/}
		<Banner 
			title="Donation Drives" 
			description="Support meaningful causes through ICS and alumni donation drives, helping create opportunities and making a lasting impact."
		/>
		{/* Body */}
		<div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[50px] xl:mx-[200px] static'>
			{/* Sidebar */}
			<div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7'>
				<DonationDriveSidebar />
			</div>
			{/* Main content */}
			<div className='flex flex-col gap-[10px] w-full mb-10'>
				{/* Filter tabs */}
				<div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center shadow-md border border-gray-200">
					<h2 className="text-lg font-semibold">Saved Drives</h2>
					<div className="flex justify-between items-center gap-2">
						<div className="flex items-center">
							<label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
							<select id="sort" value={statusOption} onChange={handleStatusSortChange} className="flex items-center text-sm" >
								<option value="all">All</option>
								<option value="active">Active</option>
								<option value="completed">Closed </option>
							</select>
						</div>
						<div>|</div>
						<div className="flex items-center">
							<label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
							<select id="sort" value={sortOption} onChange={handleSortChange} className="flex items-center text-sm" >
								<option value="newest">Newest</option>
								<option value="oldest">Oldest</option>
								<option value="amount-high">Amount (High to Low)</option>
								<option value="amount-low">Amount (Low to High)</option>
								<option value="progress">Progress</option>
							</select>
						</div>						
					</div>
				</div>
				{savedDrives.length > 0 ? (
					// Donation Cards
					<DonationDrivesList 
						drives={savedDrives}
						events={events}
						isLoading={isLoading}
						emptyMessage="You haven't saved any donation drives yet."
					/>
				) : (
					<div className="text-center py-12 bg-gray-50 rounded-lg w-full shadow-md border border-gray-200">
						<h3 className="text-xl font-medium text-gray-600">No donation drive found</h3>
						<p className="text-gray-500 mt-2">There are no donation drive with the selected filter.</p>
					</div>
				)}
			</div>
		</div>
	</div>
	);
}