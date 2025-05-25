"use client";
import ModalInput from "@/components/ModalInputForm";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Button } from "@mui/material";
import {
  ArrowLeft,
  Asterisk,
  ChevronRight,
  Pencil,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toastError, toastSuccess } from "@/components/ui/sonner";

export default function AddAnnouncement() {
  const {
    handleSubmit,
    handleCheckbox,
    title,
    description,
    type,
    setTitle,
    setDescription,
    setType,
    setAnnounceImage,
    handleImageChange,
  } = useAnnouncement();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();
  const placeholderRef = useRef(null);

  // Set General Announcement as default if type is empty
  useEffect(() => {
    if (!type || type.length === 0) {
      handleCheckbox("General Announcement");
    }
  }, []);

  useEffect(() => {
    const syncImagePreview = async () => {
      const contextImage = await getImageFromContext();
      if (contextImage) {
        setImagePreview(contextImage);
      }
    };

    syncImagePreview();
  }, []);

  useEffect(() => {
    if (!placeholderRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    observer.observe(placeholderRef.current);
    return () => observer.disconnect();
  }, []);

  const getImageFromContext = async () => {
    return null;
  };

  const handleImageChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);

      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);
      handleImageChange(e);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (imageFile) {
      const localUrl = URL.createObjectURL(imageFile);
      setAnnounceImage(localUrl);
    }

    if (!type || type.length === 0) {
      toastError("Please select at least one announcement type.");
      return;
    }

    try {
      await handleSubmit(e);
      setImageFile(null);
      setImagePreview(null);
      toastSuccess("You have successfully created announcement.");
      router.push("/admin-dashboard/announcements/manage");
    } catch (error) {
      toastError(`Error creating announcement.`);
    }
  };

  const formComplete = title !== "" && description !== "" && type !== "";

  return (
    <div className="flex flex-col gap-6">
      <title>Add Announcement | ICS-ARMS</title>
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin-dashboard")}
          className="cursor-pointer hover:underline rounded-full transition"
        >
          Home
        </button>
        <div>
          <ChevronRight size={15} />
        </div>
        <button
          onClick={() => router.push("/admin-dashboard/announcements/manage")}
          className="cursor-pointer hover:underline rounded-full transition"
        >
          Manage Announcements
        </button>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          Add Announcements
        </div>
      </div>

      <div className="w-full py-1">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Add Announcement</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-3">
          <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
            <div className="flex flex-col">
              <div className="flex flex-col gap-5">
                {/* Title */}
                <div className="space-y-2 text-[14px]">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium flex items-center"
                  >
                    <Asterisk size={16} className="text-red-600" /> Announcement
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Announcement Title"
                    value={title}
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col">
                  <div className="space-y-2 text-[14px]">
                    <label
                      htmlFor="title"
                      className="text-sm font-medium flex items-center"
                    >
                      <Asterisk size={16} className="text-red-600" />{" "}
                      Description
                    </label>
                    <textarea
                      id="description"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-32 overflow-y-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required
                      maxLength={2000}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{description.length}/2000</span>
                {description.length > 200}
              </div>

              {/* AI */}
              <Button
                onClick={() => setIsModalOpen(true)}
                className="pl-2 text-[#0856BA] hover:text-blue-700 font-semibold text-sm bg-transparent hover:bg-transparent"
              >
                Need AI help for description?
              </Button>
              <ModalInput
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(response) => setDescription(response)}
                title="AI Assistance for Announcement"
                type="announcement"
                subtitle="Get AI-generated description for your announcement. Only fill in the applicable fields."
                mainTitle={title}
              />

              {/* Image Upload */}
              <div className="flex flex-col w-100 gap-2">
                <label
                  htmlFor="image"
                  className="text-sm font-medium flex items-center"
                >
                  Upload Image
                  {/* <Asterisk size={16} className="text-red-600" /> Upload Image */}
                </label>
                {!imagePreview ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="image">
                        <span className="mt-2 block text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PNG, JPG, GIF, WEBP up to 10MB
                        </span>
                      </label>
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChangeLocal}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-2 cursor-pointer">
                    <div className="relative h-64 overflow-hidden rounded-lg  cursor-pointer">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover  cursor-pointer"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 rounded-full bg-white p-1 text-gray-500 shadow-md cursor-pointer hover:text-gray-700"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setAnnounceImage(null);
                        }}
                      >
                        <X className="h-5 w-5  cursor-pointer" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Announcement Type */}
              <div className="space-y-2 mt-5 mb-10">
                <label
                  htmlFor="image"
                  className="text-sm font-medium flex items-center"
                >
                  <Asterisk size={16} className="text-red-600" /> Announcement
                  type
                </label>
                <div className="flex space-x-6">
                  <label className="ml-2 block text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Donation Update"
                      checked={type && type.includes("Donation Update")}
                      onChange={() => handleCheckbox("Donation Update")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span>Donation Update</span>
                  </label>
                  <label className="ml-2 block text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Event Update"
                      checked={type && type.includes("Event Update")}
                      onChange={() => handleCheckbox("Event Update")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span>Event Update</span>
                  </label>
                  <label className="ml-2 block text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="General Announcement"
                      checked={type && type.includes("General Announcement")}
                      onChange={() => handleCheckbox("General Announcement")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span>General Announcement</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Post and Cancel */}
          <div
            ref={placeholderRef}
            className="text-sm bg-white rounded-2xl p-4 flex justify-end gap-2"
          >
            <button
              type="button"
              onClick={() =>
                router.push("/admin-dashboard/announcements/manage")
              }
              className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formComplete}
              className={`flex items-center justify-center gap-2 ${
                formComplete
                  ? "bg-[var(--primary-blue)] text-[var(--primary-white)] hover:bg-[var(--blue-600)] hover:border-[var(--blue-600)]"
                  : "bg-[var(--primary-blue)] text-[var(--primary-white)] hover:bg-[var(--blue-600)] hover:border-[var(--blue-600)] cursor-not-allowed"
              } border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full`}
            >
              Create Announcement
            </button>
          </div>
        </div>
      </form>

      {/* Post and Cancel */}
      {isSticky && (
        <div
          className="text-sm bg-[var(--primary-white)] fixed bottom-0 rounded-t-2xl gap-2 p-4 flex justify-end"
          style={{
            width: "calc(96% - 256px)",
            boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/admin-dashboard/announcements/manage")}
            className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formComplete}
            className={`flex items-center justify-center gap-2 ${
              formComplete
                ? "bg-[var(--primary-blue)] text-[var(--primary-white)] hover:bg-[var(--blue-600)] hover:border-[var(--blue-600)]"
                : "bg-[var(--primary-blue)] text-[var(--primary-white)] hover:bg-[var(--blue-600)] hover:border-[var(--blue-600)] cursor-not-allowed"
            } border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full`}
          >
            Create Announcement
          </button>
        </div>
      )}
    </div>
  );
}
