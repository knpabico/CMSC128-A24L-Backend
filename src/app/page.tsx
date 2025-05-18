"use client";
import LoadingPage from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAlums } from "@/context/AlumContext";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import {
  Alumnus,
  Announcement,
  Career,
  Education,
  JobOffering,
  NewsletterItem,
  WorkExperience,
  Event,
  Donation,
  DonationDrive,
  Scholarship
} from "@/models/models";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDownIcon,
  ClipboardList,
  Clock,
  GraduationCap,
  Map,
  MapPin,
  PhilippinePeso,
  Users,
} from "lucide-react";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
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
import { useScholarship } from "@/context/ScholarshipContext";
import { log } from "console";
import { Oswald } from "next/font/google";
import { ListItem } from "@mui/material";
import { useEducation } from "@/context/EducationContext";
import JobOffers from "./(pages)/(alumni)/joboffer-list/page";
import Footer from "@/components/Footer";
import Landing from "@/components/Landing";

const sortTypes = ["Latest", "Oldest"]; //sort types
const sortValues = ["nf", "of"]; //sort values (query params)
const SORT_TAGS = ["Oldest", "Latest"];

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
  const { scholarships } = useScholarship();
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [latestFirst, setLatestFirst] = useState(true);

  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param

  const [currentDonationIndex, setCurrentDonationIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const { userEducation } = useEducation();
  const [filteredEducation, setFilteredEducation] = useState<Education[]>([]);
  const [acceptedJobs, setAcceptedJobs] = useState<JobOffering[]>([]);

  useEffect(() => {
    const filtered = jobOffers.filter(
      (job: {status: string}) => job.status === "Accepted" || job.status === "Closed"
    );
    setAcceptedJobs(filtered);
  }, [jobOffers]);

  useEffect(() => {
    if (user?.uid) {
      const filtered = userEducation.filter(
        (edu: Education) => edu.alumniId === user.uid
      );
      setFilteredEducation(filtered);
    }
    console.log("User Education", userEducation);
  }, [user?.uid, userEducation]); 


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

  const [images, setImages] = useState([
    // Example images - replace with your own or start with empty array
    { id: 1, src: "/api/placeholder/800/500", alt: "Image 1" },
    { id: 2, src: "/api/placeholder/800/500", alt: "Image 2" },
    { id: 3, src: "/api/placeholder/800/500", alt: "Image 3" },
    { id: 4, src: "/api/placeholder/800/500", alt: "Image 4" },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Handle next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Handle previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance slides every 3 seconds for endless slideshow effect
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Calculate positions for each image for endless carousel effect
  const getImageStyle = (index) => {
    // Handle wrapping for endless effect
    const totalImages = images.length;
    if (totalImages <= 1) {
      return {
        transform: "translateX(0) scale(1)",
        zIndex: 30,
        opacity: 1,
      };
    }

    // Calculate relative position with wrapping
    let relativePos = (index - currentIndex + totalImages) % totalImages;

    // Adjust to have values like: -2, -1, 0, 1, 2 instead of 0,1,2,3,4
    if (relativePos > totalImages / 2) {
      relativePos = relativePos - totalImages;
    }

    // Apply styles based on position
    const absoluteRelativePos = Math.abs(relativePos);

    // Center (highlighted) image
    if (relativePos === 0) {
      return {
        transform: "translateX(0) scale(1)",
        zIndex: 30,
        opacity: 1,
      };
    }

    // Side images (closer = larger, further = smaller)
    const offset = relativePos * 20; // -20%, -40%, 20%, 40%, etc.
    const scale = 1 - absoluteRelativePos * 0.2; // 0.8, 0.6, etc.
    const zIndex = 20 - absoluteRelativePos;
    const opacity = 1 - absoluteRelativePos * 0.3; // 0.7, 0.4, etc.

    return {
      transform: `translateX(${offset}%) scale(${scale})`,
      zIndex,
      opacity,
    };
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          src: e.target.result,
          alt: `Image ${images.length + 1}`,
        };
        setImages([...images, newImage]);
        setCurrentIndex(images.length); // Set focus to the new image
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = (id) => {
    const newImages = images.filter((img) => img.id !== id);
    setImages(newImages);

    // Adjust current index if needed
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(0, newImages.length - 1));
    }
  };

  // Start upload process
  const startUpload = () => {
    setIsUploading(true);
  };

  // Cancel upload
  const cancelUpload = () => {
    setIsUploading(false);
  };

  const carouselImages = [
    {
      src: "/images/alumni-1.jpg", // Update with your actual image paths
      alt: "Alumni gathering at reunion",
    },
    {
      src: "/images/campus-life.jpg",
      alt: "Campus life at ICS",
    },
    {
      src: "/images/graduation.jpg",
      alt: "Graduation ceremony",
    },
    {
      src: "/images/alumni-event.jpg",
      alt: "Alumni networking event",
    },
    {
      src: "/images/research-lab.jpg",
      alt: "Research laboratory at ICS",
    },
    {
      src: "/images/alumni-success.jpg",
      alt: "Alumni success story",
    },
  ];

  function adminHeader(announcement) {
    // Use announcement author's image if available, fallback to ICS logo
    const authorPic = announcement.authorImage && announcement.authorImage !== "" 
      ? announcement.authorImage 
      : "/ics-logo.jpg";
    
    // Use announcement author's name if available, fallback to ICS
    const authorName = announcement.authorName && announcement.authorName !== "" 
      ? announcement.authorName 
      : "Institute of Computer Science";
      
    return (
      <>
        <img
          src={authorPic}
          className="w-10 h-10 object-cover object-top rounded-full border border-[#DADADA]"
          alt={authorName}
        />
        <p className="text-[16px]">{authorName}</p>
      </>
    );
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
      <div>
        <Landing />

        <div
          className="flex flex-col gap-8 bg-[#EBF4FF]"
          style={{ padding: "50px 10% 5% 10%" }}
        >
          <div className={`font-bold text-3xl text-[var(--blue-900)]`}>
            News & Announcements
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {announces.map((item: Announcement) => (
              <Link
                href={`/announcements/${item.announcementId}`}
                key={item.announcementId}
                className="bg-white rounded-xl overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 h-full"
              >
                <div className="w-full h-40 bg-pink-400 overflow-hidden border-b-gray-300 border-b-1">
                  <img
                    src={
                      item.image === ""
                        ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        : item.image
                    }
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-grow">
                  <div className="text-xs text-gray-500">
                    {formatDate(item.datePosted)}
                  </div>
                  <div className="font-bold text-md line-clamp-2">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-700 line-clamp-3">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Footer />
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
            <div className="w-full lg:w-64 lg:sticky lg:top-23 lg:self-start mb-5 lg:mb-0 text-center flex flex-col items-center bg-white p-5 rounded-[10px] border border-[#DADADA] max-h-[calc(100vh-100px)] overflow-y-auto">
              <img
                src={
                  alumInfo!.image === ""
                    ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    : alumInfo!.image
                }
                className="w-20 h-20 md:w-40 md:h-40 lg:w-50 lg:h-50 mb-5 object-cover object-top rounded-full border border-[#DADADA]"
              ></img>
              <p className="text-lg md:text-[20px] text-center font-bold justify-self-center">
                {alumInfo!.lastName}, {alumInfo!.firstName} {alumInfo!.suffix ? alumInfo!.suffix : ""}
              </p>
              <p className="text-xs md:text-[14px]">{alumInfo!.email}</p>
              <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
              <div className="text-xs md:text-[14px] text-center wrap-break-word px-2">
                <i>
                  Currently based on {alumInfo!.address[1]}, {alumInfo!.address[2]}
                </i>
              </div>
              <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
              <div className="flex flex-col items-center gap-3">
                {/* <p className="text-xs md:text-[14px]">
                  Std. No. {alumInfo!.studentNumber}
                </p> */}
                  {filteredEducation.map(edu => (
                    <div key={edu.educationId} className="text-xs md:text-sm items-center justify-items-center">
                      <div className="flex flex-row items-center gap-3"><GraduationCap className="size-4"/><span>{edu.major}</span></div>
                      {/* <p>Graduated: {edu.yearGraduated}</p> */}
                      <p  className="text-xs md:text-[13px]">{edu.university}</p>
                    </div>
                  ))}
                
              </div>
              {alumInfo!.fieldOfInterest[0] &&    
                <>           
                <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                  {alumInfo!.fieldOfInterest.map((interest) => (
                    <div
                      key={interest}
                      className="text-xs md:text-[14px] text-center wrap-normal border border-[#0856BA] text-[#0856BA] rounded-[5px] place-items-center px-[7px] py-[5px]"
                    >
                      {interest}
                    </div>
                  ))}
                </div>
                </>
              }
              <hr className="w-full h-0.5 bg-[#D7D7D7] md:my-3 opacity-25"></hr>
              <Button
                onClick={() => router.push(`/my-profile/${user?.uid}`)}
                className="w-full h-[30px] cursor-pointer rounded-full text-white bg-[#0856BA] hover:bg-blue-600"
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
                        src={
                          newsLetter.category === "announcement" ||
                          newsLetter.category === "event" ||
                          newsLetter.category === "scholarship" ||
                          newsLetter.category === "donation_drive"
                            ? "/ics-logo.jpg"
                            : newsLetter.category === "job_offering"
                            ? (() => {
                              const jobOffering = jobOffers.find(
                                (jobOffer: JobOffering) =>
                                  jobOffer.jobId === newsLetter.referenceId
                              );
                             if (!jobOffering || jobOffering.alumniId === "Admin") {
                                if (jobOffering.image) return jobOffering.image
                                else return "/ics-logo.jpg";
                              } else 
                                if (jobOffering.image) return jobOffering.image 
                                else return jobOffering
                                && alums.find(
                                    (alum: Alumnus) =>
                                      alum.alumniId === jobOffering.alumniId
                                  )?.image
                            })()
                          : ""}
                        className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] object-cover object-top rounded-full border border-[#DADADA]"
                      />
                      <p className="text-sm md:text-[16px]">
                        {newsLetter.category === "announcement" ||
                        newsLetter.category === "event" ||
                        newsLetter.category === "scholarship" ||
                        newsLetter.category === "donation_drive"
                          ? "Institute of Computer Science"
                          : newsLetter.category === "job_offering"
                          ? (() => {
                              const jobOffering = jobOffers.find(
                                (jobOffer: JobOffering) =>
                                  jobOffer.jobId === newsLetter.referenceId
                              );
                              if (!jobOffering || jobOffering.alumniId === "Admin") {
                                return "Institute of Computer Science";
                              } else{
                                return jobOffering
                                && alums.find(
                                    (alum: Alumnus) =>
                                      alum.alumniId === jobOffering.alumniId
                                  )?.firstName +
                                    " " +
                                    alums.find(
                                      (alum: Alumnus) =>
                                        alum.alumniId === jobOffering.alumniId
                                    )?.lastName || "Unknown Alumni"
                              };
                            })()
                          : ""}
                      </p>
                      <p className="text-lg md:text-[24px]"> &#xb7;</p>
                      <p className="text-[10px] md:text-[12px]">
                        {formatDate(newsLetter.timestamp)}
                      </p>
                    </div>

                   

                    {/* if newsletter is announcement */}
                    {newsLetter.category === "announcement" &&
                      (() => {
                        
                        const announcement = announces.find(
                          (announce: Announcement) =>
                            announce.announcementId === newsLetter.referenceId
                        );

                        // console.log("Found announcement:", announcement); // Add this to check the result

                        return announcement ? (
                          <div className="flex flex-col gap-[20px]">
                            <div className="flex flex-col">
                              <div className="flex flex-col gap-[10px] px-4 md:px-[20px] mb-[20px]">
                                <p className="text-xl md:text-[24px] font-semibold">
                                  {announcement.title}
                                </p>
                                <CollapseText
                                  text={announcement.description + " "}
                                  maxChars={500}
                                  className='text-justify'
                                />
                              </div>
                              {announcement.image === "" ? (
                                ""
                              ) : (
                                <img
                                  src={announcement.image}
                                  className="w-full rounded-b-[10px]"
                                ></img>
                              )}
                              
                            </div>
                            {/* <div className="flex gap-1 mx-[20px]">
                              <button
                                onClick={() => router.push(`/scholarship`)}
                                className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-blue-100 hover:text-blue-900"
                                >
                                View more announcement
                              </button>
                              <button
                                onClick={() => router.push(`/scholarship/${scholarship.scholarshipId}`)}
                                className="w-full cursor-pointer h-[30px] rounded-full border border-[1px] border-[#0856BA] hover:bg-blue-600 text-[12px] bg-[#0856BA] text-white"
                              >
                                Read more
                              </button>
                            </div> */}
                          </div>
                        ) : (
                          <p className="text-[12px] md:text-[14px] mx-4 md:mx-[20px] my-[10px] italic text-gray-500">
                            Announcement not found
                          </p>
                        );
                      })()}

                    {/* if newsletter is a job post */}
                    {newsLetter.category === "job_offering" &&
                      (() => {
                        const jobOffering = jobOffers.find(
                          (jobOffer: JobOffering) =>
                            jobOffer.jobId === newsLetter.referenceId &&
                            jobOffer.status === "Accepted" || jobOffer.status === "Closed"
                        );
                        return jobOffering ? (
                          <div className="px-4 md:px-[20px]">
                            <div className="flex flex-col gap-4 md:gap-[30px]">
                              <div className="flex flex-col gap-[1px]">
                                {/* <p className="text-xl md:text-[24px] font-semibold mb-3">[HIRING]</p>  */}
                                <p className="text-xl md:text-[24px] font-semibold">
                                 {jobOffering.position}
                                </p>
                                <div className="flex flex-col gap-1">
                                  <div className="flex gap-1 items-center">
                                  <p className="text-base md:text-[18px]">
                                    {jobOffering.company}
                                  </p>
                                  <MapPin className="ml-1 size-4 text-[#0856BA]"/>
                                  <p className="text-base md:text-[13px] text-[#0856BA]">
                                    {jobOffering.location}
                                  </p>
                                  </div>
                                  <div className="flex items-center">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    jobOffering.status === "Closed" 
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                  }`}>
                                    {jobOffering.status === "Accepted" ? "Still Open": "Closed"}
                                  </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-4 md:gap-[30px]">
                                <div className="flex flex-col gap-[10px]">
                                  <div className="flex flex-row gap-[5px]">
                                    <Briefcase className="size-5"/>
                                    <p className="text-[13px] md:text-[15px]">
                                      {jobOffering.employmentType}
                                    </p>
                                  </div>

                                  <div className="flex flex-row gap-[5px]">
                                    <Award className="size-5"/>
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
                                      {jobOffering.requiredSkill.map(
                                        (skill: string) => (
                                          <ul
                                            className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-500"
                                            key={skill}
                                          >
                                            <li
                                              key={skill}
                                              className="flex items-center gap-[5px]"
                                            >
                                              <CheckCircle className="size-4 text-green-500"/>
                                              {skill}
                                            </li>
                                          </ul>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* job desc */}
                                <div>
                                  <div className="flex flex-row items-center gap-[5px]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="1.5"
                                      stroke="currentColor"
                                      className="h-[18px] md:h-[20px] w-auto"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                      />
                                    </svg>
                                    <p className="text-lg md:text-[20px] font-semibold">
                                      About the job
                                    </p>
                                  </div>
                                  <div className="text-[13px] md:text-[15px] ml-[25px] mr-[25px] text-justify">
                                    <CollapseText
                                      text={jobOffering.jobDescription + " "}
                                      maxChars={500}
                                      className='text-justify'
                                    />
                                  </div>
                                </div>
                                {(() => {
                                  const jobOffering = jobOffers.find(
                                    (jobOffer: JobOffering) =>
                                      jobOffer.jobId === newsLetter.referenceId
                                  );
                                  if (jobOffering.alumniId !== alumInfo?.alumniId) {
                                    return jobOffering.status === 'Closed' ?
                                    <div className="flex gap-1">
                                      <button
                                        className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#A9BEDA] text-[12px] bg-[#A9BEDA] text-white"
                                      >
                                        Apply
                                      </button>
                                    </div> : 
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => router.push(`/joboffer-list/`)}
                                        className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#0856BA] hover:bg-blue-600 text-[12px] bg-[#0856BA] text-white"
                                      >
                                        Apply
                                      </button>
                                    </div>;
                                  } else {
                                    return <div></div>
                                  };
                                })()}
                                
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[12px] md:text-[14px] mx-4 md:mx-[20px] my-[10px] italic text-gray-500">
                            Job offer not found or have been closed.
                          </p>
                        );
                      })()}

                    {/* if newsletter is a donation drive */}
                    {newsLetter.category === "donation_drive" &&
                      (() => {
                        const donationDrive = donationDrives.find(
                          (donation: DonationDrive) => {
                            return (
                              donation.donationDriveId ===
                              newsLetter.referenceId
                            );
                          }
                        );

                        return donationDrive ? (
                          <div className="flex flex-col gap-[20px]">
                            <div className="flex flex-col gap-[20px]">
                              <div className="flex flex-col gap-[5px] px-4 md:px-[20px] mb-[20px]">
                                <p className="text-xl md:text-[24px] font-semibold">
                                  {donationDrive.campaignName}
                                </p>
                                <p className="text-xl md:text-[24px] font-semibold">
                                  {donationDrive.title}
                                </p>
                                <CollapseText
                                  text={donationDrive.description + " "}
                                  maxChars={500}
                                  className='text-justify'
                                />
                              </div>

                            {donationDrive.image === "" ? "" :
                              <img src={donationDrive.image} className="w-full" alt="Donation drive" /> 
                            }
                        
                          <div className="flex flex-col px-4 md:px-[20px]">
                            <div className="w-full">
                              <div className="flex justify-between mb-1">
                                <div className='flex gap-2 items-center'>
                                  <Users className='size-4 text-[#616161]'/>
                                  <span className="text-[13px] md:text-[15px] text-gray-500">{" "} {donationDrive.donorList?.length || 0} Patrons</span>
                                </div>
                                {getDaysRemaining(donationDrive.endDate) === "Not Available" ? "" : (
                                <div className='flex gap-2 items-center'>
                                  <Clock className='size-4 text-[#616161]'/>
                                  <span className="text-[13px] md:text-[15px] text-gray-500">{getDaysRemaining(donationDrive.endDate)}</span>
                                </div>)}
                              </div>

                              {/* progress bar */}
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden my-[5px]">
                                {donationDrive.currentAmount === 0 ? (
                                  <div 
                                  className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center py-0.5 leading-none rounded-full" 
                                  style={{
                                    width: `${Math.min( 0 / donationDrive.targetAmount * 100, 100)}%`
                                  }}
                                >
                                </div>) : 
                                  <div 
                                    className="bg-blue-500 h-2 text-[10px] font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" 
                                    style={{
                                      width: `${Math.min((donationDrive.currentAmount || 0) / donationDrive.targetAmount * 100, 100)}%`
                                    }}
                                  >
                                  </div>}
                                </div>

                                  <div className="flex justify-between my-1 text-[13px] md:text-[15px]">
                                    <span className="font-medium">
                                      ₱{" "}
                                      {
                                        donationDrive.currentAmount
                                      }
                                    </span>
                                    <span className="text-gray-500">
                                      of ₱{" "}
                                      {donationDrive.targetAmount || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-1 w-full px-[20px]">
                              <button
                                onClick={() =>
                                  router.push(`/donationdrive-list`)
                                }
                                className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-blue-100 hover:text-blue-900"
                                >
                                View more donation drives
                              </button>
                              <button
                                onClick={() => router.push(`/donationdrive-list/details?id=${donationDrive.donationDriveId}`)}
                                className="w-full cursor-pointer h-[30px] rounded-full border border-[1px] border-[#0856BA] hover:bg-blue-600 text-[12px] bg-[#0856BA] text-white"
                              >
                              Donate
                            </button>
                            </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[12px] md:text-[14px] mx-4 md:mx-[20px] my-[10px] italic text-gray-500">
                            Donation Drive not found
                          </p>
                        );
                      })()}

                    {/* if newsletter is a scholarship */}
                    {newsLetter.category === "scholarship" &&
                      (() => {
                        const scholarship = scholarships.find(
                          (scholarship: Scholarship) => {
                            return (
                              scholarship.scholarshipId ===
                              newsLetter.referenceId
                            );
                          }
                        );

                        return scholarship ? (
                          <div className="flex flex-col gap-[20px] px-4 md:px-[20px] mb-[20px]">
                            <p className="text-xl md:text-[24px] font-semibold">
                              {scholarship.title}
                            </p>
                            <CollapseText
                              text={scholarship.description + " "}
                              maxChars={500}
                              className='text-justify'
                            />

                              {scholarship.image === "" ? (
                                ""
                              ) : (
                                <img
                                  src={scholarship.image}
                                  className="w-full"
                                  alt="Donation drive"
                                />
                              )}


                            <div className="flex gap-1">
                            <button
                              onClick={() => router.push(`/scholarship`)}
                              className="w-full h-[30px] cursor-pointer rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-blue-100 hover:text-blue-900"
                              >
                              View more scholarships
                            </button>
                            <button
                              onClick={() => router.push(`/scholarship/${scholarship.scholarshipId}`)}
                              className="w-full cursor-pointer h-[30px] rounded-full border border-[1px] border-[#0856BA] hover:bg-blue-600 text-[12px] bg-[#0856BA] text-white"
                            >
                              Sponsor
                            </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[12px] md:text-[14px] mx-4 md:mx-[20px] my-[10px] italic text-gray-500">
                            Announcement not found
                          </p>
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
                            <div className="flex flex-col gap-[20px]">
                              <p className="text-xl md:text-[24px] font-semibold">{event.title}</p>
                              <CollapseText text={event.description + " "} maxChars={500} className="text-[13px] md:text-[15px] mt-2"/>
                            </div>
                          </div>
                        
                          {event.image === "" ? <hr className="w-[95%] text-gray-300 place-self-center"></hr> :
                            <img src={event.image}></img>
                          }

                            <div className="flex justify-between mx-[30px] text-[15px] gap-[30px] my-[5px] ">
                              <div className='flex gap-2 items-center'>
                                <Calendar className="size-5 text-[#616161]"/>
                                <span className="text-[15px] text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              
                              <div className='flex gap-2  items-center'>
                                <Clock className='size-5 text-[#616161]'/>
                                <span className="text-[15px] text-gray-500">{new Date(event.date).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                              </div>

                            <div className="flex flex-row text-[15px] gap-[3px] items-center place-self-start">
                              <MapPin className="size-5 text-[#616161] "/>
                              <span className="text-[15px] text-gray-500">{event.location}</span>
                            </div>
                          </div>
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

                                  <div className="px-4 md:px-[20px] flex gap-1">
                                    <button
                                      onClick={() => router.push(`/events`)}
                                      className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#0856BA] bg-white text-[#0856BA] text-[12px] hover:bg-blue-100 hover:text-blue-900"
                                      >
                                      View more events
                                    </button>
                                    <button
                                      onClick={() => router.push(`/events/${event.eventId}`)}
                                      className="w-full h-[30px] cursor-pointer mb-[20px] rounded-full border border-[1px] border-[#0856BA] hover:bg-blue-600 text-[12px] bg-[#0856BA] text-white"
                                    >
                                      Accept Invite
                                    </button>
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
                      <img
                        src={events[currentEventIndex].image}
                        className="mb-[10px] h-[150px] w-full object-cover"
                      />
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