"use client";

import { uploadImage } from "@/lib/upload";
import { Alumnus, Scholarship, Student } from "@/models/models";
import { useScholarship } from "@/context/ScholarshipContext";
import React, { useEffect, useRef, useState } from "react";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { Asterisk, ChevronRight, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { handleYearInput } from "@/validation/auth/sign-up-form-schema";

export default function AddStudent() {
  const params = useParams();
  const {
    getScholarshipById,
    updateScholarship,
    getStudentsByScholarshipId,
    addStudent,
  } = useScholarship();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scholarshipId = params?.id as string;
  // Input Data
  const [formData, setFormData] = useState({
    name: "",
    studentNumber: "",
    age: "",
    shortBackground: "",
    address: "",
    emailAddress: "",
    background: "",
  });

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      studentId: "",
      name: formData.name,
      studentNumber: formData.studentNumber,
      age: Number(formData.age),
      shortBackground: formData.shortBackground,
      address: formData.address,
      emailAddress: formData.emailAddress,
      background: formData.background,
    };
    setIsSubmitting(true);
    const response = await addStudent(newStudent);
    const { studentList } = scholarship as Scholarship;

    if (response.success) {
      setFormData({
        name: "",
        studentNumber: "",
        age: "",
        shortBackground: "",
        address: "",
        emailAddress: "",
        background: "",
      });

      //update scholarship's student list
      const updateScholarshipResponse = await updateScholarship(scholarshipId, {
        studentList: [...studentList, newStudent.studentId],
      });

      //check reponse if success or not
      if (updateScholarshipResponse.success) {
        toastSuccess(`You have successfully added student ${formData.name}.`);
      } else {
        console.error(
          "Error adding student: ",
          updateScholarshipResponse.message
        );
      }
      setIsSubmitting(false);
      router.push(`/admin-dashboard/scholarships/manage/${scholarshipId}/`);
    } else {
      console.error("Error adding student: ", response.message);
    }
  };

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const data = await getScholarshipById(scholarshipId);
        if (data) {
          setScholarship(data);
        } else {
          setError("Scholarship not found");
        }
      } catch (err) {
        setError("Error loading scholarship details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (scholarshipId) {
      fetchScholarship();
    }
  }, [scholarshipId]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div>Home</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>Manage Scholarships</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>{scholarship?.title}</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">Add Student</div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Add Student</div>
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
            {/* Student Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Student Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Student name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Student Number */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Student Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="20XX-XXXX"
                pattern="^(20\d\d|2100)-\d{5}$"
                value={formData.studentNumber}
                onChange={(e) =>
                  setFormData({ ...formData, studentNumber: e.target.value })
                }
                required
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Age
              </label>
              <input
                onKeyDown={handleYearInput}
                min={18}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Age"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                required
              />
            </div>

            {/* Short Background */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Short Background
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Short Background"
                value={formData.shortBackground}
                onChange={(e) =>
                  setFormData({ ...formData, shortBackground: e.target.value })
                }
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Email address"
                value={formData.emailAddress}
                onChange={(e) =>
                  setFormData({ ...formData, emailAddress: e.target.value })
                }
                required
              />
            </div>

            {/* Background */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Background
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Background"
                value={formData.background}
                onChange={(e) =>
                  setFormData({ ...formData, background: e.target.value })
                }
                required
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="bg-white rounded-2xl p-4 flex justify-end gap-2">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
            >
              {isSubmitting ? "Processing…" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
