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
        <CardTitle className="text-xl font-bold">
          Edit Work Experience
        </CardTitle>
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
          <TextField
            label="Company"
            onChange={(e) => setCompany(e.target.value)}
            required
            value={company}
          />
          <TextField
            label="Details"
            onChange={(e) => setDetails(e.target.value)}
            required
            value={details}
          />
          <Typography>Please specify location</Typography>
          {selectedLocation.location !== "" && (
            <div>
              <Typography>{selectedLocation.location}</Typography>
            </div>
          )}
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>
            {selectedLocation.location !== "" ? "Edit" : "Enter"} location
          </Button>
          <GoogleMapsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialAddress={selectedLocation.location}
            initialLatitude={selectedLocation.latitude}
            initialLongitude={selectedLocation.longitude}
            onSave={handleLocationSave}
          />
          <div>
            <Typography>Start Date</Typography>
            <input
              type="date"
              required
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
            <Typography>End Date</Typography>
            <input
              type="date"
              required
              onChange={(e) => setEndDate(new Date(e.target.value))}
              value={endDate.toISOString().split("T")[0]}
            />
          </div>
          <div>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>
    )
  );
};

export default EditWorkExperience;
