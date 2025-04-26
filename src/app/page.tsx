"use client";
import LoadingPage from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";
import Link from "next/link";
import { useNewsLetters } from "@/context/NewsLetterContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PendingPage from "../components/PendingPage";
import RejectedPage from "../components/RejectedPage";

const sortTypes = ["Latest", "Earliest"]; //sort types
const sortValues = ["nf", "of"]; //sort values (query params)
const SORT_TAGS = ["Earliest", "Latest"];

export default function Home() {
  const { user, loading, alumInfo, isAdmin, status } = useAuth();
  const { userWorkExperience } = useWorkExperience();
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [latestFirst, setLatestFirst] = useState(true);

  const { newsLetters, isLoading } = useNewsLetters();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
  

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

  if (loading || (user && !alumInfo)) return <LoadingPage />;
  else if (!user && !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center bg-[#EAEAEA]">
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
  }

  return (
    <div className="w-full">

      {/* sorting button */}
      <div className="flex justify-end mr-[500px] my-5">
      <DropdownMenu>
        <DropdownMenuTrigger className="px-5 h-10 w-30 place-content-between items-center flex flex-row rounded-md bg-gray-800 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-700">
          {selectedSort}
          <ChevronDownIcon className="size-4 fill-white/60 ml-2" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-30 justify-center bg-gray-600 border border-white/10 p-1 text-sm text-white">
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
      </div>
          
      <div className="place-self-center mx-[200px]  flex flex-row ">
          {/* Profile Panel */}
          <div className="w-70 h-full flex flex-col bg-[#EAEAEA] items-center p-5 rounded-lg">
            <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
              className='w-50 h-50 mb-5 object-cover object-top rounded-full border border-black'></img>
            <p className="text-[20px] font-bold">{alumInfo!.lastName}, {alumInfo!.firstName} </p>
            <hr className="w-50 h-[1px] bg-[#FFFFFF] rounded-sm md:my-3 dark:bg-[gray-300]"></hr>
            <p className="text-[14px]"><i>Currently based in {alumInfo!.address}</i></p>
            <hr className="w-50 h-[1px] bg-[#FFFFFF] rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <div className="flex flex-col items-center">
            <p className="text-[14px]">{alumInfo!.fieldOfWork}</p>
            <p className="text-[14px]">Graduated: {alumInfo!.graduationYear}</p>
            {/* <p className="text-[14px]">Std. No. {alumInfo!.studentNumber}</p> */}
            </div>
            <hr className="w-50 h-[1px] bg-[#FFFFFF] rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <p className="text-sm">{alumInfo!.jobTitle}</p>
            {/* {userWorkExperience.map(
            (workExperience: WorkExperience, index: any) => (
              <div key={index} className="p-1">
                <p className="text-black text-[15px] font-bold">
                  {workExperience.details}
                </p>
              </div>
            )
          )} */}
            <hr className="w-50 h-[0.7px] bg-[#FFFFFF] rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <Button
                onClick={() => router.push(`/my-profile/${user?.uid}`)}
                className="w-full rounded-4xl bg-[#0856BA] text-[#FFFFFF]"
            >View Profile</Button> 
            </div>

          {/* Feed */}
          <div className="mx-5 flex flex-col w-150">
            
          <div className="mb-5 ">
            {newsLetters.map((newsLetter, index) => (
              <Card key={index} className="flex flex-col rounded-lg mb-5 w-150 h-auto p-5 bg-[#EAEAEA]">
                <div className="flex flex-row gap-2 items-center ">
                <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
                 className='w-10 h-10 object-cover object-top rounded-full border border-black' />
                <p className="text-[18px]">{alumInfo!.firstName}  {alumInfo!.lastName}</p>
                <p className="text-xl"> &#xb7;</p>
                <p className="text-xs">
                  {newsLetter.dateSent
                    .toDate()
                    .toISOString()
                    .slice(0, 10)
                    .replaceAll("-", "/")}
                </p>
                </div>
                <div>
                <p className="text-[24px] font-semibold my-0 p-0">Headline</p>
                <p>Category: {newsLetter.category[0]}</p>
                </div>
                <p className="p-0 m-0">Announcement Details</p>

                {/* TODO: should handle category changes (Jobs, Donations, Invitations) */}
                {/* <div className="flex flex-row w-full">
                  <button
                      onClick={() => router.push(`/joboffer-list`)}
                      className="w-full rounded-4xl border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA]"
                  >View More Jobs</button>                          
                </div> */}
              </Card>
            ))}

        
            
          </div>
          </div>

          {/*Sidebar*/}
          <div className="w-[350px] flex flex-col  items-center gap-5 rounded-lg ">
            
            {/* Donation Sample */}
            <div className="w-full flex flex-row bg-[#EAEAEA] px-[10px] py-[10px] rounded-lg items-center">
              {/* left button */}
              <button onClick={() => router.push(`/sponsorship`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-sm font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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

              <div className="w-full flex flex-col px-[10px] py-[10px] place-items-center">
                {/* <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
                    className='w-full h-40 mb-5 object-cover object-center' /> */}
                {/* <p className="text-sm place-self-center"><b>₱10,000</b> raised from <b>₱30,000</b> total</p> */}
                <div className="mx-[6px] w-[230px]">
                <div className="flex flex-row text-[13px] gap-1"><p className="font-semibold">₱10,000</p> raised from <p className="font-semibold">₱30,000</p> total</div>
                <hr className="w-full h-2.5 bg-gray-300 rounded-sm md:my-3 dark:bg-gray-300"></hr>
                <div className="flex flex-row text-[13px] gap-[10px] place-content-between">
                  <div className="flex flex-row items-center gap-1">
                    <img src="https://icons.veryicon.com/png/o/miscellaneous/huaxi-icon/account-30.png"
                    className="h-4 w-auto" />
                    <div className="text-[13px] flex flex-row gap-1 items-center"><p className="font-semibold">250</p>patrons</div>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <img src="https://www.svgrepo.com/show/32021/clock.svg"
                    className="h-3.5 w-auto"/>
                    <div className="flex flex-row text-[13px] gap-1"><p className="font-semibold">10</p> days left</div>
                  </div>
                </div>
                <div className="flex flex-col w-full gap-[3px] mt-3">
                    <button
                        onClick={() => router.push(`/sponsorship`)}
                        className="w-full rounded-4xl border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px]"
                    >View More</button>                          
                  </div> 
                </div>
              </div>
              
              {/* right button */}
              <button onClick={() => router.push(`/sponsorship`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-sm font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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
            <div className="w-full flex flex-row bg-[#EAEAEA] px-[10px] py-[10px] rounded-lg items-center">
              <button onClick={() => router.push(`/sponsorship`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-sm font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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

                <div className="w-full flex flex-col bg-[#EAEAEA] rounded-lg py-[10px] place-items-center">
                {/* <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
                    className='w-full h-40 mb-5 object-cover object-center' /> */}
                {/* <p className="text-sm place-self-center"><b>₱10,000</b> raised from <b>₱30,000</b> total</p> */}
                <div className="mx-[6px] w-[230px]">
                <div className="flex flex-row text-[13px]"><p className="font-semibold">Event Name</p></div>
                <div className="flex flex-row text-[13px] gap-[10px] place-content-between mt-[10px]">
                  <div className="flex flex-row items-center gap-1">
                    <img src="https://icons.veryicon.com/png/o/miscellaneous/basic-icon-1/calendar-309.png"
                    className="h-4 w-auto" />
                    <div className="text-[13px] flex flex-row gap-1 items-center">January 1, 2025</div>
                  </div>
                  <div className="flex flex-row items-center gap-1">
                    <img src="https://www.svgrepo.com/show/32021/clock.svg"
                    className="h-3.5 w-auto"/>
                    <div className="flex flex-row text-[13px] gap-1"><p className="font-semibold">3:00 PM</p></div>
                  </div>
                </div>
                <div className="flex flex-row text-[13px] gap-[10px] place-self-center my-[2px]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Location_pin_icon.svg/475px-Location_pin_icon.svg.png?20230306015422"
                    className="h-3 w-auto"/>
                    <p className="text-2xs">ICS Mega Hall</p>
                </div>
                <div className="flex flex-col w-full gap-[3px] mt-3">
                    <button
                        onClick={() => router.push(`/events`)}
                        className="w-full rounded-4xl border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA] text-[12px]"
                    >View More</button>                           
                  </div> 
                </div>
              </div>

              <button onClick={() => router.push(`/events`)} className="group inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md  from-slate-950 to-slate-900 py-2.5 px-3.5 sm:text-sm font-medium text-[#0856BA] transition-all duration-100 ease-in-out hover:to-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none">
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
}
