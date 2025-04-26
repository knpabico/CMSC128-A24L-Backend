"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
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
import { WorkExperienceModal } from "./add-work-experience";
import { ChevronDown, ChevronRight, MapPin, PencilIcon, MapIcon } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import EditWorkExperience from "./edit-work-experience";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { useRouter } from "next/navigation";

const UserProfile = () => {
  const { user, alumInfo, loading } = useAuth();
  const { userWorkExperience, isLoading, deleteWorkExperience } =
    useWorkExperience();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const { isLoaded } = useGoogleMaps();

  // GAWA NI MAYBELLE
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  // -----------------

  const handleDelete = async (id) => {
    const { success, message } = await deleteWorkExperience(id);
    setMessage(message);
    setSuccess(success);
    setDeleteModal(true);
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

  const openEditModal = (index) => {
    const newEditModal = Array(isEditModalOpen.length).fill(false);
    newEditModal[index] = true;
    setEditModalOpen(newEditModal);
  };

  const closeEditModal = (index) => {
    const newEditModal = [...isEditModalOpen];
    newEditModal[index] = false;
    setEditModalOpen(newEditModal);
  };

  const openModal = (index) => {
    const newDeleteModal = [...isDeleteModalOpen];
    newDeleteModal[index] = true;
    setDeleteModalOpen(newDeleteModal);
  };

  const closeModal = (index) => {
    const newDeleteModal = [...isDeleteModalOpen];
    newDeleteModal[index] = false;
    setDeleteModalOpen(newDeleteModal);
  };

  const openMap = (index) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = true;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  const closeMap = (index) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = false;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  const params = useParams();
  const router=useRouter();
  const alumniId = params.alumniId;

  if (loading || isLoading) {
    return <LoadingPage />;
  } else if (user?.uid !== alumniId) {
    return <NotFound />;
  }


  // new (from fe)
  function getFullMonthName(monthIndex) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
  }

  // GAWA NI MAYBELLE
  useEffect(() => {
    // Birthdate parsing
    if (alumInfo?.birthDate) {
      const safeDate = new Date(alumInfo.birthDate.replaceAll('/', '-'));
      setSelectedDate(safeDate);
    }
  
    // Address parsing
    if (Array.isArray(alumInfo?.address) && typeof alumInfo.address[0] === 'string') {
      const [cityVal = '', countryVal = ''] = alumInfo.address[0]
        .split(',')
        .map((part) => part.trim());
  
      setCity(cityVal);
      setCountry(countryVal);
    } else {
      console.warn("Address not in expected format:", alumInfo?.address);
    }
  }, [alumInfo?.birthDate, alumInfo?.address]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 50 }, (_, i) => 1990 + i);

  const selectedMonth = selectedDate.getMonth();
  const selectedDay = selectedDate.getDate();
  const selectedYear = selectedDate.getFullYear();
  //---------------------------

  return (
    <div className="">
      <div style={{backgroundColor: "#3675c5"}} className="pt-20 pb-2 px-60 h-max w-full text-white">
        <div className="flex space-x-10 pb-5">
          <div className="bg-blue-300 w-50 h-50 flex justify-center items-center mb-2 rounded-full">
            pic
          </div>
          <div className="flex flex-col justify-end pb-10">
            <p className="font-bold text-5xl pb-3">{alumInfo?.firstName} {alumInfo?.lastName}</p>
            <p className="font-semibold text-xl">Job Title Here</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Profile</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Record of Donations</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Job Postings</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Bookmarked Jobs</button>
        </div>
      </div>

      <div className="mx-60 my-10">
        <p style={{color: "#3675c5"}} className="text-3xl font-bold mb-5">Your Profile</p>

        <div className="flex space-x-7">
          <div style={{backgroundColor: "#3675c5"}} className="flex flex-col px-2 py-2.5 rounded-xl max-h-fit space-y-1">
            <button className="text-left text-white whitespace-nowrap py-2 px-5 w-70 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition">Personal</button>
            <button className="text-left text-white whitespace-nowrap py-2 px-5 w-70 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition">Education</button>
            <button className="text-left text-white whitespace-nowrap py-2 px-5 w-70 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition">Career</button>
          </div>

          {/* INFO BOX */}

          {/* personal section */}
          {true && (<div className="bg-gray-100 flex flex-col p-5 rounded-xl max-h-fit space-y-1 w-full">

            {/* FULL NAME */}
            <p className="font-semibold">Full Name</p>
            <div className="flex space-x-7 mb-5">
              <div>
                <p className="text-xs font-light">First Name</p>
                <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">{alumInfo?.firstName}</p>
              </div>
              <div>
                <p className="text-xs font-light">Middle Name</p>
                <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">{alumInfo?.middleName ? alumInfo?.middleName : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-light">Last Name</p>
                <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">{alumInfo?.lastName}</p>
              </div>
              <div>
                <p className="text-xs font-light">Suffix</p>
                <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">{alumInfo?.suffix ? alumInfo?.suffix : "N/A"}</p>
              </div>
            </div>
            {/* --------------------- */}

            {/* EMAIL ADDRESS */}
            <div className="flex space-x-7 mb-5">
              <div>
                <p className="font-semibold">Email Address</p>
                <div className="flex">
                  <div>
                    <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">{alumInfo?.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold">Student Number</p>
                <div className="flex">
                  <div>
                    <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">{alumInfo?.studentNumber}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* --------------------- */}

            {/* BIRTHDAY */}
            <p className="font-semibold">Birthday</p>
            <div className="flex space-x-7 mb-5">
              <div>
                <p className="text-xs font-light">Month</p>
                <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{getFullMonthName(new Date(alumInfo?.birthDate).getMonth())}</p>
              </div>
              <div>
                <p className="text-xs font-light">Day</p>
                <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-25 text-gray-500 rounded-md">{new Date(alumInfo?.birthDate).getDay()}</p>
              </div>
              <div>
                <p className="text-xs font-light">Year</p>
                <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-25 text-gray-500 rounded-md">{new Date(alumInfo?.birthDate).getFullYear()}</p>
              </div>
            </div>
            {/* --------------------- */}

            {/* CURRENT LOCATION */}
            <p className="font-semibold">Current Location</p>
            <div className="flex space-x-7">
              <div>
                <p className="text-xs font-light">City/Municipality</p>
                {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[0]}</p>*/}
                <input
                  type="text"
                  placeholder="City/Municipality"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  // value={}
                  // onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-light">Province/State</p>
                {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[0]}</p>*/}
                <input
                  type="text"
                  placeholder="Province/State"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  // value={}
                  // onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-light">Country</p>
                {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[1]}</p>*/}
                <input
                  type="text"
                  placeholder="Country"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  // value={}
                  // onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            {/* --------------------- */}

          </div>)}
          
          {/* education section */}
          {false && (<div className="space-y-7 w-full">
            {/* degree */}
            <div className="bg-gray-100 flex flex-col p-5 rounded-xl max-h-fit space-y-1">
              <div className="space-y-3">
                <p className="font-semibold">Bachelor's Degree</p>
                
                {/* BULLET DIV ; set of all bullets ito */}
                {true && (<div className="space-y-3">

                  {/* INDIVIDUAL BULLET */}
                  <div className="flex items-center space-x-5">
                    <div className="w-6 h-6 rounded-full bg-sky-200"></div>
                    <div>
                      <p className="font-medium">Bachelor of Science in Computer Science</p>
                      <p className="text-sm">University of the Philippines Los Baños</p>
                      <p className="text-sm">Year Graduated: 2026</p>
                    </div>
                  </div>
                  {/* ---- end of individual bullet ---- */}

                </div>)}
                {/* ---- end of bullet div ---- */}

                <button className="flex items-center space-x-3 cursor-pointer">
                  <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                  <p className="text-[#3675c5] text-sm hover:underline">Add bachelor's degree</p>
                </button>
                
              </div>

              <hr className="my-6"></hr> {/* ----------------------------------------------------------- */}

              <div className="space-y-3">
                <p className="font-semibold">Master's Degree</p>
                
                {/* BULLET DIV ; set of all bullets ito */}
                {true && (<div className="space-y-3">

                  {/* INDIVIDUAL BULLET */}
                  <div className="flex items-center space-x-5">
                    <div className="w-6 h-6 rounded-full bg-sky-400"></div>
                    <div>
                      <p className="font-medium">Master of Science in Computer Science</p>
                      <p className="text-sm">University of the Philippines Los Baños</p>
                      <p className="text-sm">Year Graduated: 2026</p>
                    </div>
                  </div>
                  {/* ---- end of individual bullet ---- */}

                </div>)}
                {/* ---- end of bullet div ---- */}

                <button className="flex items-center space-x-3 cursor-pointer">
                  <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                  <p className="text-[#3675c5] text-sm hover:underline">Add master's degree</p>
                </button>
                
              </div>

              <hr className="my-6"></hr> {/* ----------------------------------------------------------- */}

              <div className="space-y-3">
                <p className="font-semibold">Doctoral Degree</p>

                {/* BULLET DIV ; set of all bullets ito */}
                {true && (<div className="space-y-3">

                  {/* INDIVIDUAL BULLET */}
                  <div className="flex items-center space-x-5">
                    <div className="w-6 h-6 rounded-full bg-sky-600"></div>
                    <div>
                      <p className="font-medium">Doctor of Science in Computer Science</p>
                      <p className="text-sm">University of the Philippines Los Baños</p>
                      <p className="text-sm">Year Graduated: 2026</p>
                    </div>
                  </div>
                  {/* ---- end of individual bullet ---- */}

                </div>)}
                {/* ---- end of bullet div ---- */}

                <button className="flex items-center space-x-3 cursor-pointer">
                  <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                  <p className="text-[#3675c5] text-sm hover:underline">Add doctoral degree</p>
                </button>
                
              </div>
              
              
            </div>

            {/* affiliations */}
            <div className="bg-gray-100 flex flex-col p-5 rounded-xl max-h-fit space-y-1">
              <div className="space-y-3">
                <p className="font-semibold">Affiliations</p>
                
                {/* BULLET DIV ; all bullets ito */}
                {true && (<div className="space-y-3">

                  {/* INDIVIDUAL BULLET */}
                  <div className="flex items-center space-x-5">
                    <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                    <div>
                      <p className="font-medium">Juan Miguel Bawagan Fangirls Society</p>
                      <p className="text-sm">University of the Philippines Los Baños</p>
                      <p className="text-sm">Year Joined: 2020</p>
                    </div>
                  </div>
                  {/* ---- end of individual bullet ---- */}

                </div>)}
                {/* ---- end of bullet div ---- */}

                <button className="flex items-center space-x-3 cursor-pointer">
                  <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                  <p className="text-[#3675c5] text-sm hover:underline">Add affiliation</p>
                </button>
                
              </div>
              
            </div>
          </div>)}

          {/* career section */}
          {false && (<div className="bg-gray-100 flex flex-col p-5 rounded-xl max-h-fit space-y-1 w-full">
            <div className="space-y-3">
              <p className="font-semibold">Work Experience</p>
              
              {/* BULLET DIV ; set of all bullets ito */}
              {true && (<div className="space-y-3">

                {/* INDIVIDUAL BULLET */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-5">
                    <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                    <div>
                      <p className="font-medium">Senior Developer</p>
                      <p className="text-sm">Google &nbsp;•&nbsp; <span className="font-light italic">Software Engineering</span></p>
                      <p className="text-sm">2025 - Present</p>
                    </div>
                  </div>
                  <div className="flex space-x-10">
                    <button className="flex items-center space-x-2 cursor-pointer">
                      <p className="text-[#3675c5]"><MapPin/></p>
                      <p className="text-[#3675c5] text-sm hover:underline">View in map</p>
                    </button>
                    <button className="flex items-center space-x-2 cursor-pointer">
                      <p className="text-[#3675c5]"><PencilIcon/></p>
                      <p className="text-[#3675c5] text-sm hover:underline">Edit</p>
                    </button>
                    </div>
                </div>
                {/* ---- end of individual bullet ---- */}

              </div>)}
              {/* ---- end of bullet div ---- */}

              <button className="flex items-center space-x-3 cursor-pointer">
                <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                <p className="text-[#3675c5] text-sm hover:underline">Add work experience</p>
              </button>
              
            </div>    
          </div>)}


          {/* ================== end of info box ================== */}

        </div>
      </div>

    </div>
  );
};

export default UserProfile;
