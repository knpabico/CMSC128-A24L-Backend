"use client";

import { uploadImage } from "@/lib/upload";
import { Scholarship } from "@/models/models";
import { useScholarship } from "@/context/ScholarshipContext";
import React, { useRef, useState } from "react";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { Asterisk, ChevronRight, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddScholarships() {
  const { scholarships, loading, error, addScholarship, updateScholarship } =
    useScholarship();
	const router = useRouter();
  // Input Data
  const [formData, setFormData] = useState({
    description: "",
    title: "",
    image: "",
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [image, setImage] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const buttonsContainerRef = useRef(null);
  const placeholderRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newScholarship: Scholarship = {
      title: formData.title,
      description: formData.description,
      datePosted: new Date(),
      alumList: [],
      image: "",
      scholarshipId: "",
    };
    setIsSubmitting(true);
    const response = await addScholarship(newScholarship);
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
        <div className="hover:text-blue-600 cursor-pointer" onClick={home}>Home</div>
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
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Upload className="size-4" />
                  Upload Photo
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
