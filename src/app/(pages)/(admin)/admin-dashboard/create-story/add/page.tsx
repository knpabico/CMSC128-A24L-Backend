"use client";

import { useFeatured } from "@/context/FeaturedStoryContext";
import { useState } from "react";
import { ChevronRight, Asterisk, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError } from "@/components/ui/sonner";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";

export default function CreateFeaturedStoryPage() {
  const router = useRouter();

  const {
    handleSubmit,
    text,
    title,
    image,
    type,
    setText,
    setTitle,
    setImage,
    setType,
  } = useFeatured();

  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //preview
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!image) {
      toastError("Please attach an image before submitting");
      setIsSubmitting(false);
      return;
    }

    try {
      await handleSubmit(e);
      toastSuccess("Featured story created successfully!");
      router.push("/admin-dashboard/create-story");
    } catch (error) {
      console.error("Error saving featured story:", error);
      toastError("Failed to save featured story");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <title>Write Featured Story | ICS-ARMS</title>
      <div className="flex items-center gap-2">
        <span
          className="cursor-pointer"
          onClick={() => router.push("/admin-dashboard")}
        >
          <div>Home</div>
        </span>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>
          <span
            className="cursor-pointer"
            onClick={() => router.push("/admin-dashboard/create-story")}
          >
            Manage Featured Stories
          </span>
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          Write Featured Story
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Write Featured Story</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <form
          className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4"
          onSubmit={handleFormSubmit}
        >
          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Title here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Story
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Story here"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                required
              />
              <Button onClick={() => setIsModalOpen(true)} className="mt-2">
                Need AI help for creating a story?
              </Button>
              <ModalInput
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(response) => setText(response)}
                title="AI Assistance for Featured Story"
                type="story"
                mainTitle={title}
                subtitle="Get AI-generated description for your story. Only fill in the applicable fields."
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="" disabled hidden>
                  Select Type
                </option>
                <option value="event">Event</option>
                <option value="donation">Donation</option>
                <option value="scholarship">Scholarship</option>
              </select>
            </div>

            <div className="space-y-2 text-start">
              <div className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600" /> Featured Image:
              </div>

              <div className="mt-3">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center gap-2 bg-[#0856BA] text-white px-4 py-2 rounded-md cursor-pointer transition-colors hover:bg-[#0645a0]"
                >
                  <Upload className="size-4" />
                  Attach Photo
                </label>
              </div>

              {(preview || image) && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Preview:</p>
                  <img
                    src={preview || image}
                    alt="Preview"
                    style={{ width: "200px", borderRadius: "8px" }}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => router.push("/admin-dashboard/create-story")}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !image}
              className={`flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-white border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full ${
                isSubmitting || !image
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[var(--blue-600)]"
              }`}
            >
              {isSubmitting ? "Processing..." : "Create Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
