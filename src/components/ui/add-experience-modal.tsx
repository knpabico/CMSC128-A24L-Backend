"use client";

import { WorkExperience } from "@/models/models";
import { Button, TextField } from "@mui/material";
import React, { useState } from "react";
import GoogleMapsModal from "@/app/(pages)/(alumni)/google-maps/map";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { XIcon, PencilIcon, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CareerDocumentUpload, uploadDocToFirebase } from "./career-document";
import { handleYearInput } from "@/validation/auth/sign-up-form-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const industryOptions = [
  "Software Development",
  "Web Development",
  "Mobile App Development",
  "Artificial Intelligence/Machine Learning",
  "Data Science & Analytics",
  "Cloud Computing",
  "Cybersecurity",
  "Game Development",
  "Blockchain & Cryptocurrency",
  "Internet of Things (IoT)",
  "Robotics & Automation",
  "Bioinformatics",
  "FinTech (Financial Technology)",
  "EdTech (Educational Technology)",
  "HealthTech/MedTech",
  "E-commerce",
  "Telecommunications",
  "IT Consulting",
  "Computer Hardware & Semiconductors",
  "Network Infrastructure",
  "DevOps & System Administration",
  "Database Administration",
  "Computer Vision",
  "Natural Language Processing",
  "Virtual Reality/Augmented Reality",
  "Quantum Computing",
  "Digital Marketing & SEO",
  "Business Intelligence",
  "Enterprise Resource Planning (ERP)",
  "User Experience/Interface Design",
  "Computer Graphics & Animation",
  "High-Performance Computing",
  "Geographic Information Systems (GIS)",
  "Computer Forensics",
  "IT Support & Services",
  "Information Systems Management",
  "Human-Computer Interaction",
  "Embedded Systems",
  "Computer Engineering",
  "Aerospace Computing",
  "Defense & Military Technology",
  "Smart Cities & Urban Technologies",
  "Information Security",
  "Big Data",
  "Digital Twins Technology",
  "Computer-Aided Design (CAD)",
  "Social Media & Digital Platforms",
  "Supply Chain Technology",
  "Speech Recognition & Processing",
  "Computational Science",
  "Other",
];

