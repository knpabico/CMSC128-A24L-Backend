// donationdrive-list/event-related/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import DonationDriveSidebar from '../components/Sidebar';
import DonationDrivesList from '../components/DonationDrivesList';
import { DonationDrive } from '@/models/models';
import Banner from '@/components/Banner';

export default function EventRelatedDrivesPage() {
  const { donationDrives, events, isLoading } = useDonationDrives();
  const [eventDrives, setEventDrives] = useState<DonationDrive[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [statusOption, setStatusOption] = useState<string>('all');

  useEffect(() => {
    if (donationDrives.length > 0) {
      // Filter for event-related drives
      const eventRelated = donationDrives.filter((drive: { isEvent: boolean; }) => drive.isEvent);
	//   Filter active and completed 
	  const filteredDrives = eventRelated.filter(
		(drive: { status: string }) => (statusOption ==="all"? drive.status === 'active' || drive.status === 'completed':drive.status === statusOption));
      
      // Apply sorting
      const sorted = [...filteredDrives].sort((a, b) => {
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
  }, [donationDrives, sortOption, statusOption]);

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
					<h2 className="text-lg font-semibold">Event Related Drives</h2>
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
				{eventDrives.length > 0 ? (
					// Donation Cards
					<DonationDrivesList 
						drives={eventDrives}
						events={events}
						isLoading={isLoading}
						emptyMessage="No event-related donation have been created yet."
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