// pages/scholarships/[id].tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScholarship } from '@/context/ScholarshipContext';
import { useAuth } from '@/context/AuthContext';
import { Scholarship, NewsletterItem, Announcement, JobOffering } from '@/models/models';
import { CircleAlert, CircleCheck, CircleHelp, HandCoins, MoveLeft } from 'lucide-react';
import { useNewsLetters } from '@/context/NewsLetterContext';

//for featured stories
import { useAnnouncement } from '@/context/AnnouncementContext';
import { useEvents } from '@/context/EventContext';
import { useJobOffer } from "@/context/JobOfferContext";
import { Dialog, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';

const ScholarshipDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getScholarshipById, updateScholarship } = useScholarship();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsoring, setSponsoring] = useState(false);
  const { newsLetters, isLoading: newslettersLoading } = useNewsLetters();
  const { announces = [] } = useAnnouncement() || {};
  const { jobs = [] } = useJobOffer() || {};
  const scholarshipId = params?.id as string;
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);

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
      <div className='bg-[#EAEAEA] mx-auto px-10 py-8'>
        {/* Back button */}
        <div className="text-sm mb-4 inline-flex gap-2 items-center hover:underline hover:cursor-pointer">
          <button onClick={goBack} className='flex items-center gap-2'>
            <MoveLeft className='size-[17px]'/>
            Back to scholarships
          </button>
        </div>
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
                    Currently Sponsoring
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
			<Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
				<DialogContent className='w-96'>
					<DialogHeader className='text-orange-500 flex items-center'>
						<CircleAlert className='size-15'/>
						<DialogTitle className='text-2xl'> Confirm Sponsorship </DialogTitle>
					</DialogHeader>
					<DialogDescription> Are you sure you want to become a sponsor for the <strong>{scholarship?.title}</strong> scholarship? </DialogDescription>
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
			<Dialog open={isThankYouOpen} onOpenChange={setIsThankYouOpen}>
				<DialogContent className='w-96'>
					<DialogHeader className='text-green-700 flex items-center'>
						<CircleCheck className='size-15'/>
						<DialogTitle className='text-2xl'> Thank You! </DialogTitle>
					</DialogHeader>
					<DialogDescription className='text-center'> 
							Like an open-source project, your generosity makes everything better! Thank you for contributing to something bigger than yourself!
					</DialogDescription>
					<DialogDescription className='italic text-xs'>
						Our admin team will reach out to you soon to coordinate the next steps and discuss how your support can make a meaningful impact through our scholarship program.
					</DialogDescription>
					<DialogFooter className='mt-5'>
						<button className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100" onClick={() => setIsThankYouOpen(false)}>Close</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		  )}
          
          {/* Stories */}
          <div className='my-12 w-full'>
            <h1 className='font-semibold text-3xl text-center mb-6'>Featured Stories</h1>
            
            {newslettersLoading ? (
              <p className="text-center py-4">Loading newsletters...</p>
            ) : newsLetters && newsLetters.length > 0 ? (
              <div className="space-y-4">
                {newsLetters.map((newsLetter: NewsletterItem) => (
                  <div key={newsLetter.newsletterId} className="bg-white p-4 rounded-md shadow">
                  {/* <h3 className="font-bold text-lg">
                    {newsLetter.category === 'scholarship' ? 'Scholarship Story' : 
                    newsLetter.category === 'event' ? 'Event Update' : 
                    newsLetter.category === 'announcement' ? 'Announcement' :
                    newsLetter.category === 'job_offering' ? 'Job Opportunity' : 'Job'} 
                  </h3> */}

                  {/* sa ngayon, announcement palang nakukuha */}

                    {newsLetter.category === "announcement" && (() => {
                      const announcement = announces.find(
                        (announce: Announcement) => announce.announcementId === newsLetter.referenceId
                      );
                      return announcement ? (
                        <>
                          <h4 className="font-medium">{announcement.title}</h4>
                          <p>{announcement.description}</p>
                        </>
                      ) : (
                        <p>Announcement not found</p>
                      );
                    })()}

                    {/* {newsLetter.category === "job_offering" && (() => {
                      const joboffering = jobs.find(
                        (job: JobOffering) => job.jobId === newsLetter.referenceId
                      );
                      return joboffering ? (
                        <>
                          <h4 className="font-medium">{joboffering.company}</h4>
                          <p>{joboffering.jobDescription}</p>
                        </>
                      ) : (
                        <p>JOb not found</p>
                      );
                    })()} */}

                    <p className="text-sm text-gray-600">
                      Reference ID: {newsLetter.referenceId}
                    </p>
                    <p className="text-sm text-gray-600">
                      Posted: {newsLetter.timestamp instanceof Date 
                        ? newsLetter.timestamp.toLocaleDateString() 
                        : new Date(newsLetter.timestamp.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No stories have been published yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ScholarshipDetailPage;