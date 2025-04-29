"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { useEducation } from "@/context/EducationContext";
import AlumnusUploadPic from "./upload-profile/page";
import Image from "next/image";


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
import EditWorkExperience from "@/components/ui/edit-experience-modal"
import PhotoUpload from "../../upload-photo/page";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { useRouter } from "next/navigation";
import AddEducationModal from "@/components/ui/add-aducation-modal";
import { WorkExperience,Education, Affiliation } from "@/models/models";
import AddAffiliationModal from "@/components/ui/add-affiliation-modal";
import { useAffiliation } from "@/context/AffiliationContext";
const UserProfile = () => {
  const { user, alumInfo, loading } = useAuth();
  const { userWorkExperience, isLoading, deleteWorkExperience } =
    useWorkExperience();
    const { userEducation, isLoadingEducation, deleteEducation} = useEducation();
    const { userAffiliation } = useAffiliation();

    
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
    if (alumInfo?.birthDate) {
      const date = new Date(alumInfo.birthDate);
      setDay(date.getDate().toString());
      setMonth((date.getMonth() + 1).toString());
      setYear(date.getFullYear().toString());
    }
  }, [alumInfo]);



  //for the fields of interest
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const fields = [
    "Software Development",
    "Cybersecurity",
    "Artificial Intelligence & Machine Learning",
    "Data Science & Big Data",
    "Cloud Computing & DevOps",
    "Computer Networks & Systems Administration",
    "Blockchain & Web3 Development",
    "Computer Graphics & Multimedia",
    "Embedded Systems & IoT (Internet of Things)",
    "Bioinformatics & Computational Biology",
    "Robotics & Automation",
    "Theoretical Computer Science & Research",
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


  
  // GAWA NI MAYBELLE
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // -----------------

  const handleDelete = async (id: any) => {
    const { success, message } = await deleteWorkExperience(id);
    setMessage(message);
    setSuccess(success);
    setDeleteModal(true);
  };

  //pagpindot sa buttons
  const handleEducationClick = () => {
    setPersonalView(false);
    setCareerView(false);
    setEducationView(true);
  };

  const handlePersonalClick = () => {
    setEducationView(false);
    setCareerView(false);
    setPersonalView(true);
  };

  
  const handleCareerClick = () => {
    setEducationView(false);
    setPersonalView(false);
    setCareerView(true);
  };
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
    setAddMasters(false);
    setAddDoctoral(false);
    console.log("@ Bachelor");
    setDegreeType("Bachelor");
    setAddBachelor(true);
  }

  const handleAddMasters = () => {
    setAddDoctoral(false);
    setAddBachelor(false);
    setDegreeType("Masters");
    setAddMasters(true);
  };
  
  const handleAddDoctoral = () => {
    setAddMasters(false);
    setAddBachelor(false);
    setDegreeType("Doctoral");
    setAddDoctoral(true);
  };


  const handleAddAffiliation = () => {
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
    console.log("Opem Modal");
    const newEditModal = Array(isEditModalOpen.length).fill(false);
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


  // new (from fe)
  function getFullMonthName(monthIndex: number) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
  }

  // // GAWA NI MAYBELLE
  // useEffect(() => {
  //   // Birthdate parsing
  //   if (alumInfo?.birthDate) {
  //     const safeDate = new Date(alumInfo.birthDate.replaceAll('/', '-'));
  //     setSelectedDate(safeDate);
  //   }
  
  //   // Address parsing
  //   if (Array.isArray(alumInfo?.address) && typeof alumInfo.address[0] === 'string') {
  //     const [cityVal = '', countryVal = ''] = alumInfo.address[0]
  //       .split(',')
  //       .map((part) => part.trim());
  
  //     setCity(cityVal);
  //     setCountry(countryVal);
  //   } else {
  //     console.warn("Address not in expected format:", alumInfo?.address);
  //   }
  // }, [alumInfo?.birthDate, alumInfo?.address]);

  // const months = [
  //   'January', 'February', 'March', 'April', 'May', 'June',
  //   'July', 'August', 'September', 'October', 'November', 'December',
  // ];
  // const days = Array.from({ length: 31 }, (_, i) => i + 1);
  // const years = Array.from({ length: 50 }, (_, i) => 1990 + i);

  const selectedMonth = selectedDate.getMonth();
  const selectedDay = selectedDate.getDate();
  const selectedYear = selectedDate.getFullYear();
  //---------------------------

  return (
    <div className="">
      <div style={{backgroundColor: "#3675c5"}} className="pt-20 pb-2 px-60 h-max w-full text-white">
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
            <p className="font-semibold text-xl">Job Title Here</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Profile</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition"  
            onClick={() => { if(user?.uid) {router.push(`/my-profile/${user.uid}/alumni-donations`)}}}>
              Record of Donations
          </button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition"
          onClick={() => { if(user?.uid) {router.push(`/my-profile/${user.uid}/alumni-joboffers`)}}}>
            Job Postings</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition"
          onClick={() => { if(user?.uid) {router.push(`/my-profile/${user.uid}/alumni-bookmark`)}}}>
            Bookmarked Jobs
            </button>
        </div>
      </div>

      <div className="mx-60 my-10">
        <p style={{color: "#3675c5"}} className="text-3xl font-bold mb-5">Your Profile</p>

        <div className="flex space-x-7">
          <div style={{backgroundColor: "#3675c5"}} className="flex flex-col px-2 py-2.5 rounded-xl max-h-fit space-y-1">
            <button className={`text-left text-white whitespace-nowrap py-2 px-5 w-70 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition ${personalView ? "bg-gray-100/20" : ""}`} onClick={handlePersonalClick}>Personal</button>
            <button className={`text-left text-white whitespace-nowrap py-2 px-5 w-70 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition ${educationView ? "bg-gray-100/20" : ""}`} onClick={handleEducationClick}>Education</button>
            <button className={`text-left text-white whitespace-nowrap py-2 px-5 w-70 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition ${careerView ? "bg-gray-100/20" : ""}`} onClick={handleCareerClick}>Career</button>
          </div>

          {/* INFO BOX */}

          {/* personal section */}
          {personalView && (<div className="bg-white flex flex-col p-5 rounded-xl max-h-fit space-y-1 w-full">

            {/* FULL NAME */}
            <p className="font-semibold">Full Name</p>
            <div className="flex space-x-7 mb-5">
              <div>
                <p className="text-xs font-light">First Name</p>
                  <div className="flex">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
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
                />
                </div>
              </div>
            </div>
            {/* --------------------- */}

            {/* EMAIL ADDRESS */}
            <div className="flex space-x-7 mb-5">
              <div>
                <p className="font-semibold">Email Address</p>
                <div className="flex">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md"
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
                />
                </div>
              </div>
            </div>
            
            {/* --------------------- */}

            {/* BIRTHDAY */}
            <p className="font-semibold mb-1">Birthday*</p>
            <div className="flex space-x-4 mb-5">
              <div>
                <p className="text-xs font-light mb-1">Month</p>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md w-35 text-gray-700"
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-light mb-1">Day</p>
                <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md w-20 text-gray-700"
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-light mb-1">Year</p>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md w-30 text-gray-700"
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-2 mb-4">

      </div>

      {/* <div className="text-gray-700">
        Selected Date: <span className="font-medium">{date || "—"}</span>
      </div> */}

            {/* CURRENT LOCATION */}
            <p className="font-semibold">Current Location</p>
            <div className="flex space-x-7">
              <div>
                <p className="text-xs font-light">City/Municipality</p>
                {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[0]}</p>*/}
                <input
                  type="text"
                  // placeholder="City/Municipality"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-light">Province/State</p>
                {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[0]}</p>*/}
                <input
                  type="text"
                  placeholder="Province/State"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-light">Country</p>
                {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[1]}</p>*/}
                <input
                  type="text"
                  // placeholder="Country"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            {/* --------------------- */}

            {/* field if interest */}
            {/* sorry di ko na na by row TmT */}

            <div className="flex flex-col space-y-2">
              <p className="font-semibold">field of interest</p>
              <div className="flex flex-wrap gap-2">
                {/* Display selected tags */}
                {selectedFields.map((tag) => (
                  <div
                    key={tag}
                    className="bg-blue-200 px-4 py-2 rounded-full flex items-center justify-between"
                  >
                    <span>{tag}</span>
                    <button
                      className="ml-2 text-red-600"
                      onClick={() => handleFieldRemove(tag)}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              {/* List of all tags */}
              <div className="flex flex-wrap gap-2">
                {fields.map((field) => (
                  <button
                    key={field}
                    className="bg-gray-200 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
                    onClick={() => handleFieldsSelect(field)}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>
                <Button>Save Changes</Button>
          </div>)}

          {/* education section */}
          {educationView && (<div className="space-y-7 w-full">
            {/* degree */}
            <div className="bg-white flex flex-col p-5 rounded-xl max-h-fit space-y-1">
              <div className="space-y-3">
                <p className="font-semibold">Bachelor's Degree</p>
                
                {true && (<div className="space-y-3">

                  {/* INDIVIDUAL BULLET */}
                  {userEducation.filter((edu: { type: string; }) => edu.type === "Bachelor").map((edu:Education, index:number)=>(

                  <div className="flex items-center space-x-5" key={index}>
                    <div className="w-6 h-6 rounded-full bg-sky-400"></div>
                    <div>
                      <p className="font-medium">{edu.major}</p>
                      <p className="text-sm">{edu.university}</p>
                      <p className="text-sm">Year Graduated: {edu.yearGraduated}</p>
                    </div>
                  </div>


                  ))}
                  {/* ---- end of individual bullet ---- */}

                </div>)}

                <button className="flex items-center space-x-3 cursor-pointer" onClick={handleAddBachelor}>
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
                  {userEducation.filter((edu: { type: string; }) => edu.type === "Masters").map((edu:Education, index:number)=>(

                  <div className="flex items-center space-x-5" key={index}>
                    <div className="w-6 h-6 rounded-full bg-sky-400"></div>
                    <div>
                      <p className="font-medium">{edu.major}</p>
                      <p className="text-sm">{edu.university}</p>
                      <p className="text-sm">Year Graduated: {edu.yearGraduated}</p>
                    </div>
                  </div>


                  ))}
                  {/* ---- end of individual bullet ---- */}

                </div>)}
                {/* ---- end of bullet div ---- */}

                <button className="flex items-center space-x-3 cursor-pointer">
                  <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                  <p className="text-[#3675c5] text-sm hover:underline" onClick={handleAddMasters}>Add master's degree</p>
                </button>
                
              </div>

              <hr className="my-6"></hr> {/* ----------------------------------------------------------- */}

              <div className="space-y-3">
                <p className="font-semibold">Doctoral Degree</p>

                {/* BULLET DIV ; set of all bullets ito */}
                {true && (<div className="space-y-3">

                  {/* INDIVIDUAL BULLET */}
                  {userEducation.filter((edu: { type: string; }) => edu.type === "Doctoral").map((edu:Education, index:number)=>(

                  <div className="flex items-center space-x-5" key={index}>
                    <div className="w-6 h-6 rounded-full bg-sky-400"></div>
                    <div>
                      <p className="font-medium">{edu.major}</p>
                      <p className="text-sm">{edu.university}</p>
                      <p className="text-sm">Year Graduated: {edu.yearGraduated}</p>
                    </div>
                  </div>


                  ))}
                  {/* ---- end of individual bullet ---- */}

                </div>)}
                {/* ---- end of bullet div ---- */}

                <button className="flex items-center space-x-3 cursor-pointer" onClick={handleAddDoctoral}>
                  <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                  <p className="text-[#3675c5] text-sm hover:underline">Add doctoral degree</p>
                </button>
                
              </div>
              
              
            </div>

            {/* affiliations */}
            <div className="bg-white flex flex-col p-5 rounded-xl max-h-fit space-y-1">
              <div className="space-y-3">
                <p className="font-semibold">Affiliations</p>
                
                {/* BULLET DIV ; all bullets ito */}
                {true && (<div className="space-y-3">

                  {/* INDIVIDUAL BULLET */}
                  {userAffiliation.map((affiliation:Affiliation, index:number)=> (
                    <div className="flex items-center space-x-5" key={index}>
                      <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                      <div>
                        <p className="font-medium">{affiliation.affiliationName}</p>
                        <p className="text-sm">University: {affiliation.university}</p>
                        <p className="text-sm">Year Joined: 2020</p>
                      </div>
                    </div>
                  )
                  )}
                  {/* ---- end of individual bullet ---- */}

                </div>)}
                {/* ---- end of bullet div ---- */}

                <button className="flex items-center space-x-3 cursor-pointer" onClick={handleAddAffiliation}>
                  <p className="text-[#3675c5] border-2 border-[#3675c5] hover:bg-[#3675c5] hover:text-white bg-white px-1.5 py-0 rounded-full">+</p>
                  <p className="text-[#3675c5] text-sm hover:underline">Add affiliation</p>
                </button>
                
              </div>
              
            </div>
          </div>)}

          {/* career section */}
          {userWorkExperience.length == 0 && (
            <Typography>No Work Experience Yet!</Typography>
          )}
          {careerView && (
            <div className="bg-white flex flex-col p-5 rounded-xl max-h-fit space-y-1 w-full">
              <div className="space-y-3">
                <p className="font-semibold">Work Experience</p>

                {/* BULLET DIV */}
                {userWorkExperience.length > 0 && (
                  <div className="space-y-3">
                    {userWorkExperience.map((item:WorkExperience, index:number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-5">
                          <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                          <div>
                            <p className="font-medium">{item.company}</p>
                            <p className="text-sm">
                              {item.company} &nbsp;•&nbsp; <span className="font-light italic">{item.details}</span>
                            </p>
                            <p className="text-sm">{item.startYear}</p>
                          </div>
                        </div>
                        <div className="flex space-x-10">
                          <button className="flex items-center space-x-2 cursor-pointer" onClick={() => openMap(index)}>
                            <p className="text-[#3675c5]"><MapPin/></p>
                            <p className="text-[#3675c5] text-sm hover:underline">View in map</p>
                          </button>
                          <button className="flex items-center space-x-2 cursor-pointer" onClick={() => {if (!isEditModalOpen[index]) openEditModal(index); else closeEditModal(index);}}>
                            <p className="text-[#3675c5]"><PencilIcon/></p>
                            <p className="text-[#3675c5] text-sm hover:underline">Edit</p>
                          </button>
                          
                          <Divider/>

                          {/*  */}
                          <EditWorkExperience
                            open={isEditModalOpen[index]}
                            work={item}
                            onClose={() => closeEditModal(index)}
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
                            <DialogContent className="w-[600px]">
                              <DialogHeader>
                                <DialogTitle>{item.company} Location</DialogTitle>
                              </DialogHeader>
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
                                <Button onClick={() => closeMap(index)}>Close</Button>
                              </DialogContent>
                            </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ================== end of info box ================== */}

        </div>
      </div>

      {/* Modal Sectionn */}
      {addBachelor && (
        <AddEducationModal
          open={addBachelor}
          onClose={() => setAddBachelor(false)}
          userId={alumInfo?.alumniId}
          setSuccess={setSuccess}
          degreeType={degreeType}
        />
      )}
      {addMasters && (
        <AddEducationModal
          open={addMasters}
          onClose={() => setAddMasters(false)}
          userId={alumInfo?.alumniId}
          setSuccess={setSuccess}
          degreeType={degreeType}
        />
      )}
      {addDoctoral && (
        <AddEducationModal
          open={addDoctoral}
          onClose={() => setAddDoctoral(false)}
          userId={alumInfo?.alumniId}
          setSuccess={setSuccess}
          degreeType={degreeType}

        />
      )}
      {addAffiliation && (
        <AddAffiliationModal
        open= {addAffiliation}
        onClose={()=> setaddAffiliation(false)}
        userId={alumInfo?.alumniId}
        setSuccess={setSuccess}
        />
      )}

      {uploading &&  <AlumnusUploadPic alumnus={alumInfo} uploading={uploading} onClose={() => setUploading(false)}/>}

    </div>
  );
};

export default UserProfile;
