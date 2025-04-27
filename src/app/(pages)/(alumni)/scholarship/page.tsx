"use client";

import React, { useState } from 'react';
import { useScholarship } from '@/context/ScholarshipContext';
import BookmarkButton from "@/components/ui/bookmark-button";
import { CalendarDays, Bookmark, HandHeart, BookOpen } from "lucide-react"
import { useBookmarks } from '@/context/BookmarkContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useNewsLetters } from '@/context/NewsLetterContext';
import { useAnnouncement } from '@/context/AnnouncementContext';
import { useJobOffer } from "@/context/JobOfferContext";
import { useEvents } from '@/context/EventContext';
import { Event, Announcement, JobOffering, DonationDrive, NewsletterItem  } from '@/models/models';


const ScholarshipPage: React.FC = () => {
  const { scholarships, loading, error } = useScholarship();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();
  const { newsLetters, isLoading: newslettersLoading } = useNewsLetters();
  const { announces = [] } = useAnnouncement() || {};
  const { jobs = [] } = useJobOffer() || {};
  const { events = [] } = useEvents() || {};


  const handleToggleBookmark = async (e: React.MouseEvent, scholarshipId: string) => {
    // Stop event propagation to prevent navigation when clicking the bookmark button
    e.stopPropagation();
    await toggleBookmark(scholarshipId, 'scholarship');
  };

  const navigateToDetail = (scholarshipId: string) => {
    router.push(`/scholarship/${scholarshipId}`);
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  // Filter scholarships based on active tab
  const filteredScholarships = (() => {
    switch(activeTab) {
      case 'saved':
        return scholarships.filter((scholarship : Scholarship) => isBookmarked(scholarship.scholarshipId));
      case 'myScholars':
        // Only show scholarships where the current user is in the alumList
        return user 
          ? scholarships.filter((scholarship : Scholarship) => scholarship.alumList.includes(user.uid)) 
          : [];
      case 'stories':
        // For the stories tab, we don't show scholarships
        return [];
      default:
        return scholarships;
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
      <div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[100px] xl:mx-[200px]'>
        <div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max'>
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
          {/* Content based on active tab */}
          {activeTab === 'stories' ? (
            <div className='my-4 w-full'>
            
              
              {newslettersLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : newsLetters && newsLetters.length > 0 ? (
                <div className="space-y-4">
                  {newsLetters.map((newsLetter: NewsletterItem) => (
                    <div key={newsLetter.newsletterId} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                      {newsLetter.category === "announcement" && (() => {
                        const announcement = announces.find(
                          (announce: Announcement) => announce.announcementId === newsLetter.referenceId
                        );
                        return announcement ? (
                          <>
                            <h4 className="font-bold text-xl mb-2">{announcement.title}</h4>
                          </>
                        ) : (
                          <p>Announcement not found</p>
                        );
                      })()}
                      
                      {newsLetter.category === "events" && (() => {
                        const event = events.find(
                          (event: Event) => event.eventId === newsLetter.referenceId
                        );
                        return event ? (
                          <>
                            <h4 className="font-bold text-xl mb-2">{event.title}</h4>
                          </>
                        ) : (
                          <p>event not found</p>
                        );
                      })()}

                
                      {newsLetter.category === "job_offering" && (() => {
                        const joboffering = jobs.find(
                          (job: JobOffering) => job.jobId === newsLetter.referenceId
                        );
                        return joboffering ? (
                          <>
                            <h4 className="font-bold text-xl mb-2">{joboffering.company}</h4>
                            <p className="mb-4">{joboffering.jobDescription}</p>
                          </>
                        ) : (
                          <p>Job not found</p>
                        );
                      })()}
                      
               
                        <p>Category: {newsLetter.category.charAt(0).toUpperCase() + newsLetter.category.slice(1).replace('_', ' ')}</p>
                        <p>
                          Posted: {newsLetter.timestamp instanceof Date 
                            ? newsLetter.timestamp.toLocaleDateString() 
                            : new Date(newsLetter.timestamp.seconds * 1000).toLocaleDateString()}
                        </p>

                        {/* wala pa onclick implementation */}
                        <p>See more</p> 
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white p-8 rounded-lg shadow text-gray-500">
                  <p className="text-lg">No stories have been published yet.</p>
                </div>
              )}
            </div>
          ) : (
            // Regular scholarships list display for other tabs
            <>
              {filteredScholarships.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
                  {activeTab === 'saved' ? 'No saved scholarships' : 
                   activeTab === 'myScholars' ? 'No scholarships available.' : 
                   'No scholarships available.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {filteredScholarships.map((scholarship : Scholarship) => (
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
                          <h2 className="text-xl font-semibold truncate">{scholarship.title}</h2>
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
                  ))}
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