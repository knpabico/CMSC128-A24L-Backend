"use client";
import LoadingPage from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAlums } from "@/context/AlumContext";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { Alumnus,
  Announcement,
  Career,
  Donation,
  Education, JobOffering,
  NewsletterItem,
  WorkExperience,
} from "@/models/models";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDownIcon, Clock, Map, MapPin, Users } from "lucide-react";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PendingPage from "../components/PendingPage";
import RejectedPage from "../components/RejectedPage";
import {
  NewsLetterProvider,
  useNewsLetters,
} from "@/context/NewsLetterContext";
import {
  AnnouncementProvider,
  useAnnouncement,
} from "@/context/AnnouncementContext";
import { useJobOffer } from "@/context/JobOfferContext";
import CollapseText from '@/components/CollapseText';
import { useEvents } from "@/context/EventContext";
import React from "react";
import { useDonationContext } from "@/context/DonationContext";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { log } from "console";


const sortTypes = ["Latest", "Earliest"]; //sort types
const sortValues = ["nf", "of"]; //sort values (query params)
const SORT_TAGS = ["Earliest", "Latest"];

export default function Home() {
  const { user, loading, alumInfo, isAdmin, status, isGoogleSignIn } =
    useAuth();
  const { newsLetters } = useNewsLetters();
  const { announces } = useAnnouncement();
  const { jobOffers } = useJobOffer();
  const { events } = useEvents();
  const { alums } = useAlums();
  const { donationDrives } = useDonationDrives();
  const { userWorkExperience } = useWorkExperience();
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [latestFirst, setLatestFirst] = useState(true);

  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param

  const [currentDonationIndex, setCurrentDonationIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);


  const nextDonation = () => {
      setCurrentDonationIndex((prev) => 
          prev === donationDrives.length - 1 ? 0 : prev + 1
      );
  };

  const previousDonation = () => {
      setCurrentDonationIndex((prev) => 
          prev === 0 ? donationDrives.length - 1 : prev - 1
      );
  };

  function formatDate(timestamp: any) {
    if (!timestamp || !timestamp.seconds) return "Invalid Date";
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split("T")[0];
  }

  const nextEvent = () => {
    setCurrentEventIndex((prev) => 
        prev === events.length - 1 ? 0 : prev + 1
    );
  };

  const previousEvent = () => {
      setCurrentEventIndex((prev) => 
          prev === 0 ? events.length - 1 : prev - 1
      );
  };

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin-dashboard");
    }
  }, [isAdmin, router, loading, user]);

  //function for handling change on sort type
  function handleSortChange(sortType: string) {
    let sorting = sortType ? `?sort=${sortType}` : "";

    //will push the parameters to the url
    router.push(`${sorting}`);
  }

  //function for getting the defaultValue for the sort by dropdown using the current query
  function getDefaultSort(): string {
    let defaultSort = "nf";
    for (let i = 0; i < sortValues.length; i++) {
      if (sortValues[i] === sort) {
        defaultSort = sortValues[i]; //find its index in the sortValues array
        break;
      }
    }
    return defaultSort;
  }
  const { myCareer, myEducation } = useAlums();
  let total = 30000
  let partial = 3000
  let progress = Math.ceil((partial/total)*100) + "%";

  function adminHeader() {
    const adminPic = '/ics-logo.jpg';
    const adminName = "Institute of Computer Science";
    return (<>
      <img
        src={adminPic}
        className="w-10 h-10 object-cover object-top rounded-full border border-[#DADADA]"
      />
      <p className="text-[16px]">
        {adminName}
      </p>
    </>)
  }

 // Calculate days remaining until the donation drive ends
  function getDaysRemaining(endDate: any) {
    try {
      const now = new Date();
    
      // Clear time portions to calculate full days
      // const endDateOnly = new Date(endDate);
      // endDateOnly.setHours(0, 0, 0, 0);
      
      // const todayOnly = new Date(now);
      // todayOnly.setHours(0, 0, 0, 0);

      const todayOnly = new Date(); // Current date
      const endDateOnly = endDate.toDate(); // Firestore Timestamp to JS Date
      
      // Calculate difference in days
      const differenceInTime = endDateOnly.getTime() - todayOnly.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));
      if (differenceInDays <= 0) return "Expired";
      else if (differenceInDays === 1) return "1 day left";
      else return `${differenceInDays} days left`;
      // Return 0 if ended or negative
    } catch (err) {
      return 'Not Available';
    }
  }



  if (loading || (user && !alumInfo)) return <LoadingPage />;
  else if (!user && !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <p className="text-black text-[70px] font-bold">WELCOME, Guest!</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  } else if (user) {
    if (status === "pending") return <PendingPage />;
    else if (status === "rejected") return <RejectedPage />;
    else
      return (
      <div className="w-full px-4 md:px-6 lg:px-[50px]">
        <div className="flex flex-col lg:flex-row w-full my-5 relative">

        {/* Profile Panel */}
        <div className="w-full lg:w-64 lg:sticky lg:top-23 lg:self-start mb-5 lg:mb-0 flex flex-col items-center bg-white p-5 rounded-[10px] border border-[#DADADA]">
          <img
            src={alumInfo!.image}
            className="w-20 h-20 md:w-40 md:h-40 lg:w-50 lg:h-50 mb-5 object-cover object-top rounded-full border border-[#DADADA]"
          ></img>
          <p className="text-lg md:text-[20px] text-center font-bold justify-self-center">
            {alumInfo!.lastName}, {alumInfo!.firstName}{" "}
          </p>
          <p className="text-xs md:text-[14px]">{alumInfo!.email}</p>
          <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
          <div className="text-xs md:text-[14px] text-center wrap-break-word px-2"><i>Currently based on {alumInfo!.address}</i></div>
          <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
          <div className="flex flex-col items-center">
            <p className="text-xs md:text-[14px]">Std. No. {alumInfo!.studentNumber}</p>
            <p className="text-xs md:text-[14px]">Graduated: {alumInfo!.graduationYear}</p>
          </div>
          <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
          <div className="flex flex-wrap justify-center gap-2 px-2">
            {alumInfo!.fieldOfInterest.map((interest) => (              
              <div key={interest} className="text-xs md:text-[14px] border border-[#0856BA] text-[#0856BA] rounded-[5px] place-items-center px-[7px] py-[5px]">{interest}</div>
            ))}
          </div>
          <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
          <Button
            onClick={() => router.push(`/my-profile/${user?.uid}`)}
            className="w-full h-[30px] cursor-pointer rounded-full text-white bg-[#0856BA] hover:bg-[#357BD6]"
          >
            View Profile
          </Button>
        </div>

        {/* Feed  */}
        <div className="w-full mt-[75px] lg:mx-5 lg:flex-1 flex flex-col ">
          {/*sorting dropdown*/}
          <div className="flex flex-row w-full justify-end mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="pl-5 h-10 w-30 items-center flex flex-row rounded-full bg-white border border-[#0856BA] text-sm/6 font-semibold text-[#0856BA] shadow-inner shadow-white/10 focus:outline-none">
                {selectedSort}
                <ChevronDownIcon className="size-4 fill-white/60 ml-5" />
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-30 ml-0 bg-[#0856BA] text-white border border-[#0856BA] transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0">                    
                {sortTypes.map((sortType, index) => (
                  <DropdownMenuItem key={sortType} asChild>
                    <button
                      onClick={() => {
                        setSelectedSort(sortType);
                        setLatestFirst(sortType === "Latest");
                        handleSortChange(sortValues[index]);
                      }}
                      className={`flex w-full cursor-pointer items-center rounded-md py-1.5 px-3 focus:outline-none ${
                        selectedSort === sortType ? "bg-white text-[#0856BA] font-semibold" : ""
                      }`}
                    >
                      {sortType}
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        {/* Feed Content */}
          <div className="scroll-smooth flex flex-col w-full gap-[5px]">
            {newsLetters.map((newsLetter: NewsletterItem, index: Key) => (
              <div
                key={index}
                className="flex flex-col rounded-[10px] mb-[10px] w-full h-auto bg-white border border-[#DADADA]"
              >
                {/* user info */}
                <div className="flex flex-row mb-[20px] px-4 md:px-[20px] mt-[20px] gap-2 items-center">
                  <img
                    src={newsLetter.category === "announcement" || newsLetter.category === "event" || newsLetter.category === "scholarship" || newsLetter.category === "donation_drive"
                      ? "/ics-logo.jpg"
                      : newsLetter.category === "job_offering"
                      ? "https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                      : "https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                    }
                    className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] object-cover object-top rounded-full border border-[#DADADA]"
                  />
                  <p className="text-sm md:text-[16px]">
                    {newsLetter.category === "announcement" || newsLetter.category === "event" || newsLetter.category === "scholarship" || newsLetter.category === "donation_drive"
                      ? "Institute of Computer Science"
                      : newsLetter.category === "job_offering"
                      ? (() => {
                          const jobOffering = jobOffers.find(
                            (jobOffer: JobOffering) =>
                              jobOffer.jobId === newsLetter.referenceId
                          );
                          return jobOffering
                            ? alums.find(
                                (alum: Alumnus) => alum.alumniId === jobOffering.alumniId
                              )?.firstName + " " + alums.find(
                                (alum: Alumnus) => alum.alumniId === jobOffering.alumniId
                              )?.lastName || "Unknown Alumni"
                            : "Job Offering Not Found";
                        })()
                      : ""
                    }
                  </p>
                  <p className="text-lg md:text-[24px]"> &#xb7;</p>
                  <p className="text-[10px] md:text-[12px]">{formatDate(newsLetter.timestamp)}</p>
                </div>                    
              
                {/* if newsletter is announcement */}
                {newsLetter.category === "announcement" && (() => {
                  const announcement = announces.find(
                    (announce: Announcement) => announce.announcementId === newsLetter.referenceId
                  );
                  return announcement ? (
                    <div className="flex flex-col gap-[20px]">
                      <div className="flex flex-col">
                        <div className="flex flex-col gap-[10px] px-4 md:px-[20px] mb-[20px]">
                          <p className="text-xl md:text-[24px] font-semibold">{announcement.title}</p>
                          <CollapseText text={announcement.description + " "} maxChars={300} />
                        </div>
                        {announcement.image === "" ? "" :
                        <img src={announcement.image} className="w-full rounded-b-[10px]"></img>
                        }
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] md:text-[14px] mx-4 md:mx-[20px] my-[10px] italic text-gray-500">Announcement not found</p>
                  );
                })()}

                {/* if newsletter is a job post */}
                {newsLetter.category === "job_offering" && (() => {
                  const jobOffering = jobOffers.find(
                    (jobOffer: JobOffering) => jobOffer.jobId === newsLetter.referenceId
                  );
                  return jobOffering ? (
                    <div className="px-4 md:px-[20px]">
                      <div className="flex flex-col gap-4 md:gap-[30px]">
                        <div className="flex flex-col gap-[1px]">
                          <p className="text-xl md:text-[24px] font-semibold">
                            {jobOffering.position} 
                          </p>
                          <p className="text-base md:text-[18px]">
                            {jobOffering.company} 
                          </p>
                        </div>
                        <div className="flex flex-col gap-4 md:gap-[30px]">
                          <div className="flex flex-col gap-[10px]">
                            <div className="flex flex-row gap-[5px]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] md:h-[20px] w-auto">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                              </svg>
                              <p className="text-[13px] md:text-[15px]">
                                {jobOffering.employmentType}
                              </p>
                              <p>&#xb7;</p>
                              <p className="text-[13px] md:text-[15px]">
                                {jobOffering.experienceLevel}
                              </p>
                            </div>

                            <div className="flex flex-row gap-[5px]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] md:h-[20px] w-auto">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                              </svg>
                              <p className="text-[13px] md:text-[15px]">
                                {jobOffering.salaryRange}
                              </p>
                            </div>
                          
                            <div className="text-[13px] md:text-[15px]"> 
                              <div className="flex flex-row gap-[3px]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] md:h-[20px] w-auto">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                </svg>
                                Required skill(s):
                              </div>

                              <div className="pl-[25px]">
                                {jobOffering.requiredSkill.map((skill: string) => (
                                  <ul className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-500" key={skill}> 
                                    <li key={skill} className="flex items-center" >
                                      <svg className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                      </svg>
                                      {skill}
                                    </li>
                                  </ul>
                                ))}
                              </div>
                            </div>
                          </div> 
                      
                          {/* job desc */}
                          <div>
                            <div className="flex flex-row items-center gap-[5px]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] md:h-[20px] w-auto">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                              </svg>
                              <p className="text-lg md:text-[20px] font-semibold">About the job</p>
                            </div>
                            <div className="text-[13px] md:text-[15px] ml-[25px] mr-[25px] text-justify">
                              <CollapseText text={jobOffering.jobDescription + " "} maxChars={300}/>
                            </div>
                          </div> 
                          {jobOffering.image === "" ? "" :
                          <img src={jobOffering.image}></img>
                          }
                          <button
                            onClick={() => router.push(`/joboffer-list`)}
                            className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-white"
                          >View More Job Offers</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] md:text-[14px] mx-4 md:mx-[20px] my-[10px] italic text-gray-500">Job offer not found</p>
                  );
                })()}

                {/* if newsletter is a donation drive */}
                {newsLetter.category === "donation_drive" && (() => {
                  const donationDrive = donationDrives.find((donation:Donation) => {
                    return donation.donationDriveId === newsLetter.referenceId;
                  });
                  
                  return donationDrive ? (
                    <div className="flex flex-col gap-[20px]">
                      <div className="flex flex-col gap-[20px]">
                        <div className="flex flex-col gap-[10px] px-4 md:px-[20px] mb-[20px]">
                          <p className="text-xl md:text-[24px] font-semibold">{donationDrive.campaignName}</p>
                          <p className="text-xl md:text-[24px] font-semibold">{donationDrive.title}</p>
                          <CollapseText text={donationDrive.description + " "} maxChars={300} />
                        </div>

                      {donationDrive.image === "" ? "" :
                        <img src={donationDrive.image} className="w-full" alt="Donation drive" /> 
                      }
                        
                        <div className="flex flex-col px-4 md:px-[20px]">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <div className='flex gap-2 items-center'>
                                <Users className='size-4 text-[#616161]'/>
                                <span className="text-[13px] md:text-[15px] text-gray-500">{donationDrives[currentDonationIndex].donorList?.length || 0} Patrons</span>
                              </div>
                              {getDaysRemaining(donationDrives[currentDonationIndex].endDate) === "Not Available" ? "" : (
                              <div className='flex gap-2 items-center'>
                                <Clock className='size-4 text-[#616161]'/>
                                <span className="text-[13px] md:text-[15px] text-gray-500">{getDaysRemaining(donationDrives[currentDonationIndex].endDate)}</span>
                              </div>)}
                            </div>

                            {/* progress bar */}
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden my-[5px]">
                              {donationDrives[currentDonationIndex].currentAmount === 0 ? (
                                <div 
                                className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center py-0.5 leading-none rounded-full" 
                                style={{
                                  width: `${Math.min((donationDrives[currentDonationIndex].currentAmount || 0) / donationDrives[currentDonationIndex].targetAmount * 100, 100)}%`
                                }}
                              >
                              </div>) : 
                              <div 
                                className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" 
                                style={{
                                  width: `${Math.min((donationDrives[currentDonationIndex].currentAmount || 0) / donationDrives[currentDonationIndex].targetAmount * 100, 100)}%`
                                }}
                              >
                              </div>}
                            </div>

                            <div className="flex justify-between my-1 text-[13px] md:text-[15px]">
                              <span className="font-medium">₱ {donationDrives[currentDonationIndex].currentAmount}</span>
                              <span className="text-gray-500">of ₱ {donationDrives[currentDonationIndex].targetAmount || 0}</span>
                            </div>
                          </div>
                        </div>  
                        <button
                          onClick={() => router.push(`/donationdrive-list`)}
                          className="cursor-pointer h-[30px] mx-4 md:mx-[20px] mb-[20px] rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-white"
                        >View More Donation Drives</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] md:text-[14px] mx-4 md:mx-[20px] my-[10px] italic text-gray-500">Donation Drive not found</p>
                  );
                })()}

                {/* if newsletter is a scholarship */}
                {newsLetter.category === "scholarship" && (() => {
                  return (
                    <div className="flex flex-col gap-[20px] px-4 md:px-[20px] mb-[20px]">                         
                      <p className="text-xl md:text-[24px] font-semibold">Scholarship</p>
                      <CollapseText text="Details about the scholarship will go here." maxChars={300} />
                      <button
                        onClick={() => router.push(`/scholarship`)}
                        className="w-full cursor-pointer h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-white"
                      >View More Scholarships</button>
                    </div>
                  );
                })()}

                {/* if newsletter is an event */}
                {newsLetter.category === "event" && (() => {
                  const event_array = events.filter(
                    (event: Event) => event.eventId === newsLetter.referenceId
                  ); // Using filter to get all matching events
                  
                  return (
                    <>
                      {/* Map over the event_array */}
                      <div>
                        {event_array.map((event: Event) => (
                        <div className="flex flex-col gap-[20px]" key={event.eventId}>
                          <div className="flex flex-col gap-[20px] px-4 md:px-[20px]">
                            <div>
                              <p className="text-xl md:text-[24px] font-semibold">{event.title}</p>
                              <p className="text-[13px] md:text-[15px] mt-2">{event.description}</p>
                            </div>
                          </div>
                        
                          {event.image === "" ? "" :
                            <img src={event.image}></img>
                          }
                          <>
                          
                          {event.needSponsorship === true && (
                          <>

                          {/* TODO: edit sponsorship details according to events */}
                          <div className="flex flex-col px-4 md:px-[20px]">
                            <div className="w-full">
                              <div className="flex justify-between mb-1">
                                <div className='flex gap-2 items-center'>
                                  <Users className='size-4 text-[#616161]'/>
                                  <span className="text-[13px] md:text-[15px] text-gray-500">{donationDrives[currentDonationIndex].donorList?.length || 0} Patrons</span>
                                </div>
                                {getDaysRemaining(donationDrives[currentDonationIndex].endDate) === "Not Available" ? "" : (
                                  <div className='flex gap-2 items-center'>
                                  <Clock className='size-4 text-[#616161]'/>
                                  <span className="text-[13px] md:text-[15px] text-gray-500">{getDaysRemaining(donationDrives[currentDonationIndex].endDate)}</span>
                                </div>)}
                              </div>

                              {/* progress bar */}
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden my-[5px]">
                                {donationDrives[currentDonationIndex].currentAmount === 0 ? (
                                  <div 
                                  className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center py-0.5 leading-none rounded-full" 
                                  style={{
                                    width: `${Math.min((donationDrives[currentDonationIndex].currentAmount || 0) / donationDrives[currentDonationIndex].targetAmount * 100, 100)}%`
                                  }}
                                >
                                </div>) : <div 
                                  className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" 
                                  style={{
                                    width: `${Math.min((donationDrives[currentDonationIndex].currentAmount || 0) / donationDrives[currentDonationIndex].targetAmount * 100, 100)}%`
                                  }}
                                >
                                </div>}
                              </div>

                              <div className="flex justify-between my-1 text-[13px] md:text-[15px]">
                                <span className="font-medium">₱ {donationDrives[currentDonationIndex].currentAmount}</span>
                                <span className="text-gray-500">of ₱ {donationDrives[currentDonationIndex].targetAmount || 0}</span>
                              </div>
                            </div>
                          </div>
                          </>)}
                          </>

                          <div className="px-4 md:px-[20px]">
                            <button
                              onClick={() => router.push(`/events`)}
                              className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-white"
                            >View More Events</button>
                          </div>
                        </div>
                        ))}
                      </div>
                    </>                        
                  );
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[350px] lg:sticky lg:top-23 lg:self-start flex flex-col items-center gap-[5px]">
          {/* Donation Sample */}
          {donationDrives.length > 0 && (
            <div className="border border-[#DADADA] w-full flex flex-row bg-white py-[5px] rounded-lg items-center">
              {/* left button (previous) */}
              <button 
              onClick={previousDonation} 
              className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      width="11"
                      height="11"
                      viewBox="0 0 10 10"
                      aria-hidden="true" 
                      strokeWidth={1.5}
                      className="-ml-0.5 rotate-180"
                    >
                      <path className="opacity-0 transition group-hover:opacity-100" d="M0 5h7" />
                      <path className="transition group-hover:translate-x-[3px]" d="M1 1l4 4-4 4" />
                    </svg>
                  </button>

                  {/* donation contents */}
                  <div className="w-full flex flex-col py-[10px] place-items-center">
                    {donationDrives[currentDonationIndex].image === '' ? '' : 
                    (<img src={donationDrives[currentDonationIndex].image} className="mb-[10px] h-[150px] object-cover w-full" alt="Donation drive" />)
                    }
                    <div className="w-full">
                      <p className="font-semibold mb-2">{donationDrives[currentDonationIndex].campaignName}</p>
                      <div className="flex justify-between mb-1">
                        <div className='flex gap-2 items-center'>
                          <Users className='size-4 text-[#616161]'/>
                          <span className="text-[13px] text-gray-500">{donationDrives[currentDonationIndex].donorList?.length || 0} Patrons</span>
                        </div>
                        {getDaysRemaining(donationDrives[currentDonationIndex].endDate) === "Not Available" ? "" : (
                          <div className='flex gap-2 items-center'>
                          <Clock className='size-4 text-[#616161]'/>
                          <span className="text-[13px] text-gray-500">{getDaysRemaining(donationDrives[currentDonationIndex].endDate)}</span>
                        </div>)}
                      </div>

                      {/* progress bar */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden my-[5px]">
                        {donationDrives[currentDonationIndex].currentAmount === 0 ? (
                          <div 
                          className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center py-0.5 leading-none rounded-full" 
                          style={{
                            width: `${Math.min((donationDrives[currentDonationIndex].currentAmount || 0) / donationDrives[currentDonationIndex].targetAmount * 100, 100)}%`
                          }}
                        >
                        </div>) : <div 
                          className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" 
                          style={{
                            width: `${Math.min((donationDrives[currentDonationIndex].currentAmount || 0) / donationDrives[currentDonationIndex].targetAmount * 100, 100)}%`
                          }}
                        >
                        </div>}
                      </div>

                      <div className="flex justify-between my-1 text-sm">
                        <span className="font-medium">₱ {donationDrives[currentDonationIndex].currentAmount}</span>
                        <span className="text-gray-500">of ₱ {donationDrives[currentDonationIndex].targetAmount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* right button (next) */}
                  <button 
                    onClick={nextDonation}
                    className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      width="11"
                      height="11"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="-mr-0.5"
                    >
                      <path className="opacity-0 transition group-hover:opacity-100" d="M0 5h7" />
                      <path className="transition group-hover:translate-x-[3px]" d="M1 1l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              )}
                              
              {/* Event Sample */}
              {events.length > 0 && (
                <div className="border border-[#DADADA] w-full flex flex-row bg-[#FFFFFF] py-[5px] rounded-lg items-center">
                  {/* left button (previous) */}
                  <button 
                    onClick={previousEvent}
                    className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      width="11"
                      height="11"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="-ml-0.5 rotate-180"
                    >
                      <path className="opacity-0 transition group-hover:opacity-100" d="M0 5h7" />
                      <path className="transition group-hover:translate-x-[3px]" d="M1 1l4 4-4 4" />
                    </svg>
                  </button>

                  {/* event contents */}
                  <div className="w-full flex flex-col bg-[#FFFFFF] rounded-lg py-[10px] place-items-center">
                    <div className="w-full">
                      <img src="/ICS2.jpg" className="mb-[10px] h-[150px] w-full object-cover" alt="Event" />
                      <div className="flex flex-col text-[15px]">
                        <p className="font-semibold">{events[currentEventIndex].title}</p>
                      </div>
                      
                      <div className="flex flex-col gap-[10px] content-stretch">
                        <div className="flex justify-between text-[13px] gap-[30px] mt-[10px]">
                          <div className='flex gap-2 items-center'>
                            <Calendar className="size-4 text-[#616161]"/>
                            <span className="text-[13px] text-gray-500">{new Date(events[currentEventIndex].date).toLocaleDateString()}</span>
                          </div>
                          
                          <div className='flex gap-2  items-center'>
                            <Clock className='size-4 text-[#616161]'/>
                            <span className="text-[13px] text-gray-500">{new Date(events[currentEventIndex].date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                          </div>
                        </div>

                        <div className="flex flex-row text-[13px] gap-[3px] items-center place-self-start">
                          <MapPin className="size-4 text-[#616161] "/>
                          <span className="text-[13px] text-gray-500">{events[currentEventIndex].location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* right button (next) */}
                  <button 
                    onClick={nextEvent}
                    className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none"
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      width="11"
                      height="11"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="-mr-0.5"
                    >
                      <path className="opacity-0 transition group-hover:opacity-100" d="M0 5h7" />
                      <path className="transition group-hover:translate-x-[3px]" d="M1 1l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              )}
              {/* End of event sample */}
            </div>
          </div>
        </div>
      );
  } else {
    return <LoadingPage />;
  }
}