const AddWorkExperience: React.FC<{
  open: boolean;
  alumniId: string;
  onClose: () => void;
  numOfPresentJobs: number;
  snackbar: boolean;
  setSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}> = ({
  open,
  alumniId,
  onClose,
  numOfPresentJobs,
  setSnackbar,
  setMessage,
  setSuccess,
}) => {
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

  //for setting career proof (if present job)
  const [careerProof, setCareerProof] = useState<File | null>(null);
  const [hasProof, setHasProof] = useState(true);
  const [validYears, setValidYears] = useState(true);
  const { addWorkExperience } = useWorkExperience(); // make sure this exists

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      location: address,
      latitude: lat,
      longitude: lng,
    });
  };
  //current year for validation
  const currentYear = new Date().getFullYear();

  const [loading, setLoading] = useState(false);

  //function for resetting fields after submission
  const resetFields = () => {
    setIndustry("");
    setJobTitle("");
    setCompany("");
    setStartYear("");
    setEndYear("");
    setSelectedLocation({
      location: "",
      latitude: 14.25,
      longitude: 121.25,
    });
    setCareerProof(null);
    setHasProof(true);
    setPresentJob(false);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!alumniId) {
      setMessage("Could not submit: missing alumni ID.");
      setSuccess(false);
      // setSnackbar(true);
      return;
    }

    //check if valid years
    if (endYear !== "present") {
      if (parseInt(startYear, 10) > parseInt(endYear, 10)) {
        setValidYears(false);
        setSuccess(false);
        setLoading(false);
        // setSnackbar(true);
        return;
      } else {
        setValidYears(true);
      }
    }

    //if missing proof of employment for present job
    if (!careerProof && endYear === "present") {
      setHasProof(false);
      setSuccess(false);
      setLoading(false);
      // setSnackbar(true);
      return;
    } else {
      setHasProof(true);
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
      alumniId: alumniId,
      proofOfEmployment: "",
    };

    const result = await addWorkExperience(newWork, alumniId);

    if (result.success) {
      //if endyear is present, upload proof of employment
      if (endYear === "present" && careerProof) {
        //upload proof of employment to firebase
        await uploadDocToFirebase(
          careerProof,
          alumniId,
          result.workExperienceId
        );
      }

      setSuccess(result.success);
      setMessage(result.message);

      resetFields();
      onClose();
    }
    // setSnackbar(true);
    setLoading(false);
  };

  //callback for image upload
  const handleDocumentUpload = (document: File | null): void => {
    setCareerProof(document);
  };

  const [presentJob, setPresentJob] = useState(
    endYear === "present" ? true : false
  );
  const handlePresentJob = (value: boolean) => {
    setPresentJob(value);
    setEndYear(value === true ? "present" : endYear);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <CardHeader>
          <div className="flex items-center justify-between relative">
            <p className="text-xl font-bold pb-3">Add work experience</p>
            <button
              onClick={() => {
                resetFields();
                onClose();
              }}
              className="absolute top-0 right-0"
            >
              <XIcon className="cursor-pointer hover:text-red-500" />
            </button>
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
                <Select
                  value={industry}
                  onValueChange={(value) => setIndustry(value)}
                  required
                >
                  <SelectTrigger className="bg-white appearance-none py-0 px-3 h-[40.5px] w-full text-md border border-gray-500 rounded-md">
                    <SelectValue placeholder="Web Development" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 overflow-y-auto">
                    {industryOptions.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      {selectedLocation.location !== "" ? "Edit" : "Enter"}{" "}
                      location
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
                  min={1980}
                  max={currentYear}
                  onKeyDown={handleYearInput}
                  placeholder="XXXX"
                  pattern="^(19[8-9]\d|20\d\d|2100)$"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
                {!validYears && (
                  <p className="text-red-500 text-xs">
                    Start year cannot exceed end year
                  </p>
                )}
              </div>
              <div className="col-span-6">
                <p className="text-xs font-light">End Year*</p>
                {presentJob === false && (
                  <>
                    <input
                      min={1980}
                      max={currentYear}
                      onKeyDown={handleYearInput}
                      pattern="^^(19[8-9]\d|20\d\d|2100)$"
                      placeholder="XXXX"
                      type="number"
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                      required
                      className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                    />
                    {!validYears && (
                      <p className="text-red-500 text-xs">
                        Start year cannot exceed end year
                      </p>
                    )}
                  </>
                )}
                {presentJob === true && (
                  <p className="cursor-not-allowed bg-gray-300 py-2 px-3 border border-gray-500 w-full text-gray-500 rounded-md">
                    present
                  </p>
                )}
                {/* pag wala pang present job, tsaka lang lalabas yung checkbox ng present job */}
                {numOfPresentJobs == 0 ? (
                  <div className="pt-1 flex gap-2 justify-start items-center">
                    <Checkbox
                      checked={presentJob}
                      onCheckedChange={(value: boolean) => {
                        handlePresentJob(value);
                      }}
                      className="bg-white"
                    />
                    <p className="text-xs font-light">Present job?</p>
                  </div>
                ) : (
                  <div className="pt-1 flex gap-2 justify-start items-center">
                    <p className="text-xs font-light">
                      You can only have one active job marked as 'present.'
                      Please update your current job's end year before adding a
                      new position.
                    </p>
                  </div>
                )}
              </div>
              {presentJob === true && (
                <div className="col-span-12">
                  <p className="text-xs font-light">Proof of Employment*</p>
                  {/* palagay nalang dito ng for proof of employment salamatttttttttttttt */}
                  <CareerDocumentUpload
                    documentSetter={handleDocumentUpload}
                    hasProof={hasProof}
                  ></CareerDocumentUpload>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                color="primary"
                disabled={loading}
                className="w-20 bg-[#0856ba] text-white py-2 px-3 rounded-full cursor-pointer hover:bg-[#92b2dc]"
              >
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
