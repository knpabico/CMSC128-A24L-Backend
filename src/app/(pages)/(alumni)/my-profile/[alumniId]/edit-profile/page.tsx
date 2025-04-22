"use client";
import NotFound from "@/app/not-found";
import LoadingPage from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
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
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { WorkExperienceModal } from "../add-work-experience";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import EditWorkExperience from "../edit-work-experience";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { useRouter } from "next/router";
import EditEducationModal from "./edit-education-modal";

const EditProfile = () => {
   const { user, alumInfo, loading } = useAuth();
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const [city, setCity] = useState('');
   const [province, setProvince] = useState('');
   const [country, setCountry] = useState('');
   console.log(typeof(alumInfo?.address));
   const [isEditModalOpen, setIsEditModalOpen] = useState<boolean[]>([]);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean[]>([]);
   const [snackbar, setSnackbar] = useState(false);
   const [editMessage, setEditMessage] = useState("");
   const [editSuccess, setEditSuccess] = useState(false);
   const [isOpen, setIsOpen] = useState(false);

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
  
  const handleDelete = async (index: number) => {
    const updated = [...educationList];
    updated.splice(index, 1);
    setEducationList(updated);
    setEditMessage("Successfully deleted education!");
    setEditSuccess(true);
    setSnackbar(true);
  };
  
  const handleAdd = (education: Education) => {
    setEducationList((prev) => [...prev, education]);
    setEditMessage("Successfully added education!");
    setEditSuccess(true);
    setSnackbar(true);
    setIsOpen(false);
  };

   useEffect(() => {
    // Birthdate parsing
    if (alumInfo?.birthDate) {
      const safeDate = new Date(alumInfo.birthDate.replaceAll('/', '-'));
      setSelectedDate(safeDate);
    }
  
    // Address parsing
    if (Array.isArray(alumInfo?.address) && typeof alumInfo.address[0] === 'string') {
      const [cityVal = '', provinceVal = '', countryVal = ''] = alumInfo.address[0]
        .split(',')
        .map((part) => part.trim());
  
      setCity(cityVal);
      setProvince(provinceVal);
      setCountry(countryVal);
    } else {
      console.warn("Address not in expected format:", alumInfo?.address);
    }
  }, [alumInfo?.birthDate, alumInfo?.address]);
 

   const months = [
     'January', 'February', 'March', 'April', 'May', 'June',
     'July', 'August', 'September', 'October', 'November', 'December',
   ];

   //array of education for the meantime
   const [educationList, setEducationList] = useState<Education[]>([
    {
      alumniId: alumInfo?.alumniId,
      university: "University of the Philippines Diliman",
      type: "College",
      yearGraduated: "2021",
      major: "Computer Science",
    },
    {
      alumniId: alumInfo?.alumniId,
      university: "UP Integrated School",
      type: "High School",
      yearGraduated: "2017",
      major: "",
    },
    {
      alumniId: alumInfo?.alumniId,
      university: "Harvard University",
      type: "Graduate School",
      yearGraduated: "2024",
      major: "Artificial Intelligence",
    },
  ]);

  
  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };
  
  const addEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        alumniId: "001", // Or dynamic ID
        university: "",
        type: "",
        yearGraduated: "",
        major: "",
      },
    ]);
  };
  
  const removeEducation = (index: number) => {
    setEducationList((prev) => prev.filter((_, i) => i !== index));
  };
 
   const days = Array.from({ length: 31 }, (_, i) => i + 1);
   const years = Array.from({ length: 50 }, (_, i) => 1990 + i);
 
   const selectedMonth = selectedDate.getMonth(); // 0-based
   const selectedDay = selectedDate.getDate();
   const selectedYear = selectedDate.getFullYear();
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

                  <select
                    className="border rounded px-3 py-2 w-1/3"
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

                  <select
                    className="border rounded px-3 py-2 w-1/3"
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
            {educationList.map((edu, index) => (
            <div key={index} className="pb-1.5">
              <li>University: {edu.university}</li>
              <li>Type: {edu.type}</li>
              <li>Major: {edu.major}</li>
              <li>Graduation Year: {edu.yearGraduated}</li>

              <Button onClick={() => openDeleteModal(index)}>Delete</Button>
              <Button
                onClick={() => {
                  isEditModalOpen[index] ? closeEditModal(index) : openEditModal(index);
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
                index={index}
                educationList={educationList}
                setEducationList={setEducationList}
                setSnackbar={setSnackbar}
                setMessage={setEditMessage}
                setSuccess={setEditSuccess}
              />

              <Dialog open={isDeleteModalOpen[index]} onClose={() => closeDeleteModal(index)}>
                <DialogContent>
                  <Typography>Are you sure you want to delete?</Typography>
                  <Button onClick={() => handleDelete(index)}>Yes</Button>
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
            <div className={`${editSuccess ? "bg-green-600" : "bg-red-500"} text-white px-4 py-3 rounded-lg shadow-lg`}>
              {editMessage}
            </div>
          </Snackbar>

          </div>
        </>
        )
};

export default EditProfile;
