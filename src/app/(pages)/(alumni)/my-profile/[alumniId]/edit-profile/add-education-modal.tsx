"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TextField, Typography, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import GoogleMapsModal from "../../google-maps/map";
import { Education } from "@/models/models";
import { useEducation } from "@/context/Education";

export const AddEducationModal = ({
  isOpen,
  setIsOpen,
  userId,
  open,
  setOpen,
  setSuccess,
}) => {
  const [university, setUniversity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [yearGraduated, setYearGraduated] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    location: "",
    latitude: 14.25,
    longitude: 121.25,
  });
  const [error, setError] = useState<boolean>(false);
  const { addEducation } = useEducation();

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      location: address,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleSubmit = async (education: Education) => {
    const result = await addEducation(education, userId);
    setSuccess(result.success);
    if (result.success) {
      setUniversity("");
      setType("");
      setYearGraduated("");
      setMajor("");
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
            Add Education Experience
          </CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedLocation.location !== "") {
                handleSubmit({
                  alumniId: userId, // Assuming userId is used as alumniId
                  university,
                  type,
                  yearGraduated,
                  major,
                });
              } else {
                setError(true);
              }
            }}
          >
            <TextField
              label="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            />
            <TextField
              label="Degree Type (e.g., Bachelor, Master)"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
            <TextField
              label="Year Graduated"
              type="number"
              value={yearGraduated}
              onChange={(e) => setYearGraduated(e.target.value)}
              required
            />
            <TextField
              label="Major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
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
