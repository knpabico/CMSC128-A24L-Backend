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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { Key, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PendingPage from "../components/PendingPage";
import RejectedPage from "../components/RejectedPage";
import { NewsLetterProvider, useNewsLetters } from "@/context/NewsLetterContext";
import { AnnouncementProvider, useAnnouncement } from "@/context/AnnouncementContext";
import { useJobOffer } from "@/context/JobOfferContext";

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
        <>
          <div className="mx-20 my-10 flex flex-row">
            {/* Profile Panel */}
            <div className="w-70 h-120 flex flex-col items-center bg-gray-200 p-5 rounded-lg ">
              <img
                src="https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                className="w-50 h-50 mb-5 object-cover object-top rounded-full border border-black"
              ></img>
              <p className=" text-xl font-bold">
                {alumInfo!.lastName}, {alumInfo!.firstName}{" "}
              </p>
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
              >
                Show Profile
              </Button>
            </div>

            {/* Feed */}
            <div className="mx-5 flex flex-col w-150">
              {/*sorting dropdown*/}
              <div className="flex flex-row w-full justify-end">
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
                <div className="my-5"></div>

                <div className="my-5">
                  {newsLetters.map((newsLetter: NewsletterItem, index: Key) => (
                    <Card
                      key={index}
                      className="flex flex-col rounded-lg mb-5 w-150 h-auto p-5 bg-gray-100"
                    >
                      <div className="flex flex-row gap-2 mb-5 items-center">
                        <img
                          src="https://i.pinimg.com/736x/14/e3/d5/14e3d56a83bb18a397a73c9b6e63741a.jpg"
                          className="w-10 h-10 object-cover object-top rounded-full border border-black"
                        />
                        <p className="text-lg">
                          {alumInfo!.firstName} {alumInfo!.lastName}
                        </p>
                        <p className="text-xl"> &#xb7;</p>
                        <p className="text-xs">{formatDate(newsLetter.timestamp)}</p>
                      </div>
                        {newsLetter.category === "announcement" && (() => {
                          const announcement = announces.find(
                            (announce: Announcement) => announce.announcementId === newsLetter.referenceId
                          );
                          return announcement ? (
                            <>
                              <h1 className="text-2xl font-bold">{announcement.title}</h1>
                              <p className="text-base mt-2">{announcement.description}</p>
                            </>
                          ) : (
                            <p className="text-sm italic text-gray-500">Announcement not found</p>
                          );
                      })()}
                      {newsLetter.category === "job_offering" && (() => {
                        const jobOffering = jobOffers.find(
                          (jobOffer: JobOffering) => jobOffer.jobId === newsLetter.referenceId
                        );
                        return jobOffering ? (
                          <>
                          <h1 className="text-2xl font-bold">{jobOffering.title}</h1>
                          <p className="text-base mt-2">
                            <strong>Company:</strong> {jobOffering.company}
                          </p>
                          <p className="text-base mt-2">
                            <strong>Position:</strong> {jobOffering.position}
                          </p>
                          <p className="text-base mt-2">
                            <strong>Salary Range:</strong> {jobOffering.salaryRange}
                          </p>
                          <p className="text-base mt-2">
                            <strong>Required Skills:</strong> {jobOffering.requiredSkill.join(", ")}
                          </p>
                          <p className="text-base mt-2">
                            <strong>Experience Level:</strong> {jobOffering.experienceLevel}
                          </p>
                          <p className="text-base mt-2">
                            <strong>Employment Type:</strong> {jobOffering.employmentType}
                          </p>
                          <p className="text-base mt-2">
                            <strong>Job Description:</strong> {jobOffering.jobDescription}
                          </p>
                          </>
                        ) : (
                          <p className="text-sm italic text-gray-500">Job offering not found</p>
                        );
                      })()}
                      {newsLetter.category === "donation_drive" && (() => {
                        return (
                          <>
                            <h1 className="text-2xl font-bold">Donation Drive</h1>
                            <p className="text-base mt-2">Details about the Donation Drive will go here.</p>
                          </>
                        );
                      })()}
                      {newsLetter.category === "scholarship" && (() => {
                        return (
                          <>
                            <h1 className="text-2xl font-bold">Scholarship</h1>
                            <p className="text-base mt-2">Details about the scholarship will go here.</p>
                          </>
                        );
                      })()}
                      {newsLetter.category === "event" && (() => {
                        return (
                          <>
                            <h1 className="text-2xl font-bold">Event</h1>
                            <p className="text-base mt-2">Details about the event will go here.</p>
                          </>
                        );
                      })()}
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Donations & Events Sidebar*/}
            <div className="w-70 h-120 flex flex-col items-center bg-gray-200 p-5 rounded-lg "></div>
          </div>
        </>
      );
  } else {
    return <LoadingPage />;
  }
}
