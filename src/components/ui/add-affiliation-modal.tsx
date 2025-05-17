"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Affiliation } from "@/models/models";
import { useAffiliation } from "@/context/AffiliationContext";
import { XIcon } from "lucide-react";


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
    // setSnackbarOpen(true);
  };


  if (!open) return null;


  //Ito yung galawin mo arrianne
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <CardHeader>
          <div className="flex items-center justify-between relative">
            <p className="text-xl font-bold pb-3">Add affiliation</p>
            <button onClick={onClose} className="absolute top-0 right-0"><XIcon className="cursor-pointer hover:text-red-500"/></button>
          </div>
       
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
            <div className="grid grid-cols-12 gap-x-4 gap-y-3 pb-3">
              <div className="col-span-9">
                <p className="text-xs font-light">Affiliation Name*</p>
                <input
                  placeholder="Society of X"
                  value={affiliationName}
                  onChange={(e) => setAllAffiliationName(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
              </div>
              <div className="col-span-3">
                <p className="text-xs font-light">Year Joined*</p>
                <input
                  placeholder="XXXX"
                  type="number"
                  value={yearJoined}
                  onChange={(e) => setYearJoined(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
              </div>
              <div className="col-span-12">
                <p className="text-xs font-light">University*</p>
                <input
                  placeholder="University of the Philippines"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />
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

      {/* <Snackbar
        open={error}
        onClose={() => setError(false)}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            Please Enter Some Details
          </div>
      </Snackbar> */}
    </div>
  );
};

export default AddAffiliationModal;
