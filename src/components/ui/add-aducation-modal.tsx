"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Education } from "@/models/models";
import { useEducation } from "@/context/EducationContext";


const AddEducationModal = ({
  open,
  onClose,
  userId,
  setSuccess,
  degreeType,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  setSuccess: (success: boolean) => void;
}) => {
  const [university, setUniversity] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [yearGraduated, setYearGraduated] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const { addEducation } = useEducation();


  const handleSubmit = async (education: Education) => {
    const result = await addEducation(education, userId);
    setSuccess(result.success);
    console.log("HGGFHGHLKJ");
    if (result.success) {
      // Clear fields
      setUniversity("");
      setType("");
      setYearGraduated("");
      setMajor("");
      onClose();
    }
    setSnackbarOpen(true);
  };


  if (!open) return null;


  //Ito yung galawin mo arrianne
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-green bg-opacity-50 z-50">
      <Card className="w-full max-w-3xl p-4 bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">
            Add {degreeType} Degree
          </CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
                handleSubmit({
                    university,
                    type,
                    yearGraduated,
                    major,
                });

            }}
            className="space-y-4"
          >
            <TextField
              label="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Degree Type (e.g., Bachelor, Master)"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Year Graduated"
              type="number"
              value={yearGraduated}
              onChange={(e) => setYearGraduated(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
              fullWidth
            />


            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </div>
          </form>
        </CardHeader>
      </Card>

      <Snackbar
        open={error}
        onClose={() => setError(false)}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            Please Enter Some Details
          </div>
      </Snackbar>
    </div>
  );
};

export default AddEducationModal;
