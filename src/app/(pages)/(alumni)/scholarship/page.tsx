"use client";

import React from 'react';
import { useScholarship } from '@/context/ScholarshipContext';
import BookmarkButton from "@/components/ui/bookmark-button";
import { CalendarDays, Bookmark, HandHeart, BookOpen } from "lucide-react"
import { Scholarship } from '@/models/models';
import { useBookmarks } from '@/context/BookmarkContext';

const ScholarshipPage: React.FC = () => {
  const { scholarships, loading, error } = useScholarship();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const handleToggleBookmark = async (scholarshipId: string) => {
    await toggleBookmark(scholarshipId, 'scholarship');
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className='bg-[#EAEAEA] h-full'>
		{/*Page Title*/}
		<div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
			<div className="absolute inset-0 bg-blue-500/50" />
			<div className="relative z-10">
				<h1 className="text-5xl font-bold my-2 text-white">Scholarships</h1>
				<p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
			</div>
		</div>

		{/* Tabs */}
		<div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[100px] xl:mx-[200px]'>
			<div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max'>
				<button className="flex gap-5 items-center bg-blue-100">
					<CalendarDays />
					<p className="group relative w-max">
						<span>All Scholarship</span>
						<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
					</p>
				</button>
				<button className='flex gap-5 items-center'>
					<Bookmark />
					<p className="group relative w-max">
						<span>Saved Scholarships</span>
						<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
					</p>
				</button>
				<button className='flex gap-5 items-center'>
					<HandHeart />
					<p className="group relative w-max">
						<span>My Scholars</span>
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
			</div>

			<div className='flex flex-col gap-[10px] w-full mb-10'>
				{/* Scholarships List */}
				{scholarships.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						No scholarships available.
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{scholarships.map((scholarship) => (
						<div key={scholarship.scholarshipId} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
						<div className="p-6">
							<div className="flex justify-between items-start mb-2">
							<h2 className="text-xl font-semibold">{scholarship.title}</h2>
							<div onClick={() => handleToggleBookmark(scholarship.scholarshipId)}>
								<BookmarkButton 
									entryId={scholarship.scholarshipId}  
									type="scholarship" 
									size="lg"
									isBookmarked={isBookmarked(scholarship.scholarshipId)}
								/>
							</div>
							</div>
							
							<p className="text-sm text-gray-500 mb-4">
							Posted on {scholarship.datePosted.toLocaleString()}
							</p>
							
							<p className="text-gray-700 mb-4">
							{scholarship.description}
							</p>
							
							<div className="flex items-center text-sm text-gray-600 mt-4">
							<span className="mr-2">Recipients:</span>
							<span className="font-medium">{scholarship.alumList.length}</span>
							</div>
							
							{scholarship.alumList.length > 0 && (
							<div className="mt-4 pt-4 border-t border-gray-200">
								<h3 className="text-sm font-medium text-gray-700 mb-2">Alumni Recipients</h3>
								<div className="flex flex-wrap gap-1">
								{scholarship.alumList.map((alumId, index) => (
									<span key={alumId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									Recipient {index + 1}
									</span>
								))}
								</div>
							</div>
							)}
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

export default ScholarshipPage;