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
      <div className="mx-20 my-10 flex flex-row">
          
          {/* Profile Panel */}
          <div className="w-70 h-120 flex flex-col items-center bg-gray-200 p-5 rounded-lg ">
            <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
              className='w-50 h-50 mb-5 object-cover object-top rounded-full border border-black'></img>
            <p className=" text-xl font-bold">{alumInfo!.lastName}, {alumInfo!.firstName} </p>
            <p className="text-xs">{alumInfo!.email}</p>
            <hr className="w-50 h-0.5 bg-gray-300 rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <div className="flex flex-col items-center">
              <p className="text-sm">Graduated: {alumInfo!.graduationYear}</p>
              <p className="text-sm">Std. No. {alumInfo!.studentNumber}</p>
            </div>
            <hr className="w-50 h-0.5 bg-gray-300 rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <p className="text-sm">{alumInfo!.jobTitle}</p>
            <hr className="w-50 h-0.5 bg-gray-300 rounded-sm md:my-3 dark:bg-gray-300"></hr>
            <Button
                onClick={() => router.push(`/my-profile/${user?.uid}`)}
                className="w-full border border-black rounded-4xl"
            >Show Profile</Button> 
            </div>

          {/* Feed */}
          <div className="mx-5 flex flex-col w-150">

            {/*sorting dropdown*/}
            <div className='flex flex-row w-full justify-end'>
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
            
          <div className="my-5">
            {isLoading && <h1>Loading...</h1>}
            {newsLetters.map((newsLetter, index) => (
              <Card key={index} className="flex flex-col rounded-lg mb-5 w-150 h-auto p-5 bg-gray-100">
                <div className="flex flex-row gap-2 mb-5 items-center">
                <img src='https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg' 
                 className='w-10 h-10 object-cover object-top rounded-full border border-black' />
                <p className="text-lg">{alumInfo!.firstName}  {alumInfo!.lastName}</p>
                <p className="text-xl"> &#xb7;</p>
                <p className="text-xs">
                  {newsLetter.dateSent
                    .toDate()
                    .toISOString()
                    .slice(0, 10)
                    .replaceAll("-", "/")}
                </p>
                </div>
                <h1>Category: {newsLetter.category[0]}</h1>
                <p>Announcement Details</p>
              </Card>
            ))}
          </div>
          </div>

          {/* Donations & Events Sidebar*/}
          <div className="w-70 h-120 flex flex-col items-center bg-gray-200 p-5 rounded-lg ">
           
          </div>

      </div>
    </>
  );
}
