"use client";

import React, { useState, useEffect } from 'react';
// import { format } from 'date-fns';
import { useScholarship, Scholarship } from '@/context/ScholarshipContext';
import BookmarkButton from "@/components/ui/bookmark-button";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Bookmark, HandHeart, BookOpen, FileText, Calendar, Clock, MapPin, Users, MoveRight} from "lucide-react"


const ScholarshipPage: React.FC = () => {
  const { scholarships, loading, error } = useScholarship();
  const { user } = useAuth(); // Assuming you have an auth context

  // Local state for filtering and sorting
  const [filterType, setFilterType] = useState<'all' | 'bookmarked' | 'scholars' | 'stories'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);

  // Fetch user's bookmarked scholarships
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user?.uid) {
        setBookmarkedIds([]);
        return;
      }
      try {
        const bookmarksRef = collection(db, 'bookmarks');
        const q = query(
          bookmarksRef, 
          where('userId', '==', user.uid),
          where('type', '==', 'scholarship')
        );
        const querySnapshot = await getDocs(q);
        
        const bookmarkedScholarshipIds = querySnapshot.docs.map(doc => doc.data().entryId);
        setBookmarkedIds(bookmarkedScholarshipIds);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      }
    };

    fetchBookmarks();
  }, [user]);

  // Apply filtering and sorting to scholarships
  useEffect(() => {
    if (!scholarships) return;
    let result = [...scholarships];
    // Apply filter
    if (filterType === 'bookmarked') {
      result = result.filter(scholarship => 
        bookmarkedIds.includes(scholarship.scholarshipId)
      );
    }
    // Apply sort
    result.sort((a, b) => {
      if (sortOrder === 'latest') {
        return b.datePosted.getTime() - a.datePosted.getTime();
      } else {
        return a.datePosted.getTime() - b.datePosted.getTime();
      }
    });
    setFilteredScholarships(result);
  }, [scholarships, filterType, sortOrder, bookmarkedIds]);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className='bg-[#EAEAEA] h-ful'>
		{/*Page Title*/}
		<div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
			<div className="absolute inset-0 bg-blue-500/50" />
			<div className="relative z-10">
				<h1 className="text-5xl font-bold my-2 text-white">Scholarships</h1>
				<p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
			</div>
		</div>

		{/* Body */}
		<div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[100px] xl:mx-[200px]'>
			{/* Sidebar */}
			<div className='bg-[#FFFFFF] flex flex-col p-5 gap-[10px] rounded-[10px] w-content h-max'>
				<button className={`flex gap-5 items-center justify-start`} onClick={() => setFilterType('all')}>
					<GraduationCap />
					<p className={`group w-max relative py-1 transition-all ${filterType === 'all' ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
						<span>All Scholarships</span>
						{filterType !== 'all' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
					</p>
				</button>
				<button className={`flex gap-5 items-center justify-start`} onClick={() => setFilterType('bookmarked')}>
					<Bookmark />
					<p className={`group w-max relative py-1 transition-all ${filterType === 'bookmarked' ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-600 group'}`}>
						<span>Saved Scholarships</span>
						{filterType !== 'bookmarked' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
					</p>
				</button>
				<button className={`flex gap-5 items-center justify-start`} onClick={() => setFilterType('scholars')}>
					<HandHeart />
					<p className={`group w-max relative py-1 transition-all ${filterType === 'scholars' ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-600 group'}`}>
						<span>My Scholars</span>
						{filterType !== 'scholars' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
					</p>
				</button>
				<button className={`flex gap-5 items-center justify-start`} onClick={() => setFilterType('stories')}>
					<BookOpen />
					<p className={`group w-max relative py-1 transition-all ${filterType === 'stories' ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-600 group'}`}>
						<span>Featured Stories</span>
						{filterType !== 'stories' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
					</p>
				</button>
			</div>
			{/* Scholarship part */}
			<div className='flex flex-col gap-[10px] w-full mb-10'>
				{/* Filters and sorting */}
				<div className="bg-[#FFFFFF] rounded-[10px] px-5 flex justify-around">
					<button className={`flex gap-5 items-center justify-center w-full`} onClick={() => setSortOrder('latest')}>
						<p className={`group w-full relative py-1 transition-all ${sortOrder === 'latest' ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
							<span>Latest First</span>
							{sortOrder !== 'latest' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
						</p>
					</button>
					<button className={`flex gap-5 items-center justify-center w-full`} onClick={() => setSortOrder('oldest')}>
						<p className={`group w-full relative py-1 transition-all ${sortOrder === 'oldest' ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
							<span> Oldest First</span>
							{sortOrder !== 'oldest' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
						</p>
					</button>
				</div>
				{/* Scholarships Cards */}
				{filteredScholarships.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
					{filterType === 'bookmarked' 
						? "You haven't bookmarked any scholarships yet." 
						: "No scholarships available."}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
					{filteredScholarships.map((scholarship) => (
						<div key={scholarship.scholarshipId} className='...'>
							<div className=" bg-[#FFFF] rounded-[10px] h-fit">
								{/* Image */}
								<div className="bg-cover bg-center rounded-t-[10px] h-[230px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
								<div className='p-[30px] pt-[10px]'>
									{/* Title and Status */}
									<div className="flex justify-between items-center mb-3">
										<h2 className="text-xl font-semibold truncate">{scholarship.title}</h2>
										<BookmarkButton entryId={scholarship.scholarshipId} type="scholarship" size="lg"/>
									</div>
									{/* Description */}
									<p className="mb-5 text-sm h-max">{scholarship.description}</p>
									{/* Details */}
									<div className="flex flex-col justify-between items-start text-sm text-gray-600 mt-4">
										<div className="flex items-center text-sm text-gray-600">
											<span className="mr-2">Date Posted:</span>
											<span className="">{scholarship.datePosted.toLocaleDateString()}</span>
										</div>
										{/* <div className="flex items-center text-sm text-gray-600">
											<span className="mr-2">Recipients:</span>
											<span className="font-medium">{scholarship.alumList.length}</span>
										</div> */}
									</div>

									<button className='flex gap-2 items-center group relative w-max mt-4'>
										<span className='text-sm'>View Details</span>
										<MoveRight className='size-[17px]'/>
										<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
									</button>
								</div>
							</div>
						</div>
						
						// Alumni List
						// 	{scholarship.alumList.length > 0 && (
						// 	<div className="mt-4 pt-4 border-t border-gray-200">
						// 		<h3 className="text-sm font-medium text-gray-700 mb-2">Alumni Recipients</h3>
						// 		<div className="flex flex-wrap gap-1">
						// 		{scholarship.alumList.map((alumId, index) => (
						// 			<span key={alumId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						// 			Recipient {index + 1}
						// 			</span>
						// 		))}
						// 		</div>
						// 	</div>
						// 	)}
						// </div>
						// </div>
					))}
					</div>
				)}
			</div>
		</div>
    </div>
  );
};

export default ScholarshipPage;