"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { useEducation } from "@/context/EducationContext";
import AlumnusUploadPic from "./upload-profile/page";
import Image from "next/image";
import BookmarkButton from "@/components/ui/bookmark-button";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  MapPin,
  PencilIcon,
  XIcon,
  CalendarDaysIcon,
  HandHeartIcon,
  SchoolIcon,
  Rows3Icon,
} from "lucide-react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import EditWorkExperience from "@/components/ui/edit-experience-modal";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { useRouter } from "next/navigation";
import AddEducationModal from "@/components/ui/add-aducation-modal";
import { WorkExperience, Education, Affiliation } from "@/models/models";
import AddAffiliationModal from "@/components/ui/add-affiliation-modal";
import EventsProfile from "@/components/ui/events-profile";
import ScholarshipsProfile from "@/components/ui/scholarships-profile-modal";
import RecordOfDonations from "@/components/ui/return-of-donations-modal";
import AddWorkExperience from "@/components/ui/add-experience-modal";
import AlumniJobOffers from "@/components/ui/job-posting-modal";
import { useAffiliation } from "@/context/AffiliationContext";
import { useAlums } from "@/context/AlumContext";
import {
  PlusCircleIcon,
  CircleUserRoundIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  MegaphoneIcon,
} from "lucide-react";
import { Bookmark } from "@/models/models";
import { useBookmarks } from "@/context/BookmarkContext";
import { Announcement } from "@/models/models";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { DonationDrive } from "@/models/models";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { Event } from "@/models/models";
import { useEvents } from "@/context/EventContext";
import { Scholarship } from "@/models/models";
import { useScholarship } from "@/context/ScholarshipContext";
import { JobOffering } from "@/models/models";
import { useJobOffer } from "@/context/JobOfferContext";
import MapComponentA from "@/components/ui/map";

