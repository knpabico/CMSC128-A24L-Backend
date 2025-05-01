// pages/scholarships/[id].tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScholarship } from '@/context/ScholarshipContext';
import { useAuth } from '@/context/AuthContext';
import { Scholarship, NewsletterItem, Announcement, JobOffering } from '@/models/models';
import { ChevronLeft, ChevronRight, CircleAlert, CircleCheck, CircleHelp, HandCoins, MoveLeft } from 'lucide-react';
import { useNewsLetters } from '@/context/NewsLetterContext';

//for featured stories
import { useFeatured } from "@/context/FeaturedStoryContext";
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';

const ScholarshipDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getScholarshipById, updateScholarship } = useScholarship();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsoring, setSponsoring] = useState(false);
  const scholarshipId = params?.id as string;
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const { featuredItems, isLoading } = useFeatured();
  
  const eventStories = featuredItems.filter(story => story.type === "scholarship");
 
  const sortedStories = [...eventStories].sort((a, b) => {
    const dateA = a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted);
    const dateB = b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted);
    return dateB.getTime() - dateA.getTime();
  });
	// Featured Stories
	const [currentIndex, setCurrentIndex] = useState(0);
	const maxIndex = Math.max(0, sortedStories.length - 3);
	const nextSlide = () => {
		if (currentIndex < maxIndex) {
			setCurrentIndex(currentIndex + 1);
		}
	};
		const prevSlide = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};
	const visibleStories = sortedStories.slice(currentIndex, currentIndex + 3);

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      if (date?.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      }
      return "Invalid date";
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const data = await getScholarshipById(scholarshipId);
        if (data) {
          setScholarship(data);
        } else {
          setError("Scholarship not found");
        }
      } catch (err) {
        setError("Error loading scholarship details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (scholarshipId) {
      fetchScholarship();
    }
  }, [scholarshipId, getScholarshipById]);

  
  const handleSponsor = async () => {
    if (!user || !scholarship) return;

    try {
      setSponsoring(true);
      const currentAlumList = scholarship.alumList || [];

      if (!currentAlumList.includes(user.uid)) {
        const updatedAlumList = [...currentAlumList, user.uid];

        const result = await updateScholarship(scholarshipId, {
          alumList: updatedAlumList
        });

        if (result.success) {
          setScholarship({
            ...scholarship,
            alumList: updatedAlumList
          });
        }
      }
    } catch (err) {
      console.error("Error sponsoring scholarship:", err);
    } finally {
      setSponsoring(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return <div style={{ margin: '20px' }}>Loading...</div>;
  }

  const isAlreadySponsoring = scholarship?.alumList?.includes(user?.uid);

  return (
    <>
      <div className='bg-[#EAEAEA] mx-auto px-10 py-10'>
        {/* Body */}
        <div className="flex flex-col gap-[20px] md:px-[50px] xl:px-[200px]">
          {/* Title */}
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold text-gray-800">{scholarship?.title}</h1>
            {user && (
              <>
                {sponsoring ? (
                  <button onClick={handleSponsor} disabled className="your-processing-class">
                    Processing...
                  </button>
                ) : isAlreadySponsoring ? (
                  <button onClick={handleSponsor} disabled className="flex items-center justify-end text-white bg-green-600 font-medium gap-3 w-fit px-4 py-3 rounded-full shadow-black-500 shadow-md">
                    <CircleCheck className='size-6' />
                    Interested in Sponsoring
                  </button>
                ) : (
                  <button onClick={() => setIsConfirmationOpen(true)} className="flex items-center justify-end text-white bg-blue-600 font-medium gap-3 w-fit px-4 py-3 rounded-full hover:bg-blue-500 hover:cursor-pointer shadow-black-500 shadow-md">
                    <HandCoins className='size-6'/>
                    Sponsor a Student
                  </button>
                )}
              </>
            )}
          </div>
          {/* Image */}
          <div className="bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
          {/* Event description */}
          <p className="mt-5">{scholarship?.description}</p>
          {/* Event Details */}
          <div className='grid grid-cols-2 w-full items-center'>
            {/* Date */}
            <div className='flex items-center'>
              <p className="text-sm text-gray-600">
                Posted on {scholarship?.datePosted.toLocaleDateString()}
              </p>
            </div>
            {/* Sponsors */}
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">Sponsors:</span>
              <span className="font-medium">{scholarship?.alumList.length}</span>
            </div>
          </div>

		  {/* Confirmation Dialog */}
		  {isConfirmationOpen && (
			<Dialog open={isConfirmationOpen}>
				<DialogContent className='w-96'>
					<DialogHeader className='text-orange-500 flex items-center'>
						<CircleAlert className='size-15'/>
						<DialogTitle className='text-2xl'> Confirm Sponsorship </DialogTitle>
					</DialogHeader>
					<p> Are you sure you want to become a sponsor for the <strong>{scholarship?.title}</strong> scholarship? </p>
					<DialogFooter className='mt-5'>
						<button className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] bg-[#0856BA]  hover:bg-blue-500 hover:cursor-pointer" 
							onClick={() => {
								setIsConfirmationOpen(false);
								handleSponsor();
								setIsThankYouOpen(true);
							}} >Become a sponsor</button>
						<button className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100" onClick={() => setIsConfirmationOpen(false)}>Cancel</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		  )}

		  {/* ThankYou Dialog */}
		  {isThankYouOpen && (
			<Dialog open={isThankYouOpen}>
				<DialogContent className='w-96'>
					<DialogHeader className='text-green-700 flex items-center'>
						<CircleCheck className='size-15'/>
						<DialogTitle className='text-2xl'> Thank You! </DialogTitle>
					</DialogHeader>
					<p className='text-center'> 
							Like an open-source project, your generosity makes everything better! Thank you for contributing to something bigger than yourself!
					</p>
					<p className='italic text-xs pt-4'>
						Our admin team will reach out to you soon to coordinate the next steps and discuss how your support can make a meaningful impact through our scholarship program.
					</p>
					<DialogFooter className='mt-5'>
						<button className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100" onClick={() => setIsThankYouOpen(false)}>Close</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		  )}
          
      {/* Featured Stories Section - Carousel */}
      <div className="mt-16">
        <h2 className="text-2xl text-center font-bold mb-6 text-gray-800">Featured Stories</h2>

        {loading ? (
          <p className="text-gray-500 text-center">Loading featured stories...</p>
        ) : sortedStories.length === 0 ? (
          <p className="text-gray-500 text-center">No featured stories found.</p>
        ) : (
          <div className="relative">
            {/* Previous button */}
            <button 
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-md
                        ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
              aria-label="Previous stories"
            >
              <ChevronLeft size={24} />
            </button>
            
            {/* Stories grid - always 3 columns on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
              {visibleStories.length === 0 && (
                <div className="col-span-3 text-center text-gray-500">
                  No other stories available at this time.
                </div>
              )}
              {visibleStories.map((story) => (
                <div
                  key={story.featuredId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => router.push(`/scholarship/featured/${story.featuredId}`)}
                >
                  {story.image && (
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${story.image})` }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(story.datePosted)}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                      {story.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Next button */}
            <button 
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-md
                        ${currentIndex >= maxIndex ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
              aria-label="Next stories"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Pagination dots */}
            {sortedStories.length > 3 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 w-2 rounded-full ${
                      idx === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
};

export default ScholarshipDetailPage;