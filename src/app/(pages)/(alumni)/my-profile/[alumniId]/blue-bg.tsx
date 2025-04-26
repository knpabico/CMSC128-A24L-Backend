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
import { ChevronDown, ChevronRight } from "lucide-react";
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
            <p className="font-semibold text-xl">{alumInfo?.jobTitle}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Profile</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Record of Donations</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Job Postings</button>
          <button className="whitespace-nowrap py-3 px-5 w-fit cursor-pointer font-semibold hover:bg-white/20 rounded-sm transition">Bookmarked Jobs</button>
        </div>
      </div>

      <div style={{backgroundColor: "#3675c5"}} className="mx-60 my-10 p-5 rounded-xl">
        <p style={{color: "white"}} className="text-2xl font-bold mb-5">Your Profile</p>
        <div className="flex space-x-5">
          <div className="flex flex-col rounded-xl max-h-fit space-y-1">
            <button className="text-left text-white whitespace-nowrap py-2 px-5 w-60 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition">Personal</button>
            <button className="text-left text-white whitespace-nowrap py-2 px-5 w-60 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition">Education</button>
            <button className="text-left text-white whitespace-nowrap py-2 px-5 w-60 cursor-pointer font-semibold hover:bg-gray-100/20 rounded-sm transition">Career</button>
          </div>

          <div className="bg-gray-100 flex flex-col p-5 rounded-xl max-h-fit space-y-1 w-full">

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

            <p className="font-semibold">Birthday</p>
            <div className="flex space-x-7 mb-5">
              <div>
                <p className="text-xs font-light">Month</p>
                <select
                  className="appearance-none py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedDate(
                      new Date(selectedYear, parseInt(e.target.value), selectedDay)
                    )
                  }
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-light">Day</p>
                <select
                  className="appearance-none py-2 px-4 border border-gray-500 w-25 rounded-md bg-white"
                  value={selectedDay}
                  onChange={(e) =>
                    setSelectedDate(
                      new Date(selectedYear, selectedMonth, parseInt(e.target.value))
                    )
                  }
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-light">Year</p>
                <select
                  className="appearance-none py-2 px-4 border border-gray-500 w-25 rounded-md bg-white"
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedDate(
                      new Date(parseInt(e.target.value), selectedMonth, selectedDay)
                    )
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="font-semibold">Current Location</p>
            <div className="flex space-x-7">
              <div>
                <p className="text-xs font-light">City/Municipality</p>
                <input
                  type="text"
                  placeholder="City/Municipality"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-light">Province/State</p>
                <input
                  type="text"
                  placeholder="Province/State"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  // value={country}
                  // onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs font-light">Country</p>
                <input
                  type="text"
                  placeholder="Country"
                  className="py-2 px-4 border border-gray-500 w-50 rounded-md bg-white"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>

          </div>

          
        </div>
      </div>

      


      <div className="mx-60 my-10">
        <p style={{color: "#0856BA"}} className="text-4xl font-bold mb-10">Your Profile</p>

        <div className="mb-10">
          <p style={{backgroundColor: "#0856BA"}} className="text-white font-semibold text-xl py-2 px-3 rounded-md my-3">Personal</p>
          
          <p className="font-semibold">Birthday</p>
          <div className="flex space-x-7 mb-3">
            <div>
              <p className="text-xs font-light">Month</p>
              {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">{getFullMonthName(new Date(alumInfo?.birthDate).getMonth())}</p>*/}
              <select
                className="appearance-none py-2 px-4 border border-gray-500 w-full rounded-md"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedDate(
                    new Date(selectedYear, parseInt(e.target.value), selectedDay)
                  )
                }
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-light">Day</p>
              {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-25 text-gray-500 rounded-md">{new Date(alumInfo?.birthDate).getDay()}</p>*/}
              <select
                className="appearance-none py-2 px-4 border border-gray-500 w-25 rounded-md"
                value={selectedDay}
                onChange={(e) =>
                  setSelectedDate(
                    new Date(selectedYear, selectedMonth, parseInt(e.target.value))
                  )
                }
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-light">Year</p>
              {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-25 text-gray-500 rounded-md">{new Date(alumInfo?.birthDate).getFullYear()}</p>*/}
              <select
                className="appearance-none py-2 px-4 border border-gray-500 w-25 rounded-md"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedDate(
                    new Date(parseInt(e.target.value), selectedMonth, selectedDay)
                  )
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="font-semibold">Current Location</p>
          <div className="flex space-x-7">
            <div>
              <p className="text-xs font-light">City/Province/State</p>
              {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[0]}</p>*/}
              <input
                type="text"
                placeholder="City/Province/State"
                className="py-2 px-4 border border-gray-500 w-50 rounded-md"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <p className="text-xs font-light">Country</p>
              {/*<p className="bg-gray-200 py-2 px-4 border border-gray-500 w-50 text-gray-500 rounded-md">{alumInfo?.address[0].split(', ')[1]}</p>*/}
              <input
                type="text"
                placeholder="Country"
                className="py-2 px-4 border border-gray-500 w-50 rounded-md"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <p style={{backgroundColor: "#0856BA"}} className="text-white font-semibold text-xl py-2 px-3 rounded-md my-3">Education</p>
          <div>waley paaaaa</div>
        </div>

        <div className="mb-10">
          <p style={{backgroundColor: "#0856BA"}} className="text-white font-semibold text-xl py-2 px-3 rounded-md my-3">Career</p>

          {userWorkExperience.length == 0 && (
            <Typography>No Work Experience Yet!</Typography>
          )}
          {userWorkExperience.map((work, index) => {
            return (
              <div key={work.workExperienceId} className=" pb-1.5">
                {/* <li>Company: {work.company}</li>
                <li>Details: {work.details}</li>
                <li>Location: {work.location}</li>
                <li>ID: {work.workExperienceId}</li>
                <li>
                  From {work.startingDate?.toDate().toDateString()} to{" "}
                  {work.endingDate?.toDate().toDateString()}
                </li>
                <li>
                  Lat:{work.latitude} Long:{work.longitude}
                </li> */}

                <Button onClick={() => openMap(index)}>View in Map</Button>
                <Button onClick={() => openModal(index)}>Delete Work Experience</Button>
                <Button onClick={() => {if (!isEditModalOpen[index]) openEditModal(index); else closeEditModal(index);}} variant="contained">
                  <span>Edit Work Experience</span>
                  {!isEditModalOpen[index] ? <ChevronRight /> : <ChevronDown />}
                </Button>
                
                <Divider/>

                <EditWorkExperience
                  open={isEditModalOpen[index]}
                  work={work}
                  onClose={() => closeEditModal(index)}
                  snackbar
                  setSnackbar={setSnackbar}
                  setMessage={setEditMessage}
                  setSuccess={setEditSuccess}
                />
                <Snackbar
                  open={snackbar}
                  onClose={() => setSnackbar(false)}
                  autoHideDuration={2000}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                  <div
                    className={`${
                      editSuccess ? "bg-green-400" : "bg-red-500"
                    } text-white px-4 py-3 rounded-lg shadow-lg`}
                  >
                    {editMessage}
                  </div>
                </Snackbar>
                <Dialog
                  open={isDeleteModalOpen[index]}
                  onClose={() => closeModal(index)}
                >
                  <DialogContent>
                    <div>
                      <Typography>Are you sure you want to delete?</Typography>
                      <Button
                        onClick={async () => {
                          await handleDelete(work.workExperienceId);
                          closeModal(index);
                        }}
                      >
                        Yes
                      </Button>
                      <Button onClick={() => closeModal(index)}>No</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isMapOpenArray[index]}
                  onClose={() => closeMap(index)}
                >
                  <DialogContent className="w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{work.company} Location</DialogTitle>
                    </DialogHeader>
                    <div className="h-[400px] w-full">
                      {!isLoaded ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-xl text-gray-600">Loading map...</p>
                        </div>
                      ) : (
                        <GoogleMap
                          mapContainerStyle={{ width: "100%", height: "100%" }}
                          center={{ lat: work.latitude, lng: work.longitude }}
                          zoom={15}
                        >
                          <Marker
                            position={{ lat: work.latitude, lng: work.longitude }}
                            title={work.company}
                          />
                        </GoogleMap>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <p>{work.location}</p>
                    </div>
                    <Button onClick={() => closeMap(index)}>Close</Button>
                  </DialogContent>
                </Dialog>
              </div>
            );
          })}
          <Button variant="contained" onClick={() => setIsOpen(!isOpen)}>
            <span>Add Work Experience</span>
            {!isOpen ? <ChevronRight /> : <ChevronDown />}
          </Button>
        </div>

        <WorkExperienceModal
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          userId={user?.uid}
          open={open}
          setOpen={setOpen}
          setSuccess={setSuccess}
        />
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <div
            className={`${
              success ? "bg-green-600" : "bg-red-500"
            } text-white px-4 py-3 rounded-lg shadow-lg`}
          >
            {success ? "Successfully Added!" : "Error!"}
          </div>
        </Snackbar>

        <Snackbar
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <div
            className={`${
              success ? "bg-black" : "bg-red-500"
            } text-white px-4 py-3 rounded-lg shadow-lg`}
          >
            {message}
          </div>
        </Snackbar>
      </div>



      
    </div>
  );
};

export default UserProfile;
