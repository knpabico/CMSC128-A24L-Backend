"use client";
import LoadingPage from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAlums } from "@/context/AlumContext";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { Announcement } from "@/models/models";
import { useAnnouncement } from "@/context/AnnouncementContext";
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
import {
  NewsLetterProvider,
  useNewsLetters,
} from "@/context/NewsLetterContext";
import { format } from "path";

const sortTypes = ["Latest", "Earliest"]; //sort types
const sortValues = ["nf", "of"]; //sort values (query params)
const SORT_TAGS = ["Earliest", "Latest"];

export default function Home() {
  const { user, loading, alumInfo, isAdmin, status, isGoogleSignIn } =
    useAuth();
  const { newsLetters } = useNewsLetters();
  const { announces, setAnnounce } = useAnnouncement();
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

  useEffect(() => {
    console.log("Announcements", announces);
    const filteredAnnouncements = announces.filter(
      (announcement: Announcement) => announcement.isPublic === true
    );
    if (JSON.stringify(filteredAnnouncements) !== JSON.stringify(announces)) {
      setAnnounce(filteredAnnouncements);
    }
  }, [announces]);

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
        opacity: 1
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
        opacity: 1
      };
    } 
    
    // Side images (closer = larger, further = smaller)
    const offset = relativePos * 20; // -20%, -40%, 20%, 40%, etc.
    const scale = 1 - (absoluteRelativePos * 0.2); // 0.8, 0.6, etc.
    const zIndex = 20 - absoluteRelativePos;
    const opacity = 1 - (absoluteRelativePos * 0.3); // 0.7, 0.4, etc.
    
    return {
      transform: `translateX(${offset}%) scale(${scale})`,
      zIndex,
      opacity
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
          alt: `Image ${images.length + 1}`
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
    const newImages = images.filter(img => img.id !== id);
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

  if (loading || (user && !alumInfo)) return <LoadingPage />;
  else if (!user && !isAdmin) {
    return (
      <div>
      <div className="flex justify-end p-4">
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
      
      {/* Carousel */}
      <div className="bg-blue-300 relative w-full h-screen overflow-hidden">
      </div>
      
      <div className="flex flex-col gap-8" style={{ padding: "50px 10% 5% 10%" }}>
        <div className="font-bold text-3xl">
          News & Announcements
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {announces.map((item:Announcement) => (
            <Link 
              href={`/announcements/${item.announcementId}`} 
              key={item.announcementId}
              className="bg-white rounded-xl overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 h-full"
            >
              <div className="w-full h-40 bg-pink-400 overflow-hidden">
                <img 
                  src={item.image} 
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
                        <p className="text-xs">
                          {formatDate(newsLetter.timestamp)}
                        </p>
                      </div>
                      {newsLetter.category === "announcement" &&
                        (() => {
                          const announcement = announces.find(
                            (announce: Announcement) =>
                              announce.announcementId === newsLetter.referenceId
                          );
                          return announcement ? (
                            <>
                              <h1 className="text-2xl font-bold">
                                {announcement.title}
                              </h1>
                              <p className="text-base mt-2">
                                {announcement.description}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm italic text-gray-500">
                              Announcement not found
                            </p>
                          );
                        })()}
                      {newsLetter.category === "donation_drive" &&
                        (() => {
                          return (
                            <>
                              <h1 className="text-2xl font-bold">
                                Donation Drive
                              </h1>
                              <p className="text-base mt-2">
                                Details about the donation drive will go here.
                              </p>
                            </>
                          );
                        })()}
                      {newsLetter.category === "job_offering" &&
                        (() => {
                          return (
                            <>
                              <h1 className="text-2xl font-bold">
                                Job Offering
                              </h1>
                              <p className="text-base mt-2">
                                Details about the job offering will go here.
                              </p>
                            </>
                          );
                        })()}
                      {newsLetter.category === "scholarship" &&
                        (() => {
                          return (
                            <>
                              <h1 className="text-2xl font-bold">
                                Scholarship
                              </h1>
                              <p className="text-base mt-2">
                                Details about the scholarship will go here.
                              </p>
                            </>
                          );
                        })()}
                      {newsLetter.category === "event" &&
                        (() => {
                          return (
                            <>
                              <h1 className="text-2xl font-bold">Event</h1>
                              <p className="text-base mt-2">
                                Details about the event will go here.
                              </p>
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
