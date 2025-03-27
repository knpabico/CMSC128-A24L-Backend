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
  Snackbar,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { WorkExperienceModal } from "./add-work-experience";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const UserProfile = () => {
  const { user, alumInfo, loading } = useAuth();
  const { userWorkExperience, isLoading } = useWorkExperience();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [success, setSuccess] = useState(false);

  const [isMapOpenArray, setIsMapOpenArray] = useState(
    new Array(userWorkExperience.length).fill(false)
  );

  const openMap = (index) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = true;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  // Function to close map for a specific work experience
  const closeMap = (index) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = false;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  const params = useParams();
  const alumniId = params.alumniId;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCnDnz-yF_a-LiquYYONJcf1wFobK75tNk",
    libraries: ["places"],
  });

  if (loading || isLoading) {
    return <LoadingPage />;
  } else if (user?.uid !== alumniId) {
    return <NotFound />;
  }

  return (
    <div>
      <Typography>User Profile</Typography>
      <Typography>
        Name: {alumInfo?.firstName} {alumInfo?.lastName}
      </Typography>
      <Typography>Location: {alumInfo?.address}</Typography>
      <Typography>Work Experience</Typography>
      {userWorkExperience.length == 0 && (
        <Typography>No Work Experience Yet!</Typography>
      )}
      {userWorkExperience.map((work, index) => {
        return (
          <div key={index} className=" pb-1.5">
            <li>Company: {work.company}</li>
            <li>Details: {work.details}</li>
            <li>Location: {work.location}</li>
            <li>
              From {work.startingDate?.toDate().toDateString()} to{" "}
              {work.endingDate?.toDate().toDateString()}
            </li>
            <li>
              Lat:{work.latitude} Long:{work.longitude}
            </li>
            <Button onClick={() => openMap(index)}>View in Map</Button>
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
            success ? "bg-black" : "bg-red-500"
          } text-white px-4 py-3 rounded-lg shadow-lg`}
        >
          {success ? "Successfully Added!" : "Error!"}
        </div>
      </Snackbar>
    </div>
  );
};

export default UserProfile;
