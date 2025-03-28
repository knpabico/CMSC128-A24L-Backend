"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TextField, Typography, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import GoogleMapsModal from "../../google-maps/map";
import { WorkExperience } from "@/models/models";
import { useWorkExperience } from "@/context/WorkExperienceContext";

export const WorkExperienceModal = ({
  isOpen,
  setIsOpen,
  userId,
  open,
  setOpen,
  setSuccess,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [company, setCompany] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    location: "",
    latitude: 14.25,
    longitude: 121.25,
  });
  const [error, setError] = useState<boolean>(false);
  const { addWorkExperience } = useWorkExperience();

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      location: address,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleSubmit = async (work_experience: WorkExperience) => {
    const result = await addWorkExperience(work_experience, userId);
    setSuccess(result.success);
    if (result.success) {
      setStartDate(null);
      setEndDate(null);
      setCompany("");
      setDetails("");
      setIsOpen(false);
      setSelectedLocation({
        location: "",
        latitude: 14.25,
        longitude: 121.25,
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedLocation({
        location: "",
        latitude: 14.25,
        longitude: 121.25,
      });
    }
  }, [isOpen]);

  return (
    isOpen && (
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Add Work Experience
          </CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedLocation.location !== "") {
                handleSubmit({
                  company,
                  location: selectedLocation.location,
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  details,
                  startingDate: startDate,
                  endingDate: endDate,
                });
              } else {
                setError(true);
              }
            }}
          >
            <TextField
              label="Company"
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <TextField
              label="Details"
              onChange={(e) => setDetails(e.target.value)}
              required
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
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
              <Typography>End Date</Typography>
              <input
                type="date"
                required
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardHeader>
        <Snackbar
          open={error}
          onClose={() => setError(false)}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            Please select a location!
          </div>
        </Snackbar>
      </Card>
    )
  );
};
