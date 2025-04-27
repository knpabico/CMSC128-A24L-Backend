import { WorkExperience } from "@/models/models";
import {
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogContent,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import GoogleMapsModal from "../../google-maps/map";
import { CardTitle } from "@/components/ui/card";
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

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      location: address,
      latitude: lat,
      longitude: lng,
    });
  };

  const { editWorkExperience } = useWorkExperience();

  const handleSubmit = async (work_experience: WorkExperience) => {
    const result = await editWorkExperience(work_experience);
    setSuccess(result.success);
    setMessage(result.message);
    if (result.success) {
      onClose();
    }
  };

  return (
    open && (
      <Card className="w-full max-w-3xl">
        <form
          action=""
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit({
              company,
              location: selectedLocation.location,
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              details: details,
              startingDate: startDate,
              endingDate: endDate,
              workExperienceId: work.workExperienceId,
              alumniId: work.alumniId,
            });
            setSnackbar(true);
          }}
        >
          <div className="flex space-x-7 mb-3">
            <div>
              <p className="text-xs font-light">Company</p>
              <TextField
                onChange={(e) => setCompany(e.target.value)}
                required
                value={company}
                sx={{
                  width: "400px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.375rem",
                    "& fieldset": {
                      borderColor: "#6b7280",
                    },
                    "&:hover fieldset": {
                      borderColor: "#4b5563",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563eb",
                    },
                    "& input": {
                      padding: "10px 16px",
                    },
                  },
                }}
              />
            </div>
            <div>
              <p className="text-xs font-light">Details</p>
              <TextField
                onChange={(e) => setDetails(e.target.value)}
                required
                value={details}
                sx={{
                  width: "12.5rem",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.375rem",
                    "& fieldset": {
                      borderColor: "#6b7280",
                    },
                    "&:hover fieldset": {
                      borderColor: "#4b5563",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563eb",
                    },
                    "& input": {
                      padding: "10px 16px",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-light">Location</p>
            <div className="flex space-x-7 mb-3">
              {selectedLocation.location !== "" && (
                <div>
                  <p className="bg-gray-200 py-2 px-4 border border-gray-500 w-full text-gray-500 rounded-md">
                    {selectedLocation.location}
                  </p>
                </div>
              )}
              <Button variant="contained" onClick={() => setIsModalOpen(true)}>
                {selectedLocation.location !== "" ? "Edit" : "Enter"} location
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

          <div className="flex space-x-7 mb-3">
            <div>
              <p className="text-xs font-light">Start Date</p>
              <input
                type="date"
                required
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="py-2 px-4 border border-gray-500 w-full rounded-md"
              />
            </div>
            <div>
              <p className="text-xs font-light">End Date</p>
              <input
                type="date"
                required
                onChange={(e) => setEndDate(new Date(e.target.value))}
                value={endDate.toISOString().split("T")[0]}
                className="py-2 px-4 border border-gray-500 w-full rounded-md"
              />
            </div>
          </div>

          <div>
            <Button
              style={{ backgroundColor: "#0856BA" }}
              type="submit"
              className="py-2 px-4 border border-gray-500 rounded-md text-white my-5"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    )
  );
};

export default EditWorkExperience;
