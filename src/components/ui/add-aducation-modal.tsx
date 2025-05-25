"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Education } from "@/models/models";
import { useEducation } from "@/context/EducationContext";
import { XIcon } from "lucide-react";


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
  degreeType: string;
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
    // setSnackbarOpen(true);
  };


  if (!open) return null;


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-xl bg-white border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <CardHeader>
          <div className="flex items-center justify-between relative">
            {degreeType == "bachelors" && (<p className="text-xl font-bold pb-3">Add bachelor's degree</p>)}
            {degreeType == "masters" && (<p className="text-xl font-bold pb-3">Add master's degree</p>)}
            {degreeType == "doctoral" && (<p className="text-xl font-bold pb-3">Add doctoral degree</p>)}
            <button onClick={onClose} className="absolute top-0 right-0"><XIcon className="cursor-pointer hover:text-red-500"/></button>
          </div>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
                handleSubmit({
                    university,
                    type:degreeType,
                    yearGraduated,
                    major
                });

            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-12 gap-x-4 gap-y-3 pb-3">
              <div className="col-span-9">
                <p className="text-xs font-light">Degree Program*</p>
                {degreeType == "bachelors" && (<input
                  placeholder="Bachelor of Science in Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />)}
                {degreeType == "masters" && (<input
                  placeholder="Master of Science in Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />)}
                {degreeType == "doctoral" && (<input
                  placeholder="Doctor of Philosophy in Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                  className="appearance-none py-2 px-3 w-full border border-gray-500 rounded-md"
                />)}
              </div>
              <div className="col-span-3">
                <p className="text-xs font-light">Year Graduated*</p>
                <input
                  placeholder="XXXX"
                  type="number"
                  value={yearGraduated}
                  onChange={(e) => setYearGraduated(e.target.value)}
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

export default AddEducationModal;
