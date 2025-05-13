"use client";
import { useAuth } from "@/context/AuthContext";
import { Education } from "@/models/models";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import EditEducationModal from "./edit-education-modal";
import { useEducation } from "@/context/EducationContext";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { useGoogleMaps } from "@/context/GoogleMapsContext";

const EditProfile = () => {
  const { user, alumInfo, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  console.log(typeof alumInfo?.address);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean[]>([]);
  const [snackbar, setSnackbar] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [workSuccess, setWorkSuccess] = useState(false);
  const [workMessage, setWorkMessage] = useState("");
  const { userEducation, isLoadingEducation, deleteEducation } = useEducation();
  const { userWorkExperience, isLoading, deleteWorkExperience } =
    useWorkExperience();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 50 }, (_, i) => 1990 + i);
  const [isMapOpenArray, setIsMapOpenArray] = useState(
    new Array(userWorkExperience.length).fill(false)
  );

  const selectedMonth = selectedDate.getMonth(); // 0-based
  const selectedDay = selectedDate.getDate();
  const selectedYear = selectedDate.getFullYear();
  const [isEditModalWorkOpen, setEditModalWorkOpen] = useState(
    new Array(userWorkExperience.length).fill(false)
  );
  const { isLoaded } = useGoogleMaps();

  //work experience
  const handleWorkDelete = async (id:string) => {
    const { success, message } = await deleteWorkExperience(id);
    setWorkMessage(message);
    setWorkSuccess(success);
  };

  const openEditModal = (index: number) => {
    const updated = [...isEditModalOpen];
    updated[index] = true;
    setIsEditModalOpen(updated);
  };

  const closeEditModal = (index: number) => {
    const updated = [...isEditModalOpen];
    updated[index] = false;
    setIsEditModalOpen(updated);
  };

  const openDeleteModal = (index: number) => {
    const updated = [...isDeleteModalOpen];
    updated[index] = true;
    setIsDeleteModalOpen(updated);
  };

  const closeDeleteModal = (index: number) => {
    const updated = [...isDeleteModalOpen];
    updated[index] = false;
    setIsDeleteModalOpen(updated);
  };

  const [isDeleteModalWorkOpen, setDeleteModalWorkOpen] = useState(
    new Array(userWorkExperience.length).fill(false)
  );

  useEffect(() => {
    // Birthdate parsing
    if (alumInfo?.birthDate) {
      const safeDate = new Date(alumInfo.birthDate.replaceAll("/", "-"));
      setSelectedDate(safeDate);
    }

    // Address parsing
    if (
      Array.isArray(alumInfo?.address) &&
      typeof alumInfo.address[0] === "string"
    ) {
      const [cityVal = "", provinceVal = "", countryVal = ""] =
        alumInfo.address[0].split(",").map((part) => part.trim());

      setCity(cityVal);
      setProvince(provinceVal);
      setCountry(countryVal);
    } else {
      console.warn("Address not in expected format:", alumInfo?.address);
    }
  }, [alumInfo?.birthDate, alumInfo?.address]);

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

  const openMap = (index) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = true;
    setIsMapOpenArray(newIsMapOpenArray);
  };
  const openWorkModal = (index) => {
    const newDeleteModal = [...isDeleteModalOpen];
    newDeleteModal[index] = true;
    setDeleteModalWorkOpen(newDeleteModal);
  };

  const closeWorkModal = (index) => {
    const newDeleteModal = [...isDeleteModalOpen];
    newDeleteModal[index] = false;
    setDeleteModalWorkOpen(newDeleteModal);
  };
  const closeMap = (index) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = false;
    setIsMapOpenArray(newIsMapOpenArray);
  };
  console.log(alumInfo);
  return (
    <>
      <div className="p-4 bg-white max-w-md mx-auto rounded shadow">
        {/* Start of personal  */}
        <div className="bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded-t">
          Personal
        </div>
        <div className="border border-t-0 rounded-b p-4 space-y-4">
          <div>
            <label className="block font-medium mb-1">Birthday</label>
            <div className="flex space-x-2">
              <select
                className="border rounded px-3 py-2 w-1/3"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedDate(
                    new Date(
                      selectedYear,
                      parseInt(e.target.value),
                      selectedDay
                    )
                  )
                }
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                className="border rounded px-3 py-2 w-1/3"
                value={selectedDay}
                onChange={(e) =>
                  setSelectedDate(
                    new Date(
                      selectedYear,
                      selectedMonth,
                      parseInt(e.target.value)
                    )
                  )
                }
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <select
                className="border rounded px-3 py-2 w-1/3"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedDate(
                    new Date(
                      parseInt(e.target.value),
                      selectedMonth,
                      selectedDay
                    )
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

          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="City/Municipality"
              className="border rounded px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="Province/State"
              className="border rounded px-3 py-2"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
          <input
            type="text"
            placeholder="Country"
            className="w-full border rounded px-3 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
        {/* Start of Education  */}
        <div className="bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded-t">
          Education
        </div>
        {userEducation.map((edu: Education, index: number) => (
          <div key={index} className="pb-1.5">
            <li>University: {edu.university}</li>
            <li>Type: {edu.type}</li>
            <li>Major: {edu.major}</li>
            <li>Graduation Year: {edu.yearGraduated}</li>

            <Button onClick={() => openDeleteModal(index)}>Delete</Button>
            <Button
              onClick={() => {
                isEditModalOpen[index]
                  ? closeEditModal(index)
                  : openEditModal(index);
              }}
              variant="contained"
            >
              <span>Edit Education</span>
              {!isEditModalOpen[index] ? <ChevronRight /> : <ChevronDown />}
            </Button>
            <Divider />
            <EditEducationModal
              open={isEditModalOpen[index]}
              education={edu}
              onClose={() => closeEditModal(index)}
              snackbar
              setSnackbar={setSnackbar}
              setMessage={setEditMessage}
              setSuccess={setEditSuccess}
            />

            <Dialog
              open={isDeleteModalOpen[index]}
              onClose={() => closeDeleteModal(index)}
            >
              <DialogContent>
                <Typography>Are you sure you want to delete?</Typography>
                <Button onClick={() => handleWorkDelete(index)}>Yes</Button>
                <Button onClick={() => closeDeleteModal(index)}>No</Button>
              </DialogContent>
            </Dialog>
          </div>
        ))}
        <Button variant="contained" onClick={() => setIsOpen(!isOpen)}>
          <span>Add Education</span>
          {!isOpen ? <ChevronRight /> : <ChevronDown />}
        </Button>

        {/*<AddEducationModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            // onAdd={handleAdd}
          />*/}

        <Snackbar
          open={snackbar}
          onClose={() => setSnackbar(false)}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <div
            className={`${
              editSuccess ? "bg-green-600" : "bg-red-500"
            } text-white px-4 py-3 rounded-lg shadow-lg`}
          >
            {editMessage}
          </div>
        </Snackbar>
        {/*Start of Career*/}
        <div className="bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded-t">
          Careere
        </div>

        {userWorkExperience.map((work, index) => {
          return (
            <div key={work.workExperienceId} className=" pb-1.5">
              <li>Company: {work.company}</li>
              <li>Details: {work.details}</li>
              <li>Location: {work.location}</li>
              <li>ID: {work.workExperienceId}</li>
              <li>
                From {work.startingDate?.toDate().toDateString()} to{" "}
                {work.endingDate?.toDate().toDateString()}
              </li>
              <li>
                Lat:{work.latitude} Long:{work.longitude}
              </li>
              <Button onClick={() => openMap(index)}>View in Map</Button>
              <Button onClick={() => openWorkModal(index)}>
                Delete Work Experience
              </Button>
              <Button
                onClick={() => {
                  if (!isEditModalWorkOpen[index]) openEditWorkModal(index);
                  else closeEditWorkModal(index);
                }}
                variant="contained"
              >
                <span>Edit Work Experience</span>
                {!isEditModalWorkOpen[index] ? (
                  <ChevronRight />
                ) : (
                  <ChevronDown />
                )}
              </Button>
              <Divider />
              {isEditModalWorkOpen[index] && (
                <EditWorkExperience
                  open={true}
                  work={work}
                  onClose={() => closeEditWorkModal(index)}
                  snackbar
                  setSnackbar={setSnackbar}
                  setMessage={setEditMessage}
                  setSuccess={setEditSuccess}
                />
              )}
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
                onClose={() => closeWorkModal(index)}
              >
                <DialogContent>
                  <div>
                    <Typography>Are you sure you want to delete?</Typography>
                    <Button
                      onClick={async () => {
                        await handleWorkDelete(work.workExperienceId);
                        closeWorkModal(index);
                      }}
                    >
                      Yes
                    </Button>
                    <Button onClick={() => closeWorkModal(index)}>No</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isMapOpenArray[index]}
                onClose={() => closeMap(index)}
              >
                <DialogContent className="w-[600px]">
                  1
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
      </div>
    </>
  );
};

export default EditProfile;
