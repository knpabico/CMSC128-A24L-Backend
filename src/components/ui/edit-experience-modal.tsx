"use client";

import { WorkExperience } from "@/models/models";
import { Button, Card, Snackbar, TextField } from "@mui/material";
import React, { useState } from "react";
import GoogleMapsModal from "@/app/(pages)/(alumni)/google-maps/map";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkExperience } from "@/context/WorkExperienceContext";

const EditWorkExperience: React.FC<{
  open: boolean;
  work: WorkExperience;
  onClose: () => void;
  snackbar: boolean;
  setSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}> = ({ open, work, onClose, setSnackbar, setMessage, setSuccess }) => {
  const [startDate, setStartDate] = useState<Date>(work.startingDate.toDate());
  const [endDate, setEndDate] = useState<Date>(work.endingDate.toDate());
  const [company, setCompany] = useState<string>(work.company);
  const [details, setDetails] = useState<string>(work.details);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl p-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-6">
            Edit Work Experience
          </CardTitle>
        </CardHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit({
              company,
              location: selectedLocation.location,
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              details,
              startingDate: startDate,
              endingDate: endDate,
              workExperienceId: work.workExperienceId,
              alumniId: work.alumniId,
            });
          }}
          className="space-y-6"
        >
          {/* Company & Details */}
          <div className="flex space-x-6">
            <div className="flex-1">
              <p className="text-sm font-light mb-1">Company</p>
              <TextField
                onChange={(e) => setCompany(e.target.value)}
                required
                value={company}
                fullWidth
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-light mb-1">Details</p>
              <TextField
                onChange={(e) => setDetails(e.target.value)}
                required
                value={details}
                fullWidth
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-sm font-light mb-1">Location</p>
            <div className="flex items-center space-x-4">
              {selectedLocation.location !== "" && (
                <div className="flex-1">
                  <p className="bg-gray-100 py-2 px-4 rounded-md border border-gray-300 text-gray-700">
                    {selectedLocation.location}
                  </p>
                </div>
              )}
              <Button variant="contained" onClick={() => setIsModalOpen(true)}>
                {selectedLocation.location !== "" ? "Edit" : "Enter"} Location
              </Button>
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

          {/* Dates */}
          <div className="flex space-x-6">
            <div className="flex-1">
              <p className="text-sm font-light mb-1">Start Date</p>
              <input
                type="date"
                required
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="py-2 px-4 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-light mb-1">End Date</p>
              <input
                type="date"
                required
                value={endDate.toISOString().split("T")[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="py-2 px-4 border border-gray-300 rounded-md w-full"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditWorkExperience;
