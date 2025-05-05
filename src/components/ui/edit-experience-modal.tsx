"use client";

import { WorkExperience } from "@/models/models";
import { Button, Snackbar, TextField } from "@mui/material";
import React, { useState } from "react";
import GoogleMapsModal from "@/app/(pages)/(alumni)/google-maps/map";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { XIcon, PencilIcon, MapPin } from "lucide-react";
import { CheckboxItem } from "@radix-ui/react-dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";


const EditWorkExperience: React.FC<{
  open: boolean;
  work: WorkExperience;
  numOfPresentJobs: number;
  onClose: () => void;
  snackbar: boolean;
  setSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}> = ({ open, work, numOfPresentJobs, onClose, setSnackbar, setMessage, setSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [industry, setIndustry] = useState<string>(work.industry);
  const [jobTitle, setJobTitle] = useState<string>(work.jobTitle);
  const [company, setCompany] = useState<string>(work.company);
  const [startYear, setStartYear] = useState<string>(work.startYear);
  const [endYear, setEndYear] = useState<string>(work.endYear);
  const [selectedLocation, setSelectedLocation] = useState({
    location: work.location,
    latitude: work.latitude,
    longitude: work.longitude,
  });



  const { editWorkExperience } = useWorkExperience();

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      location: address,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleSubmit = async (work_experience: WorkExperience) => {
    const result = await editWorkExperience(work_experience);
    setSuccess(result.success);
    setMessage(result.message);
    if (result.success) {
      onClose();
    }
    setSnackbar(true);
  };

  const [presentJob, setPresentJob] = useState(endYear === "Present" ? true : false);
  const handlePresentJob = (value: boolean) => {
    setPresentJob(value);
    if(value === true){
      setEndYear("Present");
      numOfPresentJobs++;
    }
    else{
      setEndYear(endYear);
      numOfPresentJobs--;
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between relative">
            <p className="text-xl font-bold pb-3">Edit work experience</p>
            <button onClick={onClose} className="absolute top-0 right-0"><XIcon className="cursor-pointer hover:text-red-500"/></button>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmit({
                industry,
                jobTitle,
                company,
                startYear: startYear,
                endYear: endYear,
                location: selectedLocation.location,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                workExperienceId: work.workExperienceId,
                alumniId: work.alumniId,
                proofOfEmployment: work.proofOfEmployment,
              });
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
                    Present
                  </p>
                )}
                {/* si present job lang ang may checkbox ng present job. pag wala nang present job at all, tsaka lang to lalabas sa lahat ng work exp */}
                {(numOfPresentJobs == 0 || endYear == "Present") && (<div className="pt-1 flex gap-2 justify-start items-center">
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

export default EditWorkExperience;
