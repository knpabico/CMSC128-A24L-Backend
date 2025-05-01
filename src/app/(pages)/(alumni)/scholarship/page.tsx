"use client";

import React, { useState, useEffect } from 'react';
import { useScholarship } from '@/context/ScholarshipContext';
import BookmarkButton from "@/components/ui/bookmark-button";
import { CalendarDays, Bookmark, HandHeart, BookOpen, Clock, User, Filter } from "lucide-react";
import { useBookmarks } from '@/context/BookmarkContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';;
import { useFeatured } from '@/context/FeaturedStoryContext';
import { Featured } from '@/models/models';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  
  if (status === "active") {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (status === "closed") {
    bgColor = "bg-gray-100";
    textColor = "text-gray-800";
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} capitalize`}>
      {status}
    </span>
  );
};

// Status Filter Component
const StatusFilter = ({ activeFilter, setActiveFilter }: { 
  activeFilter: 'all' | 'active' | 'closed', 
  setActiveFilter: (filter: 'all' | 'active' | 'closed') => void 
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Filter size={16} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700">Status:</span>
      <div className="flex rounded-full bg-gray-200 p-1">
        <button 
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveFilter('active')}
        >
          Active
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'closed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveFilter('closed')}
        >
          Closed
        </button>
      </div>
    </div>
  );
};

const ScholarshipPage: React.FC = () => {
  const { scholarships, loading, error } = useScholarship();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const router = useRouter();

  const { featuredItems, isLoading: featuredLoading } = useFeatured();
  const [scholarshipStories, setScholarshipStories] = useState<Featured[]>([]);

  useEffect(() => {
    // Filter featured items with type "scholarship"
    if (featuredItems && featuredItems.length > 0) {
      const filteredStories = featuredItems.filter(
        (item: Featured) => item.type === "scholarship" && item.status !== "deleted"
      );
      setScholarshipStories(filteredStories);
    }
  }, [featuredItems]);

  const handleToggleBookmark = async (e: React.MouseEvent, scholarshipId: string) => {
    // Stop event propagation to prevent navigation when clicking the bookmark button
    e.stopPropagation();
    await toggleBookmark(scholarshipId, 'scholarship');
  };

  const navigateToDetail = (scholarshipId: string) => {
    router.push(`/scholarship/${scholarshipId}`);
  };

  const navigateToFeaturedDetail = (featuredId: string) => {
    router.push(`/scholarship/featured/${featuredId}`);
  };

  // Function to determine if scholarship is active based on deadline
  const isScholarshipActive = (scholarship: any) => {
    if (scholarship.status === "deleted") return false;
    
    if (scholarship.status) {
      return scholarship.status === "active";
    }
    
    // Default to active if no status or deadline
    return true;
  };

  // Get scholarship status
  const getScholarshipStatus = (scholarship: any) => {
    if (scholarship.status === "deleted") return "deleted";
    
    if (scholarship.status) {
      return scholarship.status;
    }
    
    // Default
    return "active";
  };

  if (loading || featuredLoading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  // First filter based on tab
  const tabFilteredScholarships = (() => {
    // Remove all scholarships with status "deleted"
    const nonDeletedScholarships = scholarships.filter(
      (scholarship: any) => getScholarshipStatus(scholarship) !== "deleted"
    );
    
    switch(activeTab) {
      case 'saved':
        return nonDeletedScholarships.filter((scholarship: any) => 
          isBookmarked(scholarship.scholarshipId)
        );
      case 'myScholars':
        // Only show scholarships where the current user is in the alumList
        return user 
          ? nonDeletedScholarships.filter((scholarship: any) => 
              scholarship.alumList.includes(user.uid)
            ) 
          : [];
      case 'stories':
        return [];
      default:
        return nonDeletedScholarships;
    }
  })();

  // Then filter based on status
  const filteredScholarships = (() => {
    if (statusFilter === 'all') {
      return tabFilteredScholarships;
    } else if (statusFilter === 'active') {
      return tabFilteredScholarships.filter((scholarship: any) => 
        isScholarshipActive(scholarship)
      );
    } else { // closed
      return tabFilteredScholarships.filter((scholarship: any) => 
        !isScholarshipActive(scholarship)
      );
    }
  })();

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
      <div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[100px] xl:mx-[200px] static'>
        <div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7'>
          <button onClick={() => setActiveTab('all')} className='flex items-center gap-3'>
            <CalendarDays />
            <p className={`group w-max relative py-1 transition-all ${activeTab === 'all' ? 'font-semibold border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
              <span>All Scholarships</span>
              {activeTab !== 'all' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
            </p>
          </button>
          <button onClick={() => setActiveTab('saved')} className='flex items-center gap-3'>
            <Bookmark />
            <p className={`group w-max relative py-1 transition-all ${activeTab === 'saved' ? 'font-semibold border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
              <span>Saved Scholarships</span>
              {activeTab !== 'saved' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
            </p>
          </button>
          <button onClick={() => setActiveTab('myScholars')} className='flex items-center gap-3'>
            <HandHeart />
            <p className={`group w-max relative py-1 transition-all ${activeTab === 'myScholars' ? 'font-semibold border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
              <span>My Scholars</span>
              {activeTab !== 'myScholars' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
            </p>
          </button>
          <button onClick={() => setActiveTab('stories')} className='flex items-center gap-3'>
            <BookOpen />
            <p className={`group w-max relative py-1 transition-all ${activeTab === 'stories' ? 'font-semibold border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
              <span>Featured Stories</span>
              {activeTab !== 'stories' && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
            </p>
          </button>
        </div>

        <div className='flex flex-col gap-[10px] w-full mb-10'>
          {/* Status Filter - Only show on non-stories tabs */}
          {activeTab !== 'stories' && (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <StatusFilter activeFilter={statusFilter} setActiveFilter={setStatusFilter} />
            </div>
          )}
          
          {/* Content based on active tab */}
          {activeTab === 'stories' ? (
            <>
              {scholarshipStories.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
                  No featured scholarship stories available.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {scholarshipStories.map((story: Featured) => (
                    <div 
                      key={story.featuredId} 
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigateToFeaturedDetail(story.featuredId)}
                    >
                      {/* Image */}
                      <div 
                        className="relative bg-cover bg-center rounded-t-[10px] h-[230px]" 
                        style={{ backgroundImage: `url("${story.image || '/ICS3.jpg'}")` }} 
                      />
                      {/* Body */}
                      <div className="px-6 pt-3 pb-6">
                        {/* Title */}
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-xl font-semibold truncate">{story.title}</h2>
                          <StatusBadge status={story.status || 'active'} />
                        </div>
                        {/* Description */}
                        <div className="mb-5 text-sm h-20 overflow-hidden text-clip">
                          <p className="text-start">
                            {story.text && story.text.length > 150 
                              ? story.text.slice(0, 150) + "..." 
                              : story.text}
                          </p>
                        </div>
                        <div className='grid grid-cols-2 w-full items-center'>
                          {/* Date */}
                          <div className='flex items-center gap-1'>
                            <Clock size={16} />
                            <p className="text-sm text-gray-600">
                              {story.datePosted && typeof story.datePosted.toDate === 'function' 
                                ? story.datePosted.toDate().toLocaleDateString() 
                                : new Date(story.datePosted).toLocaleDateString()}
                            </p>
                          </div>
                        </div>       
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Regular scholarships list display for other tabs
            <>
              {filteredScholarships.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
                  {activeTab === 'saved' ? `No ${statusFilter !== 'all' ? statusFilter : ''} saved scholarships` : 
                   activeTab === 'myScholars' ? `No ${statusFilter !== 'all' ? statusFilter : ''} scholarships available.` : 
                   `No ${statusFilter !== 'all' ? statusFilter : ''} scholarships available.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {filteredScholarships.map((scholarship: any) => {
                    const status = getScholarshipStatus(scholarship);
                    return (
                      <div 
                        key={scholarship.scholarshipId} 
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigateToDetail(scholarship.scholarshipId)}
                      >
                        {/* Image */}
                        <div className="relative bg-cover bg-center rounded-t-[10px] h-[230px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
                        {/* Body */}
                        <div className="px-6 pt-3 pb-6">
                          {/* Name */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex flex-col gap-1">
                              <h2 className="text-xl font-semibold truncate">{scholarship.title}</h2>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={status} />
                              </div>
                            </div>
                            <div onClick={(e) => handleToggleBookmark(e, scholarship.scholarshipId)}>
                              <BookmarkButton 
                                entryId={scholarship.scholarshipId}  
                                type="scholarship" 
                                size="lg"
                              />
                            </div>
                          </div>
                          {/* Description */}
                          <div className="mb-5 text-sm h-20 overflow-hidden text-clip">
                            <p className="text-start">
                              {scholarship.description.length > 150 
                                ? scholarship.description.slice(0, 150) + "..." 
                                : scholarship.description}
                            </p>
                          </div>
                          <div className='grid grid-cols-2 w-full items-center'>
                            {/* Date */}
                            <div className='flex items-center'>
                              <p className="text-sm text-gray-600">
                                Posted on {scholarship.datePosted.toLocaleDateString()}
                              </p>
                            </div>
                            {/* Sponsors */}
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">Sponsors:</span>
                              <span className="font-medium">{scholarship.alumList.length}</span>
                            </div>
                          </div>       
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipPage;