"use client";

import { WorkExperience } from "@/models/models";
import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import GoogleMapsModal from "@/app/(pages)/(alumni)/google-maps/map";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { XIcon, PencilIcon, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";


const AddWorkExperience: React.FC<{
  open: boolean;
  alumniId: string;
  onClose: () => void;
  numOfPresentJobs: number;
  snackbar: boolean;
  setSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}> = ({ open, alumniId, onClose, numOfPresentJobs, setSnackbar, setMessage, setSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [industry, setIndustry] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState({
    location: "",
    latitude: 14.25,
    longitude: 121.25,
  });


  const { addWorkExperience } = useWorkExperience(); // make sure this exists

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      location: address,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleSubmit = async () => {
    if (!alumniId) {
      console.error("Missing alumniId. Cannot submit.");
      setMessage("Could not submit: missing alumni ID.");
      setSuccess(false);
      // setSnackbar(true);
      return;
    }
  
    const newWork: WorkExperience = {
      industry,
      jobTitle,
      company,
      startYear: startYear,
      endYear: endYear,
      location: selectedLocation.location,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      workExperienceId: "",
      alumniId:alumniId,
      proofOfEmployment: ""
    };
  
    const result = await addWorkExperience(newWork,alumniId);
    setSuccess(result.success);
    setMessage(result.message);
    if (result.success) onClose();
    // setSnackbar(true);
  };

  const [presentJob, setPresentJob] = useState(endYear === "present" ? true : false);
  const handlePresentJob = (value: boolean) => {
    setPresentJob(value);
    setEndYear(value === true ? "present" : endYear)
  };
  

  if (!open) return null;


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between relative">
            <p className="text-xl font-bold pb-3">Add work experience</p>
            <button onClick={onClose} className="absolute top-0 right-0"><XIcon className="cursor-pointer hover:text-red-500"/></button>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-12 gap-x-4 gap-y-3 pb-3">
              <div className="col-span-6">
                <p className="text-xs font-light">Industry*</p>
                <input
                  placeholder="Web Development"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
              </div>
              <div className="col-span-6">
                <p className="text-xs font-light">Job Title*</p>
                <input
                  placeholder="Programmer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
              </div>
              <div className="col-span-12">
                <p className="text-xs font-light">Company*</p>
                <input
                  placeholder="Company X"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
              </div>
              <div className="col-span-12">
                <p className="text-xs font-light">Location*</p>
                <div className="flex items-center space-x-4">
                  {selectedLocation.location && (
                    <div className="flex-1">
                      <p className="bg-gray-300 py-2 px-3 rounded-md border border-gray-500 w-full text-gray-500">
                        {selectedLocation.location}
                      </p>
                    </div>
                  )}

                  <button
                    className="flex items-center space-x-2 cursor-pointer text-[#0856ba] py-2"
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <p className="">
                      {selectedLocation.location !== "" ? (
                        <PencilIcon className="w-4" />
                      ) : (
                        <MapPin className="w-4" />
                      )}
                    </p>
                    <p className="text-sm hover:underline">
                      {selectedLocation.location !== "" ? "Edit" : "Enter"} location
                    </p>
                  </button>
                </div>
                <GoogleMapsModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  initialAddress={selectedLocation.location}
                  initialLatitude={selectedLocation.latitude}
                  initialLongitude={selectedLocation.longitude}
                  onSave={handleLocationSave}
                />
              </div>
              <div className="col-span-6">
                <p className="text-xs font-light">Start Year*</p>
                <input
                  placeholder="XXXX"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
              </div>
              <div className="col-span-6">
                <p className="text-xs font-light">End Year*</p>
                {presentJob === false && (
                  <input
                    placeholder="XXXX"
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    required
                    className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                  />)}
                {presentJob === true && (
                  <p className="cursor-not-allowed bg-gray-300 py-2 px-3 border border-gray-500 w-full text-gray-500 rounded-md">
                    present
                  </p>
                )}
                {/* pag wala pang present job, tsaka lang lalabas yung checkbox ng present job */}
                {numOfPresentJobs == 0 && (<div className="pt-1 flex gap-2 justify-start items-center">
                  <Checkbox
                    checked={presentJob}
                    onCheckedChange={(value: boolean) => {
                      handlePresentJob(value)
                    }}
                    className="bg-white"
                  />
                  <p className="text-xs font-light">
                    Present job?
                  </p>
                </div>)}
              </div>
              {presentJob === true && (
              <div className="col-span-12">
                <p className="text-xs font-light">Proof of Employment</p>
                {/* palagay nalang dito ng for proof of employment salamatttttttttttttt */}
              </div>
              )}
            </div>

            <div className="flex justify-end">
              <button 
              type="submit"
              color="primary"
              className="w-20 bg-[#0856ba] text-white py-2 px-3 rounded-full cursor-pointer hover:bg-[#92b2dc]">
                Save
              </button>
            </div>

           
          </form>
        </CardHeader>
      </Card>
    </div>
  );
};

export default AddWorkExperience;