const UserProfile = () => {
  const { user, alumInfo, loading } = useAuth();
  const { userWorkExperience, isLoading, deleteWorkExperience } =
    useWorkExperience();
  const { userEducation } = useEducation();
  const { userAffiliation } = useAffiliation();
  const { updateAlumniDetails } = useAlums();

  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const { isLoaded } = useGoogleMaps();
  const [educationView, setEducationView] = useState(false); //pang track if pinindot ba ni User yung education
  const [personalView, setPersonalView] = useState(true); //pang track if pinindot ba ni User yung personal same sa career
  const [careerView, setCareerView] = useState(false);
  const [degreeType, setDegreeType] = useState("");
  const [addAffiliation, setaddAffiliation] = useState(false);

  //for tabs
  const [seeProfile, setSeeProfile] = useState(true);
  const [seeEventsProfile, setSeeEventsProfile] = useState(false);
  const [seeScholarshipsProfile, setSeeScholarshipsProfile] = useState(false);
  const [seeDonations, setSeeDonations] = useState(false);
  const [seeBookmarks, setSeeBookmarks] = useState(false);
  const [seeJobpostings, setSeeJobPosting] = useState(false);

  const [addBachelor, setAddBachelor] = useState(false);
  const [addMasters, setAddMasters] = useState(false);
  const [addDoctoral, setAddDoctoral] = useState(false);

  //Edit the personal field information
  const [privacy, setPrivacy] = useState(alumInfo?.contactPrivacy);
  const [email, setEmail] = useState(alumInfo?.email || "");
  const [firstName, setFirstName] = useState(alumInfo?.firstName || "");
  const [lastName, setLastName] = useState(alumInfo?.lastName || "");
  const [middleName, setMiddleName] = useState(alumInfo?.middleName || "");
  const [suffix, setSuffix] = useState(alumInfo?.suffix || "");
  const [studentNumber, setStudentNumber] = useState(
    alumInfo?.studentNumber || ""
  );
  const [city, setCity] = useState(alumInfo?.address[1] || "");
  const [province, setProvince] = useState(alumInfo?.address[2] || "");
  const [country, setCountry] = useState(alumInfo?.address[0] || "");

  //for birthday
  const [birthday, setBirthday] = useState(
    alumInfo?.birthDate.toString() || ""
  );
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: 125 },
    (_, i) => new Date().getFullYear() - i
  );

  //for bookmarks
  const [allView, setAllView] = useState(false);
  const [announcementsView, setAnnouncementsView] = useState(false);
  const [eventsView, setEventsView] = useState(false);
  const [drivesView, setDrivesView] = useState(false);
  const [scholarshipsView, setScholarshipsView] = useState(false);
  const [jobsView, setJobsView] = useState(false);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const { bookmarks } = useBookmarks();
  if (!bookmarks) {
    return <div>Loading Bookmarks...</div>;
  }
  const { announces } = useAnnouncement();
  const { donationDrives } = useDonationDrives();
  const { events } = useEvents();
  const { scholarships } = useScholarship();
  const { jobOffers } = useJobOffer();

  useEffect(() => {
    if (alumInfo) {
      setFirstName(alumInfo.firstName || "");
      setMiddleName(alumInfo.middleName || "");
      setLastName(alumInfo.lastName || "");
      setSuffix(alumInfo.suffix || "");
      setEmail(alumInfo.email || "");
      setPrivacy(alumInfo.contactPrivacy);
      setStudentNumber(alumInfo.studentNumber || "");
      setCity(alumInfo.address?.[1] || "");
      setProvince(alumInfo.address?.[2] || "");
      setCountry(alumInfo.address?.[0] || "");
      setBirthday(alumInfo.birthDate.toString());

      // For birthday (parse and split to day, month, year)
      if (alumInfo.birthDate) {
        const date = new Date(alumInfo.birthDate);
        setDay(date.getDate().toString());
        setMonth((date.getMonth() + 1).toString());
        setYear(date.getFullYear().toString());
      }

      // For fields of interest
      if (alumInfo.fieldOfInterest) {
        setSelectedFields(alumInfo.fieldOfInterest);
      }
    }
  }, [alumInfo]);

  //for the fields of interest
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const fields = [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Cybersecurity",
    "Computer Vision",
    "Natural Language Processing",
    "Software Engineering",
    "Human-Computer Interaction",
    "Computer Graphics",
    "Robotics",
    "Quantum Computing",
    "Bioinformatics",
    "Theoretical Computer Science",
    "Computer Networks",
    "Operating Systems",
    "Database Systems",
    "Cloud Computing",
    "Distributed Systems",
    "Embedded Systems",
    "Game Development",
    "Web Development",
    "Mobile Application Development",
    "Augmented Reality",
    "Virtual Reality",
    "Information Retrieval",
    "Big Data",
    "Internet of Things",
    "Blockchain",
    "DevOps",
    "Digital Forensics",
    "Other",
  ];

  const handleFieldsSelect = (field) => {
    if (selectedFields.length < 5 && !selectedFields.includes(field)) {
      setSelectedFields([...selectedFields, field]);
    }
    setIsOpen(false);
  };
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleFieldRemove = (field) => {
    setSelectedFields(selectedFields.filter((f) => f !== field));
  };

  //function for calculating age (year only) based from birthdate
  const calculateAge = (birthDate: Date) => {
    //current date
    const current_date = new Date();
    const current_day = current_date.getDate();
    const current_month = current_date.getMonth();
    const current_year = current_date.getFullYear();

    //birthDate
    const day = birthDate.getDate();
    const month = birthDate.getMonth();
    const year = birthDate.getFullYear();

    //student number

    let age = current_year - year;
    //if current day < day or current month < month
    if (
      (current_month === month && current_day < day) ||
      current_month < month
    ) {
      age = age - 1; //subtract 1 from age
    }

    return age;
  };
  const age = alumInfo ? calculateAge(new Date(alumInfo.birthDate)) : "";

  //function when save changes was clicked
  const handleTheSaveChages = () => {
    updateAlumniDetails(
      alumInfo,
      firstName,
      middleName,
      lastName,
      suffix,
      email,
      studentNumber,
      [country, city, province],
      selectedFields,
      privacy
    );
  };

  const [openAddModal, setOpenAddModal] = useState(false);

  //pagpindot sa buttons and tabs
  const handleProfileClick = () => {
    setSeeProfile(true);
    setSeeBookmarks(false);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(true);
    setCareerView(false);
    setEducationView(false);
  };

  //------- PROFILE -------
  const handlePersonalClick = () => {
    setSeeProfile(true);
    setEducationView(false);
    setCareerView(false);
    setSeeBookmarks(false);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(true);
  };
  const handleEducationClick = () => {
    setSeeProfile(true);
    setSeeBookmarks(false);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);
    setEducationView(true);
  };
  const handleCareerClick = () => {
    setSeeProfile(true);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(true);
  };
  //-------------------------

  const handleEventsProfileClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeEventsProfile(true);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);
  };
  const handleScholarshipsProfileClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(true);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);
  };
  const handleDonationsClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(true);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);
  };
  const handleJobpostingClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(true);
    setPersonalView(false);
    setCareerView(false);
  };
  const handleBookmarksClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);

    setAllView(true);
    setAnnouncementsView(false);
    setEventsView(false);
    setDrivesView(false);
    setScholarshipsView(false);
    setJobsView(false);
  };

  //------- BOOKMARKS -------
  const handleAllViewClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);

    setAllView(true);
    setAnnouncementsView(false);
    setEventsView(false);
    setDrivesView(false);
    setScholarshipsView(false);
    setJobsView(false);
  };
  const handleAnnouncementsViewClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);

    setAllView(false);
    setAnnouncementsView(true);
    setEventsView(false);
    setDrivesView(false);
    setScholarshipsView(false);
    setJobsView(false);
  };
  const handleEventsViewClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);

    setAllView(false);
    setAnnouncementsView(false);
    setEventsView(true);
    setDrivesView(false);
    setScholarshipsView(false);
    setJobsView(false);
  };
  const handleDrivesViewClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);

    setAllView(false);
    setAnnouncementsView(false);
    setEventsView(false);
    setDrivesView(true);
    setScholarshipsView(false);
    setJobsView(false);
  };
  const handleScholarshipsViewClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);

    setAllView(false);
    setAnnouncementsView(false);
    setEventsView(false);
    setDrivesView(false);
    setScholarshipsView(true);
    setJobsView(false);
  };
  const handleJobsViewClick = () => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeEventsProfile(false);
    setSeeScholarshipsProfile(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);

    setAllView(false);
    setAnnouncementsView(false);
    setEventsView(false);
    setDrivesView(false);
    setScholarshipsView(false);
    setJobsView(true);
  };
  //-------------------------

  function formatDate(timestamp: any): string {
    if (!timestamp) return "Invalid Date";

    let date: Date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else {
      return "Invalid Date";
    }

    return date.toISOString().split("T")[0];
  }

  function timeAgo(timestamp: any): string {
    const date = timestamp.toDate(); // Firestore Timestamp to JS Date
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }

  const [sortOrder, setSortOrder] = useState("latest");
  const [sortField, setSortField] = useState("dateSaved"); // "dateSaved" or "datePosted"
  const [sortedBookmarks, setSortedBookmarks] = useState<Bookmark[]>([]);

  const getBookmarkDetails = (bookmark: Bookmark) => {
    if (bookmark.type.toString() === "announcement") {
      return announces.find(
        (a: Announcement) => a.announcementId === bookmark.entryId
      );
    }
    if (bookmark.type.toString() === "event") {
      return events.find((e: Event) => e.eventId === bookmark.entryId);
    }
    if (bookmark.type.toString() === "donation_drive") {
      return donationDrives.find(
        (d: DonationDrive) => d.donationDriveId === bookmark.entryId
      );
    }
    if (bookmark.type.toString() === "scholarship") {
      return scholarships.find(
        (s: Scholarship) => s.scholarshipId === bookmark.entryId
      );
    }
    if (bookmark.type.toString() === "job_offering") {
      return jobOffers.find((j: JobOffering) => j.jobId === bookmark.entryId);
    }
    return null;
  };

  useEffect(() => {
    const sorted = [...bookmarks].sort((a, b) => {
      let aTime = 0;
      let bTime = 0;

      if (sortField === "dateSaved") {
        aTime = a.timestamp?.toMillis
          ? a.timestamp.toMillis()
          : new Date(a.timestamp).getTime() || 0;
        bTime = b.timestamp?.toMillis
          ? b.timestamp.toMillis()
          : new Date(b.timestamp).getTime() || 0;
      } else {
        const aDetails = getBookmarkDetails(a);
        const bDetails = getBookmarkDetails(b);
        aTime = aDetails.datePosted?.toMillis
          ? aDetails.datePosted.toMillis()
          : new Date(aDetails.datePosted).getTime() || 0;
        bTime = bDetails.datePosted?.toMillis
          ? bDetails.datePosted.toMillis()
          : new Date(bDetails.datePosted).getTime() || 0;
      }

      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });

    setSortedBookmarks(sorted);
  }, [
    bookmarks,
    sortOrder,
    sortField,
    announces,
    events,
    donationDrives,
    scholarships,
    jobOffers,
  ]);

  //===========================

  //upload Image
  const handleUploadImage = () => {
    document.body.style.overflow = "hidden";
    console.log("Hello");
    if (uploading) {
      setUploading(false);
    } else {
      setUploading(true);
    }
  };

  //pagdagdag sa education
  const handleAddBachelor = () => {
    document.body.style.overflow = "hidden";
    setAddMasters(false);
    setAddDoctoral(false);
    console.log("@ Bachelor");
    setDegreeType("bachelors");
    setAddBachelor(true);
  };

  const handleAddMasters = () => {
    document.body.style.overflow = "hidden";
    setAddDoctoral(false);
    setAddBachelor(false);
    setDegreeType("masters");
    setAddMasters(true);
  };

  const handleAddDoctoral = () => {
    document.body.style.overflow = "hidden";
    setAddMasters(false);
    setAddBachelor(false);
    setDegreeType("doctoral");
    setAddDoctoral(true);
  };

  const handleAddAffiliation = () => {
    document.body.style.overflow = "hidden";
    setaddAffiliation(true);
  };

  const [isMapOpenArray, setIsMapOpenArray] = useState(
    new Array(userWorkExperience.length).fill(false)
  );

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(
    new Array(userWorkExperience.length).fill(false)
  );
  const [isEditModalOpen, setEditModalOpen] = useState(
    new Array(userWorkExperience.length).fill(false)
  );

  const openEditModal = (index: number) => {
    const newEditModal = [...isEditModalOpen];
    newEditModal[index] = true;
    setEditModalOpen(newEditModal);
  };

  const closeEditModal = (index: number) => {
    const newEditModal = [...isEditModalOpen];
    newEditModal[index] = false;
    setEditModalOpen(newEditModal);
  };

  const openMap = (index: number) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = true;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  const closeMap = (index: number) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = false;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  const params = useParams();
  const router = useRouter();
  const alumniId = params.alumniId;

  if (loading || isLoading) {
    return <LoadingPage />;
  } else if (user?.uid !== alumniId) {
    return <NotFound />;
  }

  const currentWorkExperience = userWorkExperience.filter(
    (item: WorkExperience) => item.endYear === "present"
  );

  return (
    <div>
      <title>My Profile | ICS-ARMS</title>
      <div
        style={{ backgroundColor: "#3675c5" }}
        className="relative bg-cover bg-center pt-15 px-50 text-white shadow-md"
      >
        <div className="flex space-x-10 pb-5">
          <div
            className="relative group bg-gray-200 w-50 h-50 flex justify-center items-center mb-2 rounded-full cursor-pointer border-5 border-white"
            onClick={handleUploadImage}
          >
            {alumInfo?.image ? (
              <Image
                src={alumInfo.image}
                alt="Alumnus Image"
                width={0}
                height={0}
                sizes="100vw"
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <span className="text-white"></span>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-full flex items-center justify-center">
              <PencilIcon />
            </div>
          </div>
          <div className="flex flex-col justify-end pb-10">
            <p className="font-bold text-5xl pb-3">
              {alumInfo?.firstName} {alumInfo?.lastName}
            </p>
            {userWorkExperience
              .filter((item: WorkExperience) => item.endYear === "present")
              .map((item: WorkExperience, index: number) => (
                <div key={index} className="work-experience-item">
                  <p className="font-semibold text-xl">{item.jobTitle}</p>
                </div>
              ))}
          </div>
        </div>
        <hr className="text-xs"></hr>
        <div className="flex gap-10">
          <div className={`${seeProfile ? "border-b-5 border-[#EAEAEA]" : ""}`}>
            <button
              className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${
                seeProfile
                  ? "rounded-b-none font-bold"
                  : "hover:bg-white/20 transition"
              }`}
              onClick={handleProfileClick}
            >
              Profile
            </button>
          </div>
          <div
            className={`${
              seeEventsProfile ? "border-b-5 border-[#EAEAEA]" : ""
            }`}
          >
            <button
              className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${
                seeEventsProfile
                  ? "rounded-b-none font-bold"
                  : "hover:bg-white/20 transition"
              }`}
              onClick={handleEventsProfileClick}
            >
              Events
            </button>
          </div>
          <div
            className={`${seeDonations ? "border-b-5 border-[#EAEAEA]" : ""}`}
          >
            <button
              className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${
                seeDonations
                  ? "rounded-b-none font-bold"
                  : "hover:bg-white/20 transition"
              }`}
              onClick={handleDonationsClick}
            >
              Record of Donations
            </button>
          </div>
          <div
            className={`${
              seeScholarshipsProfile ? "border-b-5 border-[#EAEAEA]" : ""
            }`}
          >
            <button
              className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${
                seeScholarshipsProfile
                  ? "rounded-b-none font-bold"
                  : "hover:bg-white/20 transition"
              }`}
              onClick={handleScholarshipsProfileClick}
            >
              Record of Scholars
            </button>
          </div>
          <div
            className={`${seeJobpostings ? "border-b-5 border-[#EAEAEA]" : ""}`}
          >
            <button
              className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${
                seeJobpostings
                  ? "rounded-b-none font-bold"
                  : "hover:bg-white/20 transition"
              }`}
              onClick={handleJobpostingClick}
            >
              Job Posts
            </button>
          </div>
          <div
            className={`${seeBookmarks ? "border-b-5 border-[#EAEAEA]" : ""}`}
          >
            <button
              className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${
                seeBookmarks
                  ? "rounded-b-none font-bold"
                  : "hover:bg-white/20 transition"
              }`}
              onClick={handleBookmarksClick}
            >
              Bookmarks
            </button>
          </div>
        </div>
      </div>

      {seeProfile && (
        <div className="mx-50 my-15">
          <div className="flex space-x-7">
            <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 ">
              <div className="bg-white">
                <ul className="flex flex-col p-1 gap-[10px] rounded-[10px] w-65 h-max">
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handlePersonalClick}
                  >
                    <CircleUserRoundIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        personalView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Personal Information</span>
                      {!personalView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleEducationClick}
                  >
                    <GraduationCapIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        educationView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Educational Background</span>
                      {!educationView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleCareerClick}
                  >
                    <BriefcaseIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        careerView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Career</span>
                      {!careerView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* INFO BOX */}

            {/* personal section */}
            {personalView && (
              <div>
                <div className="bg-white flex flex-col p-7 rounded-xl max-h-fit space-y-1 w-full shadow-md">
                  {/* FULL NAME */}
                  <p className="font-semibold">Full Name</p>
                  <div className="flex space-x-7 mb-7">
                    <div>
                      <p className="text-xs font-light">First Name</p>
                      <div className="flex">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-light">Middle Name</p>
                      <div className="flex">
                        <input
                          type="text"
                          value={middleName ? middleName : "N/A"}
                          onChange={(e) => setMiddleName(e.target.value)}
                          className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-light">Last Name</p>
                      <div className="flex">
                        <input
                          type="text"
                          value={lastName ? lastName : "N/A"}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-light">Suffix</p>
                      <div className="flex">
                        <input
                          type="text"
                          value={suffix ? suffix : "N/A"}
                          onChange={(e) => setSuffix(e.target.value)}
                          className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div className="flex space-x-7 mb-7">
                    <div>
                      <div>
                        <p className="font-semibold">Email Address</p>
                        <div className="flex">
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                            disabled
                          />
                        </div>
                      </div>
                      <div className="flex items-center pt-1">
                        <input
                          type="checkbox"
                          id="privacy"
                          checked={privacy}
                          onChange={(e) => setPrivacy(!privacy)}
                        />
                        <label
                          htmlFor="privacy"
                          className="ml-2 text-gray-700 text-xs"
                        >
                          Make visible to other alumni
                        </label>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold">
                        Birthday{" "}
                        <span className="font-light">(YYYY/MM/DD)</span>
                      </p>
                      <div className="flex">
                        <input
                          type="text"
                          value={birthday}
                          className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold">Current Age</p>
                      <div className="flex">
                        <input
                          type="text"
                          value={age}
                          className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* STUDENT NUMBER */}
                  <div className="space-x-7 mb-7">
                    <p className="font-semibold">Student Number</p>
                    <div className="flex">
                      <input
                        type="text"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        className="bg-gray-200 py-2 px-4 border border-gray-500 w-57 text-gray-500 rounded-md"
                        disabled
                      />
                    </div>
                  </div>

                  {/* CURRENT LOCATION */}
                  <p className="font-semibold">Current Location</p>
                  <div className="flex space-x-7 mb-7">
                    <div>
                      <p className="text-xs font-light">City/Municipality</p>
                      <input
                        type="text"
                        placeholder="City/Municipality"
                        className="py-2 px-4 border border-gray-500 rounded-md w-full text-gray-700"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-light">Province/State</p>
                      <input
                        type="text"
                        placeholder="Province/State"
                        className="py-2 px-4 border border-gray-500 rounded-md w-full text-gray-700"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-light">Country</p>
                      <input
                        type="text"
                        placeholder="Country"
                        className="py-2 px-4 border border-gray-500 rounded-md w-full text-gray-700"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* FIELDS OF INTEREST */}
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">Fields of Interest</p>
                      <p className="font-light text-xs mb-1">
                        Selected: {selectedFields.length}/5 &nbsp;&nbsp;
                        {selectedFields.length >= 5 && (
                          <span className="text-red-500 font-medium">
                            Maximum has been reached: 5
                          </span>
                        )}
                      </p>

                      {/* Selected fields tags */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedFields.map((field) => (
                          <div
                            key={field}
                            className="bg-blue-100 px-3 py-2 rounded-md text-sm flex items-center justify-between space-x-2"
                          >
                            <span>{field}</span>
                            <XIcon
                              className="text-gray-700 hover:text-red-500 cursor-pointer w-4 h-4"
                              onClick={() => handleFieldRemove(field)}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Dropdown */}
                      <div className="relative w-full">
                        <button
                          className="w-full flex items-center justify-between bg-white px-4 py-2 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          onClick={() => setIsOpen(!isOpen)}
                          disabled={selectedFields.length >= 5}
                        >
                          <span>
                            {selectedFields.length >= 5
                              ? "Maximum fields selected"
                              : "Select a field"}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        {isOpen && selectedFields.length < 5 && (
                          <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                            {fields
                              .filter(
                                (field) => !selectedFields.includes(field)
                              )
                              .map((field) => (
                                <div
                                  key={field}
                                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center space-x-2"
                                  onClick={() => handleFieldsSelect(field)}
                                >
                                  <span>{field}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="my-5 w-50 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]"
                  onClick={handleTheSaveChages}
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* education section */}
            {educationView && (
              <div className="space-y-7 w-full">
                {/* degree */}
                <div className="bg-white flex flex-col p-7 rounded-xl max-h-fit space-y-1 shadow-md">
                  <div className="space-y-3">
                    <p className="font-semibold">Bachelor's Degree</p>

                    <div className="space-y-5">
                      {/* INDIVIDUAL BULLET */}
                      {userEducation
                        .filter(
                          (edu: { type: string }) => edu.type === "bachelors"
                        )
                        .sort(
                          (a: Education, b: Education) =>
                            Number(b.yearGraduated) - Number(a.yearGraduated)
                        )
                        .map((edu: Education, index: number) => (
                          <div
                            className="flex items-center space-x-5"
                            key={index}
                          >
                            <div className="w-6 h-6 rounded-full bg-[#b9e5fe]"></div>
                            <div>
                              <p className="font-medium">{edu.major}</p>
                              <p className="text-sm">{edu.university}</p>
                              <p className="text-sm">
                                Year Graduated: {edu.yearGraduated}
                              </p>
                            </div>
                          </div>
                        ))}
                      {/* ---- end of individual bullet ---- */}
                    </div>

                    <button
                      className="flex items-center space-x-3 cursor-pointer group pt-3"
                      type="button"
                      onClick={handleAddBachelor}
                    >
                      <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                      <p className="text-[#3675c5] text-sm group-hover:underline">
                        Add bachelor's degree
                      </p>
                    </button>
                  </div>
                  <hr className="my-6"></hr>{" "}
                  {/* ----------------------------------------------------------- */}
                  <div className="space-y-3">
                    <p className="font-semibold">Master's Degree</p>

                    {/* BULLET DIV ; set of all bullets ito */}
                    <div className="space-y-5">
                      {/* INDIVIDUAL BULLET */}
                      {userEducation
                        .filter(
                          (edu: { type: string }) => edu.type === "masters"
                        )
                        .sort(
                          (a: Education, b: Education) =>
                            Number(b.yearGraduated) - Number(a.yearGraduated)
                        )
                        .map((edu: Education, index: number) => (
                          <div
                            className="flex items-center space-x-5"
                            key={index}
                          >
                            <div className="w-6 h-6 rounded-full bg-[#00bcfc]"></div>
                            <div>
                              <p className="font-medium">{edu.major}</p>
                              <p className="text-sm">{edu.university}</p>
                              <p className="text-sm">
                                Year Graduated: {edu.yearGraduated}
                              </p>
                            </div>
                          </div>
                        ))}
                      {/* ---- end of individual bullet ---- */}
                    </div>
                    {/* ---- end of bullet div ---- */}

                    <button
                      className="flex items-center space-x-3 cursor-pointer group pt-3"
                      type="button"
                      onClick={handleAddMasters}
                    >
                      <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                      <p className="text-[#3675c5] text-sm group-hover:underline">
                        Add master's degree
                      </p>
                    </button>
                  </div>
                  <hr className="my-6"></hr>{" "}
                  {/* ----------------------------------------------------------- */}
                  <div className="space-y-3">
                    <p className="font-semibold">Doctoral Degree</p>

                    {/* BULLET DIV ; set of all bullets ito */}
                    <div className="space-y-5">
                      {/* INDIVIDUAL BULLET */}
                      {userEducation
                        .filter(
                          (edu: { type: string }) => edu.type === "doctoral"
                        )
                        .sort(
                          (a: Education, b: Education) =>
                            Number(b.yearGraduated) - Number(a.yearGraduated)
                        )
                        .map((edu: Education, index: number) => (
                          <div
                            className="flex items-center space-x-5"
                            key={index}
                          >
                            <div className="w-6 h-6 rounded-full bg-[#0282d2]"></div>
                            <div>
                              <p className="font-medium">{edu.major}</p>
                              <p className="text-sm">{edu.university}</p>
                              <p className="text-sm">
                                Year Graduated: {edu.yearGraduated}
                              </p>
                            </div>
                          </div>
                        ))}
                      {/* ---- end of individual bullet ---- */}
                    </div>
                    {/* ---- end of bullet div ---- */}

                    <button
                      className="flex items-center space-x-3 cursor-pointer group pt-3"
                      type="button"
                      onClick={handleAddDoctoral}
                    >
                      <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                      <p className="text-[#3675c5] text-sm group-hover:underline">
                        Add doctoral degree
                      </p>
                    </button>
                  </div>
                </div>

                {/* affiliations */}
                <div className="bg-white flex flex-col p-7 rounded-xl max-h-fit space-y-1 shadow-md">
                  <div className="space-y-3">
                    <p className="font-semibold">Affiliations</p>

                    {/* BULLET DIV ; all bullets ito */}
                    <div className="space-y-5">
                      {/* INDIVIDUAL BULLET */}
                      {userAffiliation
                        .sort(
                          (a: Affiliation, b: Affiliation) =>
                            Number(b.yearJoined) - Number(a.yearJoined)
                        )
                        .map((affiliation: Affiliation, index: number) => (
                          <div
                            className="flex items-center space-x-5"
                            key={index}
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                            <div>
                              <p className="font-medium">
                                {affiliation.affiliationName}
                              </p>
                              <p className="text-sm">
                                {affiliation.university}
                              </p>
                              <p className="text-sm">
                                Year Joined: {affiliation.yearJoined}
                              </p>
                            </div>
                          </div>
                        ))}
                      {/* ---- end of individual bullet ---- */}
                    </div>
                    {/* ---- end of bullet div ---- */}

                    <button
                      className="flex items-center space-x-3 cursor-pointer group pt-3"
                      type="button"
                      onClick={handleAddAffiliation}
                    >
                      <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                      <p className="text-[#3675c5] text-sm group-hover:underline">
                        Add affiliation
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* career section */}
            {careerView && (
              <div className="space-y-7 w-full">
                <div className="bg-white flex flex-col p-7 rounded-xl max-h-fit space-y-1 w-full shadow-md">
                  <div className="space-y-3">
                    <p className="font-semibold">Work Experience</p>

                    {/* BULLET DIV */}
                    <div className="space-y-5">
                      {userWorkExperience.map(
                        (item: WorkExperience, index: number) => (
                          <div
                            key={item.workExperienceId}
                            className="flex justify-between"
                          >
                            <div className="flex items-center space-x-5">
                              <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                              <div>
                                <p className="font-medium">{item.jobTitle}</p>
                                <p className="text-sm">
                                  {item.company} &nbsp;•&nbsp;{" "}
                                  <span className="font-extralight">
                                    {item.industry}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  {item.startYear} - {item.endYear}
                                </p>
                              </div>
                            </div>

                            <div className="flex space-x-10">
                              <button
                                className="flex items-center space-x-2 cursor-pointer"
                                onClick={() => {
                                  // Update selectedLocation and activeMarker on row click
                                  setSelectedLocation({
                                    lat: item.latitude,
                                    lng: item.longitude,
                                  });
                                  setActiveMarker(index);
                                }}
                              >
                                <p className="text-[#3675c5]">
                                  <MapPin />
                                </p>
                                <p className="text-[#3675c5] text-sm hover:underline">
                                  View in map
                                </p>
                              </button>
                              <button
                                className="flex items-center space-x-2 cursor-pointer"
                                onClick={() => {
                                  openEditModal(index);
                                  document.body.style.overflow = "hidden";
                                }}
                              >
                                <p className="text-[#3675c5]">
                                  <PencilIcon />
                                </p>
                                <p className="text-[#3675c5] text-sm hover:underline">
                                  Edit
                                </p>
                              </button>
                            </div>

                            <EditWorkExperience
                              open={isEditModalOpen[index]}
                              onClose={() => {
                                closeEditModal(index);
                                document.body.style.overflow = "auto";
                              }}
                              numOfPresentJobs={currentWorkExperience.length}
                              work={item}
                              snackbar
                              setSnackbar={setSnackbar}
                              setMessage={setEditMessage}
                              setSuccess={setEditSuccess}
                            />

                            {/* Dito yung part nung sa Map */}
                            <Dialog
                              open={isMapOpenArray[index]}
                              onClose={() => closeMap(index)}
                            >
                              <DialogContent className="w-150">
                                <div className="flex items-center justify-between relative">
                                  <p className="text-xl font-bold pb-3">
                                    {item.company} Location
                                  </p>
                                  <button
                                    onClick={() => closeMap(index)}
                                    className="absolute top-0 right-0"
                                  >
                                    <XIcon className="cursor-pointer hover:text-red-500" />
                                  </button>
                                </div>
                                <div className="h-[400px] w-full">
                                  {!isLoaded ? (
                                    <div className="flex items-center justify-center h-full">
                                      <p className="text-xl text-gray-600">
                                        Loading map...
                                      </p>
                                    </div>
                                  ) : (
                                    <GoogleMap
                                      mapContainerStyle={{
                                        width: "100%",
                                        height: "100%",
                                      }}
                                      center={{
                                        lat: item.latitude,
                                        lng: item.longitude,
                                      }}
                                      zoom={15}
                                    >
                                      <Marker
                                        position={{
                                          lat: item.latitude,
                                          lng: item.longitude,
                                        }}
                                        title={item.company}
                                      />
                                    </GoogleMap>
                                  )}
                                </div>
                                <div className="mt-4 text-center">
                                  <p>{item.location}</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )
                      )}
                    </div>

                    <button
                      className="flex items-center space-x-3 cursor-pointer group pt-3"
                      type="button"
                      onClick={() => {
                        setOpenAddModal(true);
                        document.body.style.overflow = "hidden";
                      }}
                    >
                      <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                      <p className="text-[#3675c5] text-sm group-hover:underline">
                        Add work experience
                      </p>
                    </button>
                    <MapComponentA
                      workExperienceList={userWorkExperience}
                      onLocationClick={(lat, lng, index) => {
                        setSelectedLocation({ lat, lng });
                        setActiveMarker(index);
                      }}
                      selectedLocation={selectedLocation}
                      activeMarker={activeMarker}
                    />
                  </div>

                  {alumInfo?.alumniId && (
                    <AddWorkExperience
                      open={openAddModal}
                      alumniId={alumInfo.alumniId}
                      numOfPresentJobs={currentWorkExperience.length}
                      onClose={() => {
                        setOpenAddModal(false);
                        document.body.style.overflow = "auto";
                      }}
                      snackbar={snackbar}
                      setSnackbar={setSnackbar}
                      setSuccess={setSuccess}
                      setMessage={setMessage}
                    />
                  )}
                  <Snackbar
                    open={snackbar}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar(false)}
                    message={message}
                  />
                </div>
              </div>
            )}

            {/* ================== end of info box ================== */}
          </div>
        </div>
      )}

      {/* Modal Sectionn */}
      {addBachelor && (
        <AddEducationModal
          open={addBachelor}
          onClose={() => {
            setAddBachelor(false);
            document.body.style.overflow = "auto";
          }}
          userId={alumInfo?.alumniId ?? ""}
          setSuccess={setSuccess}
          degreeType={"bachelors"}
        />
      )}
      {addMasters && (
        <AddEducationModal
          open={addMasters}
          onClose={() => {
            setAddMasters(false);
            document.body.style.overflow = "auto";
          }}
          userId={alumInfo?.alumniId ?? ""}
          setSuccess={setSuccess}
          degreeType={"masters"}
        />
      )}
      {addDoctoral && (
        <AddEducationModal
          open={addDoctoral}
          onClose={() => {
            setAddDoctoral(false);
            document.body.style.overflow = "auto";
          }}
          userId={alumInfo?.alumniId ?? ""}
          setSuccess={setSuccess}
          degreeType={"doctoral"}
        />
      )}
      {addAffiliation && (
        <AddAffiliationModal
          open={addAffiliation}
          onClose={() => {
            setaddAffiliation(false);
            document.body.style.overflow = "auto";
          }}
          userId={alumInfo?.alumniId ?? ""}
          setSuccess={setSuccess}
        />
      )}

      {seeEventsProfile && <EventsProfile />}

      {seeScholarshipsProfile && <ScholarshipsProfile />}

      {seeDonations && <RecordOfDonations />}

      {seeJobpostings && <AlumniJobOffers />}

      {seeBookmarks && (
        <div className="mx-50 mt-10 mb-15">
          <div className="filter-controls flex space-x-5 mb-5 justify-end items-center text-sm">
            <label htmlFor="sort-field" className="mr-2">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-field"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
              >
                <option value="dateSaved">Date Saved</option>
                <option value="datePosted">Date Posted</option>
              </select>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <label htmlFor="sort-order" className="mr-2">
              Order:
            </label>
            <div className="relative">
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex space-x-7">
            <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 ">
              <div className="bg-white">
                <ul className="flex flex-col p-1 gap-[10px] rounded-[10px] w-50 h-max">
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleAllViewClick}
                  >
                    <Rows3Icon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        allView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>All</span>
                      {!allView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleAnnouncementsViewClick}
                  >
                    <MegaphoneIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        announcementsView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Announcements</span>
                      {!announcementsView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleEventsViewClick}
                  >
                    <CalendarDaysIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        eventsView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Events</span>
                      {!eventsView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleDrivesViewClick}
                  >
                    <HandHeartIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        drivesView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Donation Drives</span>
                      {!drivesView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleScholarshipsViewClick}
                  >
                    <SchoolIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        scholarshipsView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Scholarships</span>
                      {!scholarshipsView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                  <li
                    className="flex gap-5 items-center justify-start cursor-pointer"
                    onClick={handleJobsViewClick}
                  >
                    <BriefcaseIcon />
                    <p
                      className={`group w-max relative py-1 transition-all ${
                        jobsView
                          ? "font-semibold  border-b-3 border-blue-500"
                          : "text-gray-700 group"
                      }`}
                    >
                      <span>Job Posts</span>
                      {!jobsView && (
                        <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                      )}
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* INFO BOX */}

            {/* all section */}
            {allView && (
              <div className="w-full">
                <div className="flex flex-col gap-5 w-full">
                  {sortedBookmarks.length > 0 ? (
                    sortedBookmarks.map((bookmark: Bookmark, index: number) => (
                      <div
                        key={index}
                        className="bg-white flex flex-col px-5 py-4 rounded-xl max-h-fit space-y-1 w-full shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-in-out"
                        // onClick={}
                      >
                        {bookmark.type.toString() === "announcement" ? (
                          [...announces]
                            .filter(
                              (ann: Announcement) =>
                                ann.announcementId === bookmark.entryId
                            )
                            .map((ann: Announcement, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() =>
                                  router.push(
                                    `/announcement/${ann.announcementId}`
                                  )
                                }
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <MegaphoneIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {ann.image && (
                                        <Image
                                          src={ann.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {ann.title}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(ann.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={ann.announcementId}
                                    type="announcement"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))
                        ) : bookmark.type.toString() === "event" ? (
                          [...events]
                            .filter(
                              (eve: Event) => eve.eventId === bookmark.entryId
                            )
                            .map((eve: Event, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  if (eve.eventId)
                                    router.push(`../events/${eve.eventId}`);
                                }}
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <CalendarDaysIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {eve.image && (
                                        <Image
                                          src={eve.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {eve.title}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(eve.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={eve.eventId}
                                    type="event"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))
                        ) : bookmark.type.toString() === "donation_drive" ? (
                          donationDrives
                            .filter(
                              (don: DonationDrive) =>
                                don.donationDriveId === bookmark.entryId
                            )
                            .map((don: DonationDrive, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  router.push(
                                    `/donationdrive-list/details?id=${don.donationDriveId}`
                                  );
                                }}
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <HandHeartIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {don.image && (
                                        <Image
                                          src={don.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {don.campaignName}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(don.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={don.donationDriveId}
                                    type="donation_drive"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))
                        ) : bookmark.type.toString() === "scholarship" ? (
                          [...scholarships]
                            .filter(
                              (scho: Scholarship) =>
                                scho.scholarshipId === bookmark.entryId
                            )
                            .map((scho: Scholarship, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  router.push(
                                    `/scholarship/${scho.scholarshipId}`
                                  );
                                }}
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <SchoolIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {scho.image && (
                                        <Image
                                          src={scho.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {scho.title}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(scho.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={scho.scholarshipId}
                                    type="scholarship"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))
                        ) : bookmark.type.toString() === "job_offering" ? (
                          [...jobOffers]
                            .filter(
                              (job: JobOffering) =>
                                job.jobId === bookmark.entryId
                            )
                            .map((job: JobOffering, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  router.push(
                                    `/joboffer-list?jobId=${job.jobId}`
                                  );
                                }}
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <BriefcaseIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {job.image && (
                                        <Image
                                          src={job.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {job.position}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(job.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={job.jobId}
                                    type="job_offering"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))
                        ) : (
                          <div></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                      <p className="text-gray-700">No bookmarks found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {announcementsView && (
              <div className="w-full">
                <div className="flex flex-col gap-5 w-full">
                  {sortedBookmarks.length > 0 &&
                  sortedBookmarks.filter(
                    (bookmark) => bookmark.type.toString() === "announcement"
                  ).length > 0 ? (
                    sortedBookmarks
                      .filter(
                        (bookmark) =>
                          bookmark.type.toString() === "announcement"
                      )
                      .map((bookmark: Bookmark, index: number) => (
                        <div
                          key={index}
                          className="bg-white flex flex-col px-5 py-4 rounded-xl max-h-fit space-y-1 w-full shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-in-out"
                          // onClick={}
                        >
                          {[...announces]
                            .filter(
                              (ann: Announcement) =>
                                ann.announcementId === bookmark.entryId
                            )
                            .map((ann: Announcement, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() =>
                                  router.push(
                                    `/announcement/${ann.announcementId}`
                                  )
                                }
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <MegaphoneIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {ann.image && (
                                        <Image
                                          src={ann.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {ann.title}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(ann.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={ann.announcementId}
                                    type="announcement"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                      <p className="text-gray-700">
                        No announcement bookmarks found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {eventsView && (
              <div className="w-full">
                <div className="flex flex-col gap-5 w-full">
                  {sortedBookmarks.length > 0 &&
                  sortedBookmarks.filter(
                    (bookmark) => bookmark.type.toString() === "event"
                  ).length > 0 ? (
                    sortedBookmarks
                      .filter(
                        (bookmark) => bookmark.type.toString() === "event"
                      )
                      .map((bookmark: Bookmark, index: number) => (
                        <div
                          key={index}
                          className="bg-white flex flex-col px-5 py-4 rounded-xl max-h-fit space-y-1 w-full shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-in-out"
                          // onClick={()=>{router.push(`/alumni/events/${alumniId}/alumni-donations`);}}
                        >
                          {[...events]
                            .filter(
                              (eve: Event) => eve.eventId === bookmark.entryId
                            )
                            .map((eve: Event, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  if (eve.eventId)
                                    router.push(`../events/${eve.eventId}`);
                                }}
                              >
                                {/* Event Id: {eve.eventId} */}
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <CalendarDaysIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {/* Try mo to click */}
                                      {eve.image && (
                                        <>
                                          <Image
                                            src={eve.image}
                                            alt="Alumnus Image"
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            className="object-cover w-full h-full"
                                          />
                                        </>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {eve.title}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(eve.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={eve.eventId}
                                    type="event"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                      <p className="text-gray-700">No event bookmarks found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {drivesView && (
              <div className="w-full">
                <div className="flex flex-col gap-5 w-full">
                  {sortedBookmarks.length > 0 &&
                  sortedBookmarks.filter(
                    (bookmark) => bookmark.type.toString() === "donation_drive"
                  ).length > 0 ? (
                    sortedBookmarks
                      .filter(
                        (bookmark) =>
                          bookmark.type.toString() === "donation_drive"
                      )
                      .map((bookmark: Bookmark, index: number) => (
                        <div
                          key={index}
                          className="bg-white flex flex-col px-5 py-4 rounded-xl max-h-fit space-y-1 w-full shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-in-out"
                          // onClick={}
                        >
                          {donationDrives
                            .filter(
                              (don: DonationDrive) =>
                                don.donationDriveId === bookmark.entryId
                            )
                            .map((don: DonationDrive, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  router.push(
                                    `/donationdrive-list/details?id=${don.donationDriveId}`
                                  );
                                }}
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <HandHeartIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {don.image && (
                                        <Image
                                          src={don.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {don.campaignName}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(don.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={don.donationDriveId}
                                    type="donation_drive"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                      <p className="text-gray-700">
                        No donation drive bookmarks found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {scholarshipsView && (
              <div className="w-full">
                <div className="flex flex-col gap-5 w-full">
                  {sortedBookmarks.length > 0 &&
                  sortedBookmarks.filter(
                    (bookmark) => bookmark.type.toString() === "scholarship"
                  ).length > 0 ? (
                    sortedBookmarks
                      .filter(
                        (bookmark) => bookmark.type.toString() === "scholarship"
                      )
                      .map((bookmark: Bookmark, index: number) => (
                        <div
                          key={index}
                          className="bg-white flex flex-col px-5 py-4 rounded-xl max-h-fit space-y-1 w-full shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-in-out"
                        >
                          {[...scholarships]
                            .filter(
                              (scho: Scholarship) =>
                                scho.scholarshipId === bookmark.entryId
                            )
                            .map((scho: Scholarship, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  router.push(
                                    `/scholarship/${scho.scholarshipId}`
                                  );
                                }}
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <SchoolIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {scho.image && (
                                        <Image
                                          src={scho.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {scho.title}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(scho.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={scho.scholarshipId}
                                    type="scholarship"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                      <p className="text-gray-700">
                        No scholarship bookmarks found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {jobsView && (
              <div className="w-full">
                <div className="flex flex-col gap-5 w-full">
                  {sortedBookmarks.length > 0 &&
                  sortedBookmarks.filter(
                    (bookmark) => bookmark.type.toString() === "job_offering"
                  ).length > 0 ? (
                    sortedBookmarks
                      .filter(
                        (bookmark) =>
                          bookmark.type.toString() === "job_offering"
                      )
                      .map((bookmark: Bookmark, index: number) => (
                        <div
                          key={index}
                          className="bg-white flex flex-col px-5 py-4 rounded-xl max-h-fit space-y-1 w-full shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-in-out"
                          // onClick={}
                        >
                          {[...jobOffers]
                            .filter(
                              (job: JobOffering) =>
                                job.jobId === bookmark.entryId
                            )
                            .map((job: JobOffering, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between"
                                onClick={() => {
                                  router.push(
                                    `/joboffer-list?jobId=${job.jobId}`
                                  );
                                }}
                              >
                                <div className="flex space-x-8 items-center">
                                  <p className="flex font-bold">
                                    <BriefcaseIcon />
                                  </p>
                                  <div className="flex space-x-3 items-center">
                                    <div className="w-30 h-20 bg-gray-200 flex-shrink-0">
                                      {job.image && (
                                        <Image
                                          src={job.image}
                                          alt="Alumnus Image"
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          className="object-cover w-full h-full"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold pt-2 text-left">
                                        {job.position}
                                      </p>
                                      <p className="font-light text-xs">
                                        Posted: {formatDate(job.datePosted)}
                                      </p>
                                      <p className="font-light text-xs">
                                        Saved {timeAgo(bookmark.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-0 top-5">
                                  <BookmarkButton
                                    entryId={job.jobId}
                                    type="job_offering"
                                    size="lg"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                      <p className="text-gray-700">
                        No job post bookmarks found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================== end of info box ================== */}
          </div>
        </div>
      )}

      {uploading && alumInfo && (
        <AlumnusUploadPic
          alumnus={alumInfo}
          uploading={uploading}
          onClose={() => {
            setUploading(false);
            document.body.style.overflow = "auto";
          }}
        />
      )}
    </div>
  );
};

export default UserProfile;
