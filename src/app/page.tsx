"use client";
import LoadingPage from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAlums } from "@/context/AlumContext";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { Announcement, Career, Education, JobOffering, NewsletterItem, WorkExperience } from "@/models/models";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PendingPage from "../components/PendingPage";
import RejectedPage from "../components/RejectedPage";
import { NewsLetterProvider, useNewsLetters } from "@/context/NewsLetterContext";
import { AnnouncementProvider, useAnnouncement } from "@/context/AnnouncementContext";
import { useJobOffer } from "@/context/JobOfferContext";
import CollapseText from '@/components/CollapseText';



const sortTypes = ["Latest", "Earliest"]; //sort types
const sortValues = ["nf", "of"]; //sort values (query params)
const SORT_TAGS = ["Earliest", "Latest"];

export default function Home() {
  const { user, loading, alumInfo, isAdmin, status } = useAuth();
  const { newsLetters } = useNewsLetters();
  const { announces } = useAnnouncement();
  const { jobOffers } = useJobOffer();
  const { userWorkExperience } = useWorkExperience();
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [latestFirst, setLatestFirst] = useState(true);

  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param

  function formatDate(timestamp: any) {
    if (!timestamp || !timestamp.seconds) return "Invalid Date";
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split("T")[0];
  }

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


  if (loading || (user && !alumInfo)) return <LoadingPage />;
  else if (!user && !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <h1 className="text-black text-[70px] font-bold">WELCOME, Guest!</h1>
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
        <div className="w-full px-[100px]">
          <div className="my-10 flex flex-row">
            {/* Profile Panel */}
            <div className="w-70 fixed top-28 left-[100px] h-auto flex flex-col items-center bg-[#FFFFFF] p-5 rounded-[10px] border border-[#DADADA]">
              <img
              src="https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                className="w-50 h-50 mb-5 object-cover object-top rounded-full border border-[#DADADA]"
              ></img>
              <p className="text-[20px] font-bold">
                {alumInfo!.lastName}, {alumInfo!.firstName}{" "}
              </p>
              <p className="text-[14px]">{alumInfo!.email}</p>
              <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 "></hr>
              <p className="text-[14px]"><i>Current based on {alumInfo!.address}</i></p>
              <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 "></hr>
              <div className="flex flex-col items-center">
                <p className="text-[14px]">Std. No. {alumInfo!.studentNumber}</p>
                <p className="text-[14px]">Graduated: {alumInfo!.graduationYear}</p>
              </div>
              <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 "></hr>
              <div className="text-[14px] border border-[#0856BA] text-[#0856BA] rounded-[5px] place-items-center px-[7px] py-[5px] flex flex-wrap">{alumInfo!.jobTitle}</div>
              <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 "></hr>
              <Button
                onClick={() => router.push(`/my-profile/${user?.uid}`)}
                className="w-full h-[30px] rounded-full text-[#FFFFFF] bg-[#0856BA] hover:bg-[#357BD6]"
              >
                View Profile
              </Button>
            </div>

            {/* Feed */}
            <div className="ml-[300px] mx-5  flex flex-col w-150 ">

              {/*sorting dropdown*/}
              {/* <div className="flex flex-row w-full justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-5 h-10 w-30 place-content-between items-center flex flex-row rounded-md bg-gray-800 text-[14px] font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700">
                    {selectedSort}
                    <ChevronDownIcon className="size-4 fill-white/60 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-30 justify-center bg-gray-600 border border-white/10 p-1 text-[14px] text-white">
                    {sortTypes.map((sortType, index) => (
                      <DropdownMenuItem key={sortType} asChild>
                        <button
                          onClick={() => {
                            setSelectedSort(sortType); // Update UI
                            setLatestFirst(sortType === "Latest"); // Optionally used elsewhere
                            handleSortChange(sortValues[index]); // Update URL param
                          }}
                          className={`w-full justify-center py-1.5 rounded-md ${
                            selectedSort === sortType ? "bg-white/10" : ""
                          }`}
                        >
                          {sortType}
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                </div> */}

                <div className="scroll-smooth">
                  {newsLetters.map((newsLetter: NewsletterItem, index: Key) => (
                    <div
                      key={index}
                      className="flex flex-col rounded-[10px] mb-[10px] w-150 h-auto p-[20px] bg-[#FFFFFF] border border-[#DADADA]"
                    >

                      {/* user info */}
                      <div className="flex flex-row mb-[20px]  gap-2 items-center">
                        <img
                          src="https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                          className="w-10 h-10 object-cover object-top rounded-full border border-[#DADADA]"
                        />
                        <p className="text-[18px]">
                          {alumInfo!.firstName} {alumInfo!.lastName}
                        </p>
                        <p className="text-[24px]"> &#xb7;</p>
                        <p className="text-[12px]">{formatDate(newsLetter.timestamp)}</p>
                      </div>

                      {/* if newsletter is announcement */}
                        {newsLetter.category === "announcement" && (() => {
                          const announcement = announces.find(
                            (announce: Announcement) => announce.announcementId === newsLetter.referenceId
                          );
                          return announcement ? (
                            <div className="flex flex-col gap-[30px]">
                              <div className="flex flex-col gap-[10px]">
                                <h1 className="text-[24px] font-bold">{announcement.title}</h1>
                                <CollapseText text={announcement.description + " "} maxChars={300} />
                              </div>
                              <img src="/ICS3.jpg" className="scale-107 w-full object-fill h-auto"></img>
                            </div>
                          ) : (
                            <p className="text-[14px] italic text-gray-500">Announcement not found</p>
                          );
                      })()}

                      {/* if newsletter is a job post */}
                      {newsLetter.category === "job_offering" && (() => {
                        const jobOffering = jobOffers.find(
                          (jobOffer: JobOffering) => jobOffer.jobId === newsLetter.referenceId
                        );
                        return jobOffering ? (
                          
                          <div className="flex flex-col gap-[30px]">
                            <div className="flex flex-col gap-[1px]">
                              <p className="text-[24px] font-semibold">
                                {jobOffering.position} 
                              </p>
                              <p className="text-[18px]">
                                {jobOffering.company} 
                              </p>
                            </div>
                            <div className="flex flex-col gap-[30px]">
                              <div className="flex flex-col gap-[10px]">
                                <div className="flex flex-row gap-[5px]">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[20px] w-auto">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                                  </svg>
                                  <p className="text-[15px]">
                                    {jobOffering.employmentType}
                                  </p>
                                  <p>&#xb7;</p>
                                  <p className="text-[15px]">
                                  {jobOffering.experienceLevel}</p>
                                </div>

                                <div className="flex flex-row gap-[5px]">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[20px] w-auto">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                  </svg>
                                  <p className="text-[15px]">
                                    {jobOffering.salaryRange}
                                  </p>
                                </div>
                              
                                <div className="text-[15px]"> 
                                  <div className="flex flex-row gap-[3px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[20px] w-auto">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                    </svg>
                                      Required skill(s):
                                  </div>

                                  <div className="pl-[25px]">
                                    {jobOffering.requiredSkill.map((skill: string) => (
                                    <ul className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-500"> 
                                      <li key={skill} className="flex items-center" >
                                      <svg className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                      </svg>
                                      {skill}
                                      </li>
                                    </ul>))}
                                  </div>
                                </div>
                              </div> 
                            
                            {/* job desc */}
                            <div>
                              <div className="flex flex-row items-center gap-[5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[20px] w-auto">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                                <p className="text-[20px] font-semibold">About the job</p>
                              </div>
                            
                              <p className="text-[15px] ml-[25px] text-justify">
                                {jobOffering.jobDescription}
                              </p>
                            </div> 

                            <div className="flex flex-row w-full gap-[10px]">
                              <button
                                onClick={() => router.push(`/joboffer-list`)}
                                className="w-full h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-[#FFFFFF]"

                              >View More Job Offers</button>
                              <button
                                onClick={() => router.push(`/joboffer-list`)}
                                className="w-full h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-[#0856BA] text-[#FFFFFF] text-[12px] hover:bg-[#FFFFFF] hover:text-[#0856BA]"
                              >Apply</button>
                            </div>          
                            </div>

                            
                            
                          </div>
                        ) : (
                          <p className="text-[14px] italic text-gray-500">Job offering not found</p>
                        );
                      })()}

                      {/* if newsletter is a donation */}
                      {newsLetter.category === "donation_drive" && (() => {
                        return (
                          <>
                            <h1 className="text-[24px] font-bold">Donation Drive</h1>
                            <p className="text-[15px] mt-2">Details about the Donation Drive will go here.</p>
                            <button
                              onClick={() => router.push(`/donationdrive-list`)}
                              className="w-full h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-[#FFFFFF]"
                            >View More Sponsorships</button>
                          </>
                        );
                      })()}

                      {/* if newsletter is a scholarship */}
                      {newsLetter.category === "scholarship" && (() => {
                        return (
                          <>
                            <h1 className="text-[24px] font-bold">Scholarship</h1>
                            <p className="text-[15px] mt-2">Details about the scholarship will go here.</p>
                            <button
                              onClick={() => router.push(`/sponsorship`)}
                              className="w-full h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-[#FFFFFF]"
                            >View More Sponsorships</button>
                          </>
                        );
                      })()}

                      {/* if newsletter is an event */}
                      {newsLetter.category === "event" && (() => {
                        return (
                          <>
                            <h1 className="text-[24px] font-bold">Event</h1>
                            <p className="text-[15px] mt-2">Details about the event will go here.</p>
                            <button
                              onClick={() => router.push(`/events`)}
                              className="w-full h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-[#FFFFFF]"

                            >View More Events</button>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

          {/*Sidebar*/}
          <div className="fixed right-[110px] w-[350px] flex flex-col  items-center gap-5 rounded-[10px] ">
            
            {/* Donation Sample */}
            <div className="border border-[#DADADA] w-full flex flex-row bg-[#FFFFFF] px-[10px] py-[10px] rounded-lg items-center ">
              {/* left button */}
              <button onClick={() => router.push(`/sponsorship`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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
                  <path
                    className="opacity-0 transition group-hover:opacity-100"
                    d="M0 5h7"
                  />
                  <path
                    className="transition group-hover:translate-x-[3px]"
                    d="M1 1l4 4-4 4"
                  />
                </svg>
              </button>

              {/* donation contents */}
              <div className="w-full flex flex-col px-[10px] py-[10px] place-items-center ">
                <img src="/ICS2.jpg" className="mb-[10px]"></img>
                <div className="mx-[6px] w-[230px]">
                  <div className="flex flex-row text-[13px] gap-1">
                    <p className="font-semibold">₱10,000</p> raised from <p className="font-semibold">₱30,000</p> total
                  </div>
                  <hr className="w-full h-2.5 bg-[#D7D7D7] rounded-sm md:my-3 "></hr>
                  <div className="flex flex-row text-[13px] gap-[10px] place-content-between">
                    <div className="flex flex-row items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[15px] w-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                      <div className="text-[13px] flex flex-row gap-1 items-center"><p className="font-semibold">250</p>patrons</div>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[15px] w-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <div className="flex flex-row text-[13px] gap-1"><p className="font-semibold">10</p> days left</div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full gap-[3px] mt-3">
                      <button
                          onClick={() => router.push(`/sponsorship`)}
                          className="w-full h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-[#FFFFFF]"

                      >View More</button>                          
                  </div> 
                </div>
              </div>
              
              {/* right button */}
              <button onClick={() => router.push(`/sponsorship`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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
                  <path
                    className="opacity-0 transition group-hover:opacity-100"
                    d="M0 5h7"
                  />
                  <path
                    className="transition group-hover:translate-x-[3px]"
                    d="M1 1l4 4-4 4"
                  />
                </svg>
              </button>            
              </div>
              {/* End of donation sample */}
                
            {/* Event Sample */}
            <div className="border border-[#DADADA] w-full flex flex-row bg-[#FFFFFF] px-[10px] rounded-lg items-center">
              <button onClick={() => router.push(`/sponsorship`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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
                    <path
                      className="opacity-0 transition group-hover:opacity-100"
                      d="M0 5h7"
                    />
                    <path
                      className="transition group-hover:translate-x-[3px]"
                      d="M1 1l4 4-4 4"
                    />
                  </svg>
                </button>

                <div className="w-full flex flex-col bg-[#FFFFFF] rounded-lg py-[20px] place-items-center">
                  <div className="mx-[6px] w-[230px]">
                  {/* <img src="/ICS2.jpg" className="mb-[10px]"></img> */}
                    <div className="flex flex-row text-[15px]">
                      <p className="font-semibold">Event Name</p>
                    </div>
                    <div className="flex flex-row text-[13px] gap-[10px] place-content-between mt-[10px]">
                      <div className="flex flex-row items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[15px] w-auto">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                      <p className="text-[13px] flex flex-row gap-1 items-center font-semibold">January 1, 2025</p>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[15px] w-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                        <p className="flex flex-row text-[13px] gap-1 font-semibold">3:00 PM</p>
                  </div>
                </div>
                <div className="flex flex-row text-[13px] gap-[3px] place-self-center my-[2px]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-[15px] w-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <p className="text-[13px] font-semibold">ICS Mega Hall</p>
                </div>
                <div className="flex flex-col w-full gap-[3px] mt-3">
                    <button
                      onClick={() => router.push(`/sponsorship`)}
                      className="w-full h-[30px] rounded-full border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px] hover:bg-[#0856BA] hover:text-[#FFFFFF]"
                    >View More</button>                           
                  </div> 
                </div>
              </div>

              <button onClick={() => router.push(`/sponsorship`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-[14px] font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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
                  <path
                    className="opacity-0 transition group-hover:opacity-100"
                    d="M0 5h7"
                  />
                  <path
                    className="transition group-hover:translate-x-[3px]"
                    d="M1 1l4 4-4 4"
                  />
                </svg>
              </button>               
            </div>
            {/* End of event sample */}

            </div>
          </div>
        </div>
      );
  } else {
    return <LoadingPage />;
  }
}