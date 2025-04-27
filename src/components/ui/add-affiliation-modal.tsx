"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Affiliation } from "@/models/models";
import { useAffiliation } from "@/context/AffiliationContext";


const AddAffiliationModal = ({
  open,
  onClose,
  userId,
  setSuccess,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  setSuccess: (success: boolean) => void;
}) => {
  const [affiliationName, setAllAffiliationName] = useState<string>("");
  const [yearJoined, setYearJoined] = useState<string>("");
  const [university, setUniversity] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const { addAffiliation } = useAffiliation();


  const handleSubmit = async (affiliation: Affiliation) => {
    const result = await addAffiliation(affiliation, userId);
    setSuccess(result.success);
    console.log("HGGFHGHLKJ");
    if (result.success) {
      // Clear fields
      setAllAffiliationName("");
      setYearJoined("");
      setUniversity("");
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
            Add Affiliation
          </CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
                handleSubmit({
                    affiliationName,
                    yearJoined,
                    university,
                });

            }}
            className="space-y-4"
          >
            <TextField
              label="University"
              value={affiliationName}
              onChange={(e) => setAllAffiliationName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Year Joined"
              type="number"
              value={yearJoined}
              onChange={(e) => setYearJoined(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
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

export default AddAffiliationModal;
