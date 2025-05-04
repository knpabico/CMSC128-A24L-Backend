"use client";

import React, { useState, useEffect } from 'react';
import { useSponsorships } from '@/context/SponsorshipContext';
import { Sponsorship } from '@/models/models';
import { useRouter } from 'next/navigation';
import { CalendarDays, Bookmark, HandHeart, BookOpen, FileText, Calendar, Clock, MapPin, Users, MoveRight} from "lucide-react"


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

  //Calculate Days Remaining
  const getRemainingDays = (startDate: any, endDate: any) => {
    try {
        const start = startDate.toDate();
        const end = endDate.toDate();
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		if (diffDays <= 0) return "Expired";
		else if (diffDays == 1) return "1 day";
		else return `${diffDays} days left`;
    } catch (err) {
        return 'Invalid Date';
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
    <div className="bg-[#EAEAEA]">
			{/*Page Title*/}
			<div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
				<div className="absolute inset-0 bg-blue-500/50" />
				<div className="relative z-10">
					<h1 className="text-3xl font-bold my-2 text-white">Donations</h1>
					<p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
				</div>
			</div>
			{/*Tabs*/}
			<div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[100px] xl:mx-[200px]'>
				<div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max'>
					<button className="flex gap-5 items-center">
						<CalendarDays />
						<p className="group relative w-max">
							<span>All Events</span>
							<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
						</p>
					</button>
					<button className='flex gap-5 items-center'>
						<Bookmark />
						<p className="group relative w-max">
							<span>Saved Events</span>
							<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
						</p>
					</button>
					<button className='flex gap-5 items-center'>
						<HandHeart />
						<p className="group relative w-max">
							<span>Donations</span>
							<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
						</p>
					</button>
					<button className='flex gap-5 items-center'>
						<BookOpen />
						<p className="group relative w-max">
							<span>Featured Stories</span>
							<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
						</p>
					</button>
					<button className='flex gap-5 items-center'>
						<FileText />
						<p className="group relative w-max">
							<span>Your Proposals</span>
							<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
						</p>
					</button>
				</div>

				<div className='flex flex-col gap-[10px]  w-full mb-10'>
					{/* Filter tabs */}
					<div className="bg-[#FFFFFF] rounded-[10px] flex justify-around">
						<button className="mr-2" onClick={() => handleFilterChange('all')}>
							<p className={`relative px-4 py-2 w-full transition-all ${activeFilter === 'all' ? 'font-semibold  border-b-2 border-blue-500' : 'text-gray-600 group'}`}>
								<span>All</span>
								{activeFilter !== 'all' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
							</p>
						</button>
						<button className="mr-2" onClick={() => handleFilterChange('active')}>
							<p className={`relative px-4 py-2 w-full transition-all ${activeFilter === 'active' ? 'font-semibold  border-b-2 border-blue-500' : 'text-gray-600 group'}`}>
								<span>Active</span>
								{activeFilter !== 'active' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
							</p>
						</button>
						<button className="mr-2" onClick={() => handleFilterChange('pending')}>
							<p className={`relative px-4 py-2 w-full transition-all ${activeFilter === 'pending' ? 'font-semibold  border-b-2 border-blue-500' : 'text-gray-600 group'}`}>
								<span>Pending</span>
								{activeFilter !== 'pending' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
							</p>
						</button>
						<button className="mr-2" onClick={() => handleFilterChange('completed')}>
							<p className={`relative px-4 py-2 w-full transition-all ${activeFilter === 'completed' ? 'font-semibold  border-b-2 border-blue-500' : 'text-gray-600 group'}`}>
								<span>Completed</span>
								{activeFilter !== 'completed' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
							</p>
						</button>
					</div>
					{/*Donation Cards*/}
					{filteredSponsorships.length === 0 ? (
						<div className="text-center py-12 bg-gray-50 rounded-lg w-full">
							<h3 className="text-xl font-medium text-gray-600">No donation drive found</h3>
							<p className="text-gray-500 mt-2">There are no donation drive with the selected filter.</p>
						</div>
					) : (
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
							{filteredSponsorships.map((sponsorship) => (
								<div key={sponsorship.sponsorshipId} className="...">
									<div className=" bg-[#FFFF] rounded-[10px] h-fit">
										{/* Image */}
										<div className="bg-cover bg-center rounded-t-[10px] h-[230px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
										<div className='p-[30px]'>
											{/* Title and Status */}
											<div className="flex justify-between items-start mb-3">
												<h2 className="text-xl font-semibold truncate">{sponsorship.campaignName}</h2>
												<span className={`px-2 py-1 text-sm rounded-full ${
													sponsorship.status === 'active' ? 'bg-green-100 text-green-500' :
													sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-500' :
													sponsorship.status === 'completed' ? 'bg-blue-100 text-blue-500' :
													'bg-gray-100 text-gray-500'
												}`}>
													{sponsorship.status.charAt(0).toUpperCase() + sponsorship.status.slice(1)}
												</span>
											</div>
											{/* Creator name */}
											<p className="text-sm mb-2">
												By <span className="font-medium">{sponsorship.creatorName}</span> · {sponsorship.creatorType}
											</p>
											{/* Description */}
											<p className="mb-5 text-sm h-max">{sponsorship.description}</p>
											{/* Event details */}
											<div className='flex justify-between items-center'>
												<div className='flex gap-[10px] content-center'>
													<Calendar className='size-[17px]'/>
													<p className='text-sm'>Event date</p>
												</div>
												<div className='flex gap-[10px] content-center'>
													<Clock className='size-[17px]'/>
													<p className='text-sm'>Event time</p>
												</div>
												<div className='flex gap-[10px] content-center'>
													<MapPin className='size-[17px]'/>
													<p className='text-sm'>Event Location</p>
												</div>
											</div>
											{/* Progress bar */}
											<div className="my-5">
												<div className="flex justify-between my-1">
													<div className='flex gap-2'>
														<Users className='size-[20px] text-[#616161]'/>
														<span className="text-sm text-gray-500">Patrons</span>
													</div>
													<div className='flex gap-2'>
														<Clock className='size-[17px] text-[#616161]'/>
														<span className="text-sm text-gray-500">{getRemainingDays(sponsorship.startDate, sponsorship.endDate)}</span>
													</div>
												</div>
												<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
													<div 
														className="h-full bg-blue-500 rounded-full" 
														style={{ width: `${calculateProgress(sponsorship.currentAmount, sponsorship.targetAmount)}%` }}
													></div>
												</div>
												<div className="flex justify-between my-1 text-sm">
													<span className="font-medium">${sponsorship.currentAmount.toLocaleString()}</span>
													<span className="text-gray-500">of ${sponsorship.targetAmount.toLocaleString()}</span>
												</div>
											</div>
											
											{/* <div className="flex justify-between text-sm text-gray-500 mt-4">
												<div>
													<p>Start: {formatDate(sponsorship.startDate)}</p>
													<p>End: {formatDate(sponsorship.endDate)}</p>
												</div>
												<div className="text-right">
													<p>{sponsorship.isAcceptingtrue ? 'Accepting sponsors' : 'Not accepting'}</p>
													<p>Suggested {formatTimeAgo(sponsorship.dateSuggested)}</p>
												</div>
											</div> */}

											<button className='flex gap-2 items-center group relative w-max' onClick={() => handleViewDetails(sponsorship.sponsorshipId)}>
												<span className='text-sm'>View Details</span>
												<MoveRight className='size-[17px]'/>
												<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
    </div>
  );
};

export default SponsorshipPage;