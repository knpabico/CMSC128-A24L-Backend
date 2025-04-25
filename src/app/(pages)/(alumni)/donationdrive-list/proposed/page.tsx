// donationdrive-list/proposed/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { useAuth } from '@/context/AuthContext';
import DonationDriveSidebar from '../components/Sidebar';
import DonationDrivesList from '../components/DonationDrivesList';
import { DonationDrive } from '@/models/models';

export default function ProposedDrivesPage() {
  const { donationDrives, events, isLoading } = useDonationDrives();
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
	<div className="bg-[#EAEAEA]">
		{/*Page Title*/}
		<div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
			<div className="absolute inset-0 bg-blue-500/50" />
				<div className="relative z-10">
				<h1 className="text-5xl font-bold my-2 text-white">Donation Drives</h1>
				<p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
			</div>
		</div>
		{/* Body */}
		<div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[50px] xl:mx-[200px]'>
			{/* Sidebar */}
			<div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max'>
				<DonationDriveSidebar />
			</div>
			{/* Main content */}
			<div className='flex flex-col gap-[10px] w-full mb-10'>
				{/* Filter tabs */}
				<div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center">
					<h2 className="text-lg font-semibold">Proposed Drives</h2>
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
				{proposedDrives.length > 0 ? (
					// Donation Cards
					<DonationDrivesList 
						drives={proposedDrives}
						events={events}
						isLoading={isLoading}
						emptyMessage="You haven't saved any donation drives yet."
					/>
				) : (
					<div className="text-center py-12 bg-gray-50 rounded-lg w-full">
						<h3 className="text-xl font-medium text-gray-600">No donation drive found</h3>
						<p className="text-gray-500 mt-2">There are no donation drive with the selected filter.</p>
					</div>
				)}
			</div>
		</div>
	</div>
	);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Donation Drives</h1>
      
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Sidebar */}
//         <div className="w-full md:w-64 shrink-0">
//           <DonationDriveSidebar />
//         </div>
        
//         {/* Main content */}
//         <div className="flex-1">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold">Proposed Drives</h2>
            
//             {proposedDrives.length > 0 && (
//               <div className="flex items-center">
//                 <label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
//                 <select 
//                   id="sort"
//                   value={sortOption} 
//                   onChange={handleSortChange}
//                   className="text-sm border rounded-md p-1.5"
//                 >
//                   <option value="newest">Newest</option>
//                   <option value="oldest">Oldest</option>
//                   <option value="amount-high">Target Amount (High to Low)</option>
//                   <option value="amount-low">Target Amount (Low to High)</option>
//                 </select>
//               </div>
//             )}
//           </div>
          
//           {!user ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500">Only authenticated users can view proposed drives.</p>
//             </div>
//           ) : (
//             <DonationDrivesList 
//               drives={proposedDrives}
//               events={events}
//               isLoading={isLoading}
//               emptyMessage="There are no proposed donation drives at the moment."
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
}