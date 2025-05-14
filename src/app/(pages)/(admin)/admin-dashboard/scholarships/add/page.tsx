"use client";

import { uploadImage } from "@/lib/upload";
import { Scholarship, Student } from "@/models/models";
import { useScholarship } from "@/context/ScholarshipContext";
import React, { useRef, useState } from "react";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { Asterisk, ChevronRight, CirclePlus, Upload } from "lucide-react";
import { AddStudent } from "../manage/[id]/add-student-form";
import { useRouter } from "next/navigation";

export default function AddScholarships() {
  const { loading, addScholarship, updateScholarship, addStudent } =
    useScholarship();
  const router = useRouter();
  // Input Data
  const [formData, setFormData] = useState({
    description: "",
    title: "",
    image: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [image, setImage] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const buttonsContainerRef = useRef(null);
  const placeholderRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //forms for student
  const [studentForms, setStudentForms] = useState([
    {
      name: "",
      studentNumber: "",
      age: "",
      shortBackground: "",
      address: "",
      emailAddress: "",
      background: "",
    },
  ]);

  //for adding student form
  const addStudentForm = () => {
    setStudentForms([
      ...studentForms,
      {
        name: "",
        studentNumber: "",
        age: "",
        shortBackground: "",
        address: "",
        emailAddress: "",
        background: "",
      },
    ]);
  };

  //for removing student form
  const removeStudentForm = (index: number) => {
    setStudentForms(studentForms.filter((_, i) => i !== index));
  };

  //for updating student form
  const updateStudentForm = (index: number, updatedStudentData: any) => {
    const updatedStudentForms = [...studentForms];
    updatedStudentForms[index] = updatedStudentData;
    setStudentForms(updatedStudentForms);
  };

  //function for saving the new students to firestore
  const saveStudents = async (students: any[], scholarshipId: string) => {
    let newStudentList = [];
    for (let i = 0; i < students.length; i++) {
      //ensure students[i] is not empty
      if (students[i]) {
        const newStudent: Student = {
          studentId: "",
          name: students[i].name,
          studentNumber: students[i].studentNumber,
          age: Number(students[i].age),
          shortBackground: students[i].shortBackground,
          address: students[i].address,
          emailAddress: students[i].emailAddress,
        };

        const response = await addStudent(newStudent);

        if (response.success) {
          newStudentList.push(response.studentId); //push the studentId to the list
        } else {
          console.error("Error adding student: ", response.message);
        }
      }
    }

    if (newStudentList.length > 0) {
      //update scholarship's student list
      const updateScholarshipResponse = await updateScholarship(scholarshipId, {
        studentList: newStudentList,
      });
      //check reponse if success or not
      if (updateScholarshipResponse.success) {
        console.log(
          `You have successfully added the student/s to the scholarship.`
        );
      } else {
        console.error(
          "Error adding student: ",
          updateScholarshipResponse.message
        );
      }
    }

    setStudentForms([]); //reset the forms
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newScholarship: Scholarship = {
      title: formData.title,
      description: formData.description,
      datePosted: new Date(),
      alumList: [],
      image: "",
      scholarshipId: "",
      status: "",
      studentList: [],
    };
    setIsSubmitting(true);
    const response = await addScholarship(newScholarship);

    await saveStudents(studentForms, newScholarship.scholarshipId); //save the students to firestore

    handleUpload(newScholarship);
    if (response.success) {
      toastSuccess(`You have successfully created ${formData.title}.`);
      setFormData({ description: "", title: "", image: "" });
      setImage(null);
      setPreview(null);
      setIsSubmitting(false);
    } else {
      console.error("Error adding scholarship: ", response.message);
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //preview
    }
  };

  const handleUpload = async (newScholarship: Scholarship) => {
    if (!image) {
      setMessage("No image selected");
      toastError("No Image selected");
      setIsError(true);
      return;
    }
    try {
      const data = await uploadImage(
        image,
        `scholarship/${newScholarship.scholarshipId}`
      );
      const result = await updateScholarship(newScholarship.scholarshipId, {
        image: data.url,
      });
      if (data.success) {
        setIsError(false);
        setMessage("Image uploaded successfully!");
        console.log("Image URL:", data.url); // URL of the uploaded image
      } else {
        setMessage(data.result);
        setIsError(true);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const home = () => {
    router.push("/admin-dashboard");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="hover:text-blue-600 cursor-pointer" onClick={home}>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          Add Scholarship
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Add Scholarship</div>
        </div>
      </div>

      {loading && <h1>Loading</h1>}
      {/* Form */}
      <div className="flex flex-col gap-3">
        <form
          className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-5">
            <div className="text-lg font-medium flex items-center">
              {/* <Asterisk size={16} className="text-red-600" />  */}
              Scholarship Information:
            </div>
            {/* Scholarship Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Scholarship Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Scholarship name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            {/* Scholarship Description */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Scholarship Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2 text-start">
              <div className="flex gap-3">
                <div className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Photo:
                </div>
                <label
                  htmlFor="image-upload"
                  className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="size-4" />
                  {preview ? <div>Change Photo</div> : <div>Upload Photo</div>}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </div>
              {preview && (
                <div className="mt-2 pl-5">
                  <p className="text-sm font-medium flex items-center">
                    Preview:
                  </p>
                  <img
                    src={preview}
                    alt="Uploaded Preview"
                    style={{ width: "200px", borderRadius: "8px" }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="text-lg font-medium flex items-center">
                {/* <Asterisk size={16} className="text-red-600" />  */}
                Student Details:
              </div>
              {studentForms.map((form, index) => (
                <AddStudent
                  key={index}
                  formData={form}
                  onUpdate={(updatedData) =>
                    updateStudentForm(index, updatedData)
                  }
                  onRemove={() => removeStudentForm(index)}
                  type="add"
                  index={index}
                />
              ))}
              <button
                onClick={addStudentForm}
                className="flex items-center justify-center gap-2 text-[var(--primary-blue)] px-4 py-3 cursor-pointer hover:text-blue-500"
              >
                <CirclePlus />
                Add Student
              </button>
            </div>
          </div>
          {/* Submit Button */}
          <div className="bg-white rounded-2xl p-4 flex justify-end gap-2">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
            >
              {isSubmitting ? "Processing…" : "Create Scholarship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
