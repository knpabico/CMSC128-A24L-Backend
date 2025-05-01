"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { useEducation } from "@/context/EducationContext";
import AlumnusUploadPic from "./upload-profile/page";
import Image from "next/image";
import { Alumnus } from "@/models/models";


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
import { ChevronDown, ChevronRight, MapPin, PencilIcon, MapIcon, XIcon } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import EditWorkExperience from "@/components/ui/edit-experience-modal"
import PhotoUpload from "../../upload-photo/page";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { useRouter } from "next/navigation";
import AddEducationModal from "@/components/ui/add-aducation-modal";
import { WorkExperience,Education, Affiliation } from "@/models/models";
import AddAffiliationModal from "@/components/ui/add-affiliation-modal";
import RecordOfDonations from "@/components/ui/return-of-donations-modal";
import AlumniBookmarks from "@/components/ui/bookmarks-alumni-modal";
import AddWorkExperience from "@/components/ui/add-experience-modal";
import AlumniJobOffers from "@/components/ui/job-posting-modal";
import { useAffiliation } from "@/context/AffiliationContext";
import { useAlums } from "@/context/AlumContext";
import { PlusCircleIcon, CircleUserRoundIcon, GraduationCapIcon, BriefcaseIcon } from "lucide-react";


const UserProfile = () => {
  const { user, alumInfo, loading } = useAuth();
  const { userWorkExperience, isLoading, deleteWorkExperience } =
    useWorkExperience();
    const { userEducation, isLoadingEducation, deleteEducation} = useEducation();
    const { userAffiliation } = useAffiliation();
    const {updateAlumniDetails} = useAlums();

    
  const [uploading, setUploading] =useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const { isLoaded } = useGoogleMaps();
  const [educationView,setEducationView]= useState(false); //pang track if pinindot ba ni User yung education
  const [personalView,setPersonalView]= useState(true); //pang track if pinindot ba ni User yung personal same sa career
  const [careerView,setCareerView]= useState(false);
  const [degreeType, setDegreeType] = useState("");
  const [addAffiliation, setaddAffiliation] = useState(false);

  //for tabs
  const [seeProfile, setSeeProfile]= useState(true)
  const [seeDonations, setSeeDonations]= useState(false)
  const [seeBookmarks, setSeeBookmarks]= useState(false)
  const [seeJobpostings, setSeeJobPosting]= useState(false)



  const [addBachelor,setAddBachelor]= useState(false); 
  const [addMasters,setAddMasters]= useState(false); 
  const [addDoctoral,setAddDoctoral]= useState(false);
  const [showUploader, setShowUploader] = useState(false);

  //Edit the personal field information
  const [email, setEmail] = useState(alumInfo?.email || "");
  const [firstName, setFirstName] = useState(alumInfo?.firstName || "");
  const [lastName, setLastName] = useState(alumInfo?.lastName || "");
  const [middleName, setMiddleName] = useState(alumInfo?.middleName || "");
  const [suffix,setSuffix] = useState(alumInfo?.suffix || "");
  const [studentNumber,setStudentNumber] = useState(alumInfo?.studentNumber || "");
  const [city,setCity] = useState(alumInfo?.address[2] || "");
  const [province,setProvince] = useState(alumInfo?.address[1] || "");
  const [country,setCountry] = useState(alumInfo?.address[0] || "");

  //for birthday
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 125 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (alumInfo) {
      setFirstName(alumInfo.firstName || "");
      setMiddleName(alumInfo.middleName || "");
      setLastName(alumInfo.lastName || "");
      setSuffix(alumInfo.suffix || "");
      setEmail(alumInfo.email || "");
      setStudentNumber(alumInfo.studentNumber || "");
      setCity(alumInfo.address?.[2] || "");
      setProvince(alumInfo.address?.[1] || "");
      setCountry(alumInfo.address?.[0] || "");
  
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
    "Artificial Intelligence (AI)",
    "Machine Learning (ML)",
    "Data Science",
    "Cybersecurity",
    "Software Engineering",
    "Computer Networks",
    "Computer Graphics and Visualization",
    "Human-Computer Interaction (HCI)",
    "Theoretical Computer Science",
    "Operating Systems",
    "Databases",
    "Web Development",
    "Mobile Development",
    "Cloud Computing",
    "Embedded Systems",
    "Robotics",
    "Game Development",
    "Quantum Computing",
    "DevOps and System Administration",
    "Information Systems",
    "Others"
  ];
  
  const handleFieldsSelect = (field: string) => {
    if (!selectedFields.includes(field)) {
        setSelectedFields([...selectedFields, field]);
      }

      console.log("here is my intereste:", selectedFields);
    };

  const handleFieldRemove = (fieldToRemove: string) => {
      setSelectedFields(selectedFields.filter((field) => field !== fieldToRemove));
    };


  //function when save changes was clicked
  const handleTheSaveChages = () => {
    // let updatedAlumnus = {
    //   firstName: firstName,
    //   middleName:middleName,
    //   lastName: lastName,
    //   suffix:suffix,
    //   email: email,
    //   studentNumber: studentNumber,
    //   address: [country, province, city],
    //   birthDate: new Date(`${month} ${day}, ${year}`),
    //   fieldOfInterest: selectedFields,
    // }
    updateAlumniDetails(
      alumInfo,
      firstName,
      middleName,
      lastName,
      suffix,
      email,
      studentNumber,
      [country, province, city],
      new Date(`${month} ${day}, ${year}`),
      selectedFields
    );
    // console.log(updatedAlumnus);
  }
  
  // GAWA NI MAYBELLE
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openAddModal, setOpenAddModal] = useState(false);

  // -----------------

  const handleDelete = async (id: any) => {
    const { success, message } = await deleteWorkExperience(id);
    setMessage(message);
    setSuccess(success);
    setDeleteModal(true);
  };

  //pagpindot sa buttons and tabs
  const handleProfileClick = () => {
    setSeeProfile(true);
    setSeeBookmarks(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(true);
    setCareerView(false);
    setEducationView(false);
  };

  const handleEducationClick = () => {
    setSeeProfile(true);
    setSeeBookmarks(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);
    setEducationView(true);
  };

  const handlePersonalClick = () => {
    setSeeProfile(true);
    setEducationView(false);
    setCareerView(false);
    setSeeBookmarks(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(true);
  };


  
  const handleCareerClick = () => {
    setSeeProfile(true);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(true);
  };
  const handleDonationsClick =() => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeDonations(true);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);
  }
  const handleBookmarksClick =() => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(true);
    setSeeDonations(false);
    setSeeJobPosting(false);
    setPersonalView(false);
    setCareerView(false);
  }
  const handleJobpostingClick =() => {
    setSeeProfile(false);
    setEducationView(false);
    setSeeBookmarks(false);
    setSeeDonations(false);
    setSeeJobPosting(true);
    setPersonalView(false);
    setCareerView(false);
  }
  //===========================


  //upload Image
  const handleUploadImage =() => {
    console.log("Hello");
    if (uploading){
      setUploading(false);
    }else{
      setUploading(true)
    }
  }

  

  //pagdagdag sa education
  const handleAddBachelor = () => {
    document.body.style.overflow = 'hidden';
    setAddMasters(false);
    setAddDoctoral(false);
    console.log("@ Bachelor");
    setDegreeType("Bachelor");
    setAddBachelor(true);
  }

  const handleAddMasters = () => {
    document.body.style.overflow = 'hidden';
    setAddDoctoral(false);
    setAddBachelor(false);
    setDegreeType("Masters");
    setAddMasters(true);
  };
  
  const handleAddDoctoral = () => {
    document.body.style.overflow = 'hidden';
    setAddMasters(false);
    setAddBachelor(false);
    setDegreeType("Doctoral");
    setAddDoctoral(true);
  };


  const handleAddAffiliation = () => {
    document.body.style.overflow = 'hidden';
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

  const openEditModal = (index:number) => {
    const newEditModal = [...isEditModalOpen];
    newEditModal[index] = true;
    setEditModalOpen(newEditModal);
  };

  const closeEditModal = (index:number) => {
    const newEditModal = [...isEditModalOpen];
    newEditModal[index] = false;
    setEditModalOpen(newEditModal);
  };

  const openModal = (index:number) => {
    const newDeleteModal = [...isDeleteModalOpen];
    newDeleteModal[index] = true;
    setDeleteModalOpen(newDeleteModal);
  };

  const closeModal = (index:number) => {
    const newDeleteModal = [...isDeleteModalOpen];
    newDeleteModal[index] = false;
    setDeleteModalOpen(newDeleteModal);
  };

  const openMap = (index:number) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = true;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  const closeMap = (index:number) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = false;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  const params = useParams();
  const router=useRouter();
  const alumniId = params.alumniId;

  const goToAlumniDonations = () => {
    router.push(`/alumni/my-profile/${alumniId}/alumni-donations`);
  };

  if (loading || isLoading) {
    return <LoadingPage />;
  } else if (user?.uid !== alumniId) {
    return <NotFound />;
  }


  const currentWorkExperience = userWorkExperience.filter(
    (item: WorkExperience) => item.endYear === "Present"
  );


  // new (from fe)
  function getFullMonthName(monthIndex: number) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
  }

  const selectedMonth = selectedDate.getMonth();
  const selectedDay = selectedDate.getDate();
  const selectedYear = selectedDate.getFullYear();
  //---------------------------

  return (
    <div>
      <div style={{backgroundColor: "#3675c5"}} className="relative bg-cover bg-center pt-15 px-50 text-white shadow-md">
        <div className="flex space-x-10 pb-5">
          <div className="bg-blue-300 w-50 h-50 flex justify-center items-center mb-2 rounded-full" onClick={handleUploadImage}>
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
            <span className="text-white">pic</span>
          )}
          </div>
          <div className="flex flex-col justify-end pb-10">
            <p className="font-bold text-5xl pb-3">{alumInfo?.firstName} {alumInfo?.lastName}</p>
            {userWorkExperience.filter((item: WorkExperience) => item.endYear === "Present")
              .map((item: WorkExperience, index: number) => (
                <div key={index} className="work-experience-item">
                  <p className="font-semibold text-xl">{item.jobTitle}</p>
                </div>
              ))
            }
          </div>
        </div>
        <hr className="text-xs"></hr>
        <div className="flex gap-10">
          <div className={`${seeProfile ? "border-b-5 border-[#EAEAEA]" : ""}`}>
            <button className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${seeProfile ? "rounded-b-none font-bold" : "hover:bg-white/20 transition"}`}
              onClick={handleProfileClick}>Profile</button>
          </div>
          <div className={`${seeDonations ? "border-b-5 border-[#EAEAEA]" : ""}`}>
            <button className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${seeDonations ? "rounded-b-none font-bold" : "hover:bg-white/20 transition"}`}
              onClick={handleDonationsClick}>Record of Donations</button>
          </div>
          <div className={`${seeJobpostings ? "border-b-5 border-[#EAEAEA]" : ""}`}>
            <button className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${seeJobpostings ? "rounded-b-none font-bold" : "hover:bg-white/20 transition"}`}
              onClick={handleJobpostingClick}>Job Postings</button>
          </div>
          <div className={`${seeBookmarks ? "border-b-5 border-[#EAEAEA]" : ""}`}>
            <button className={`whitespace-nowrap mb-1 mt-2 py-3 px-3 w-fit cursor-pointer rounded-md text-sm ${seeBookmarks ? "rounded-b-none font-bold" : "hover:bg-white/20 transition"}`}
              onClick={handleBookmarksClick}>Bookmarks</button>
          </div>
        </div>
      </div>

      {seeProfile && (<div className="mx-50 my-15">
        <div className="flex space-x-7">

          <div className='bg-[#3675c5] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 '>
            <button className={`flex gap-4 text-left text-white whitespace-nowrap py-2 px-5 w-60 cursor-pointer hover:bg-gray-100/20 transition rounded-sm ${personalView ? "bg-gray-100/20 font-bold" : ""}`} onClick={handlePersonalClick}>
              <span><CircleUserRoundIcon/></span><span>Personal</span>
            </button>
            <button className={`flex gap-4 text-left text-white whitespace-nowrap py-2 px-5 w-60 cursor-pointer hover:bg-gray-100/20 transition rounded-sm ${educationView ? "bg-gray-100/20 font-bold" : ""}`} onClick={handleEducationClick}>
              <span><GraduationCapIcon/></span><span>Education</span>
            </button>
            <button className={`flex gap-4 text-left text-white whitespace-nowrap py-2 px-5 w-60 cursor-pointer hover:bg-gray-100/20 transition rounded-sm ${careerView ? "bg-gray-100/20 font-bold" : ""}`} onClick={handleCareerClick}>
              <span><BriefcaseIcon/></span><span>Career</span>
            </button>
          </div>

          {/* INFO BOX */}

          {/* personal section */}
          {personalView && (<div>
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
                    value={middleName? middleName: "N/A"}
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
                    value={lastName? lastName: "N/A"}
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
                    value={suffix? suffix: "N/A"}
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

                <div>
                  <p className="font-semibold">Student Number</p>
                  <div className="flex">
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
                    disabled
                  />
                  </div>
                </div>
              </div>

              {/* BIRTHDAY */}
              <p className="font-semibold">Birthday</p>
              <div className="flex space-x-7 mb-7">
                <div className="relative">
                  <p className="text-xs font-light">Month</p>
                  <div className="relative">
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="appearance-none py-2 px-4 pr-10 border border-gray-500 rounded-md w-full text-gray-700"
                    >
                      <option value="">Month</option>
                      {months.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <p className="text-xs font-light">Day</p>
                  <div className="relative">
                    <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="appearance-none py-2 px-4 border pr-10 border-gray-500 rounded-md w-full text-gray-700"
                    >
                      <option value="">Day</option>
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <p className="text-xs font-light">Year</p>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="appearance-none py-2 px-4 pr-10 border border-gray-500 rounded-md w-full text-gray-700"
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                  
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
              <div className="space-y-5">
                <div>
                  <p className="font-semibold">Fields of Interest</p>
                  <p className="font-light text-xs mb-1">Selected: {selectedFields.length}/5 &nbsp;&nbsp; {selectedFields.length >= 5 && (<span className="text-red-500 font-medium">Maximum has been reached: 5</span>)}</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Display fields */}
                    {selectedFields.map((tag) => (
                      <div
                        key={tag}
                        className="bg-[#c2d5ef] px-4 py-2 rounded-md cursor-pointer text-sm flex items-center justify-between space-x-5"
                      >
                        <span>{tag}</span>
                        <XIcon className="text-gray-700 hover:text-red-500 cursor-pointer w-4 h-4" onClick={() => handleFieldRemove(tag)}/>
                      </div>
                    ))}
                  </div>
                </div>

                

                {/* List of all tags */}
                {selectedFields.length < 5 && (<div className="flex flex-wrap gap-2">
                  {fields
                  .filter(field => !selectedFields.includes(field))
                  .map((field) => (
                    <button
                      key={field}
                      className="bg-gray-200 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 text-sm"
                      onClick={() => handleFieldsSelect(field)}
                    >
                      {field}
                    </button>
                  ))}
                </div>)}

                {selectedFields.length >= 5 && (
                  <div>
                    <div className="flex flex-wrap gap-2">
                    {fields
                    .filter(field => !selectedFields.includes(field))
                    .map((field) => (
                      <button
                        key={field}
                        disabled
                        className="bg-gray-200 px-4 py-2 rounded-md cursor-not-allowed text-gray-500 text-sm"
                        onClick={() => handleFieldsSelect(field)}
                      >
                        {field}
                      </button>
                    ))}
                    </div>
                  </div>
                  
                )}
              </div>
            </div>
            <button className="my-5 w-50 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]" onClick={handleTheSaveChages}>Save Changes</button>
          </div>)}

          {/* education section */}
          {educationView && (<div className="space-y-7 w-full">
            {/* degree */}
            <div className="bg-white flex flex-col p-7 rounded-xl max-h-fit space-y-1 shadow-md">
              <div className="space-y-3">
                <p className="font-semibold">Bachelor's Degree</p>
                
                <div className="space-y-5">

                  {/* INDIVIDUAL BULLET */}
                  {userEducation.filter((edu: { type: string; }) => edu.type === "Bachelor").sort((a, b) => b.yearGraduated - a.yearGraduated).map((edu:Education, index:number) => (

                  <div className="flex items-center space-x-5" key={index}>
                    <div className="w-6 h-6 rounded-full bg-[#b9e5fe]"></div>
                    <div>
                      <p className="font-medium">{edu.major}</p>
                      <p className="text-sm">{edu.university}</p>
                      <p className="text-sm">Year Graduated: {edu.yearGraduated}</p>
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

              <hr className="my-6"></hr> {/* ----------------------------------------------------------- */}

              <div className="space-y-3">
                <p className="font-semibold">Master's Degree</p>
                
                {/* BULLET DIV ; set of all bullets ito */}
                <div className="space-y-5">

                  {/* INDIVIDUAL BULLET */}
                  {userEducation.filter((edu: { type: string; }) => edu.type === "Masters").sort((a, b) => b.yearGraduated - a.yearGraduated).map((edu:Education, index:number)=>(

                  <div className="flex items-center space-x-5" key={index}>
                    <div className="w-6 h-6 rounded-full bg-[#00bcfc]"></div>
                    <div>
                      <p className="font-medium">{edu.major}</p>
                      <p className="text-sm">{edu.university}</p>
                      <p className="text-sm">Year Graduated: {edu.yearGraduated}</p>
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

              <hr className="my-6"></hr> {/* ----------------------------------------------------------- */}

              <div className="space-y-3">
                <p className="font-semibold">Doctoral Degree</p>

                {/* BULLET DIV ; set of all bullets ito */}
                <div className="space-y-5">

                  {/* INDIVIDUAL BULLET */}
                  {userEducation.filter((edu: { type: string; }) => edu.type === "Doctoral").sort((a, b) => b.yearGraduated - a.yearGraduated).map((edu:Education, index:number)=>(

                  <div className="flex items-center space-x-5" key={index}>
                    <div className="w-6 h-6 rounded-full bg-[#0282d2]"></div>
                    <div>
                      <p className="font-medium">{edu.major}</p>
                      <p className="text-sm">{edu.university}</p>
                      <p className="text-sm">Year Graduated: {edu.yearGraduated}</p>
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
                  {userAffiliation.sort((a, b) => b.yearJoined - a.yearJoined).map((affiliation:Affiliation, index:number)=> (
                    <div className="flex items-center space-x-5" key={index}>
                      <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                      <div>
                        <p className="font-medium">{affiliation.affiliationName}</p>
                        <p className="text-sm">{affiliation.university}</p>
                        <p className="text-sm">Year Joined: {affiliation.yearJoined}</p>
                      </div>
                    </div>
                  )
                  )}
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
          </div>)}

          {/* career section */}
          {careerView && (<div className="space-y-7 w-full">
            <div className="bg-white flex flex-col p-7 rounded-xl max-h-fit space-y-1 w-full shadow-md">
              <div className="space-y-3">
                <p className="font-semibold">Work Experience</p>

                {/* BULLET DIV */}
                <div className="space-y-5">

                  {userWorkExperience.map((item:WorkExperience, index:number) => (
                    <div key={index} className="flex justify-between">
                      <div className="flex items-center space-x-5">
                        <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                        <div>
                          <p className="font-medium">{item.jobTitle}</p>
                          <p className="text-sm">{item.company} &nbsp;•&nbsp; <span className="font-extralight">{item.industry}</span></p>
                          <p className="text-sm">{item.startYear} - {item.endYear}</p>
                        </div>
                      </div>
                      

                      <div className="flex space-x-10">
                        <button className="flex items-center space-x-2 cursor-pointer" onClick={() => openMap(index)}>
                          <p className="text-[#3675c5]"><MapPin/></p>
                          <p className="text-[#3675c5] text-sm hover:underline">View in map</p>
                        </button>
                        <button className="flex items-center space-x-2 cursor-pointer" onClick={() => {openEditModal(index); document.body.style.overflow = 'hidden'}}>
                          <p className="text-[#3675c5]"><PencilIcon/></p>
                          <p className="text-[#3675c5] text-sm hover:underline">Edit</p>
                        </button>
                      </div>

                      <EditWorkExperience
                        open={isEditModalOpen[index]}
                        onClose={() => {closeEditModal(index); document.body.style.overflow = 'auto'}}
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
                            <p className="text-xl font-bold pb-3">{item.company} Location</p>
                            <button onClick={() => closeMap(index)} className="absolute top-0 right-0"><XIcon className="cursor-pointer hover:text-red-500"/></button>
                          </div>
                          <div className="h-[400px] w-full">
                            {!isLoaded ? (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-xl text-gray-600">Loading map...</p>
                              </div>
                            ) : (
                              <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={{ lat: item.latitude, lng: item.longitude }}
                                zoom={15}
                              >
                                <Marker
                                  position={{ lat: item.latitude, lng: item.longitude }}
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
                  ))}

                </div>

                <button
                  className="flex items-center space-x-3 cursor-pointer group pt-3"
                  type="button"
                  onClick={() => {setOpenAddModal(true); document.body.style.overflow = 'hidden'}}
                >
                  <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                  <p className="text-[#3675c5] text-sm group-hover:underline">
                    Add work experience
                  </p>
                </button>
              </div>

              
              
              {alumInfo?.alumniId && (
                <AddWorkExperience
                  open={openAddModal}
                  alumniId={alumInfo.alumniId}
                  numOfPresentJobs={currentWorkExperience.length}
                  onClose={() => {setOpenAddModal(false); document.body.style.overflow = 'auto'}}
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
          </div>)}


          {/* ================== end of info box ================== */}

        </div>
      </div>)}

      {/* Modal Sectionn */}
      {addBachelor && (
        <AddEducationModal
          open={addBachelor}
          onClose={() => {setAddBachelor(false); document.body.style.overflow = 'auto'}}
          userId={alumInfo?.alumniId}
          setSuccess={setSuccess}
          degreeType={degreeType}
        />
      )}
      {addMasters && (
        <AddEducationModal
          open={addMasters}
          onClose={() => {setAddMasters(false); document.body.style.overflow = 'auto'}}
          userId={alumInfo?.alumniId}
          setSuccess={setSuccess}
          degreeType={degreeType}
        />
      )}
      {addDoctoral && (
        <AddEducationModal
          open={addDoctoral}
          onClose={() => {setAddDoctoral(false); document.body.style.overflow = 'auto'}}
          userId={alumInfo?.alumniId}
          setSuccess={setSuccess}
          degreeType={degreeType}

        />
      )}
      {addAffiliation && (
        <AddAffiliationModal
        open= {addAffiliation}
        onClose={()=> {setaddAffiliation(false); document.body.style.overflow = 'auto'}}
        userId={alumInfo?.alumniId}
        setSuccess={setSuccess}
        />
      )}


      {seeDonations && <RecordOfDonations/>}
      {seeBookmarks && <AlumniBookmarks/>}
      {seeJobpostings && <AlumniJobOffers/>}


      {uploading &&  <AlumnusUploadPic alumnus={alumInfo} uploading={uploading} onClose={() => setUploading(false)}/>}

    </div>
  );
};

export default UserProfile;
