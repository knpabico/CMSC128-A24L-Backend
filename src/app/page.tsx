"use client";
import LoadingPage from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";
import Link from "next/link";
import { useNewsLetters } from "@/context/NewsLetterContext";
import { useRouter, useSearchParams } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react";
import { Card } from "@/components/ui/card";



const sortTypes = ["Latest", "Earliest"]; //sort types
const sortValues = ["nf", "of"]; //sort values (query params)
const SORT_TAGS = ["Earliest", "Latest"];


export default function Home() {
  const { user, loading, alumInfo } = useAuth();
  const { userWorkExperience } = useWorkExperience();
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [latestFirst, setLatestFirst] = useState(true);


  const { newsLetters, isLoading } = useNewsLetters();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
  

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
  if (!user) {
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
  }

  return (
    <>
      <div className="flex flex-row justify-end mr-[450px] my-5">
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
          
      <div className="place-self-center mx-[200px] mb-10 flex flex-row">
          {/* Profile Panel */}
          <div className="w-70 h-full flex flex-col bg-[#FFFFFF] items-center p-5 rounded-lg ">
            <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
              className='w-50 h-50 mb-5 object-cover object-top rounded-full border border-black'></img>
            <p className="text-[20px] font-bold">{alumInfo!.lastName}, {alumInfo!.firstName} </p>
            <hr className="w-50 h-[1px] bg-[#D7D7D7] rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <p className="text-[14px]"><i>Currently based in {alumInfo!.address}</i></p>
            <hr className="w-50 h-[1px] bg-[#D7D7D7] rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <div className="flex flex-col items-center">
              <p className="text-[14px]">Graduated: {alumInfo!.graduationYear}</p>
              <p className="text-[14px]">Std. No. {alumInfo!.studentNumber}</p>
            </div>
            <hr className="w-50 h-[1px] bg-[#D7D7D7] rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <p className="text-sm">{alumInfo!.jobTitle}</p>
            <hr className="w-50 h-[0.7px] bg-[#D7D7D7] rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <Button
                onClick={() => router.push(`/my-profile/${user?.uid}`)}
                className="w-full rounded-4xl bg-[#0856BA]"
            >View Profile</Button> 
            </div>

          {/* Feed */}
          <div className="mx-5 flex flex-col w-150">
            
          <div className="mb-5">
            {isLoading && <h1>Loading...</h1>}
            {newsLetters.map((newsLetter, index) => (
              <Card key={index} className="flex flex-col rounded-lg mb-5 w-150 h-auto p-5 bg-[#FFFFFF]">
                <div className="flex flex-row gap-2 items-center">
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
                <p>Category: {newsLetter.category[0]}</p>
                <div>
                <p className="text-[24px] font-semibold my-0 p-0">Headline</p>
                </div>
                <p className="p-0 m-0">Announcement Details</p>

                {/* TODO: should handle category changes (Jobs, Donations, Invitations) */}
                <div className="flex flex-row w-full gap-[10px]">
                  <Button
                      onClick={() => router.push(`/joboffer-list`)}
                      className="w-full rounded-4xl border border-[1px] border-[#0856BA] bg-[#FFFFFF] text-[#0856BA]"
                  >View More Jobs</Button>               
                  <Button
                      onClick={() => router.push(`/`)}
                      className="w-full rounded-4xl bg-[#0856BA]"
                  >Apply</Button>             
                </div>
              </Card>
            ))}
            
          </div>
          </div>
          {/* Donations & Events Sidebar*/}
          <div className="w-70 h-full p-3 flex flex-col items-center bg-[#FFFFFF] rounded-lg ">

            {/* Donation Sample */}
            <div className="w-full flex flex-col mb-10">
              <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
                  className='w-full h-40 mb-5 object-cover object-center' />
              {/* <p className="text-sm place-self-center"><b>₱10,000</b> raised from <b>₱30,000</b> total</p> */}
              <div className="mx-[6px]">
              <div className="flex flex-row text-[13px] gap-1"><p className="font-semibold">₱10,000</p> raised from <p className="font-semibold">₱30,000</p> total</div>
              <hr className="w-full h-2.5 bg-gray-300 rounded-sm md:my-3 dark:bg-gray-300"></hr>
              <div className="flex flex-row text-[13px] gap-[10px]">
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
              </div>

            </div>

            {/* Event Sample */}
            <div className="w-full flex flex-col">
              <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
                    className='w-full h-40 mb-5 object-cover object-center' />
              <p className="text-[17px] ml-[10px]">Event Name</p>
              <div className="flex flex-row text-[13px] place-content-between m-3">
                <div className="flex flex-row gap-1 items-center">
                  <img src="https://icons.veryicon.com/png/o/miscellaneous/basic-icon-1/calendar-309.png"
                  className="h-3 w-auto" />
                  <p className="text-2xs">03-31-2025</p>
                </div>
                <div className="flex flex-row gap-1 items-center">
                  <img src="https://www.svgrepo.com/show/32021/clock.svg"
                  className="h-3 w-auto"/>
                  <p className="text-2xs">3:00 PM</p>
                </div>
                <div className="flex flex-row gap-1 items-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Location_pin_icon.svg/475px-Location_pin_icon.svg.png?20230306015422"
                  className="h-3 w-auto"/>
                  <p className="text-2xs">ICSMH</p>
                </div>
              </div>         
            </div>
          </div>
      </div>
    </>
  );
}
