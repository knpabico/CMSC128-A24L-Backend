"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFeatured } from "@/context/FeaturedStoryContext";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { uploadImage } from "@/lib/upload";
import { Asterisk, ChevronRight, Pencil, Upload } from "lucide-react";

const FeaturedStoryDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getFeaturedById, updateFeatured } = useFeatured();
  
  interface Featured {
    featuredId: string;
    title: string;
    text: string;
    image: string;
    type: string;
  }
  
  const [featured, setFeatured] = useState<Featured | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const featuredId = params?.id as string;

  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    title: "",
    text: "",
    image: "",
    type: "",
  });

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedById(featuredId);
        if (data) {
          setFeatured(data);
          setEditData({
            title: data.title || "",
            text: data.text || "",
            image: data.image || "",
            type: data.type || "",
          });
          setPreview(data.image);
        } else {
          setError("Featured story not found");
        }
      } catch (err) {
        setError("Error loading featured story details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (featuredId) {
      fetchFeatured();
    }
  }, [featuredId]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featured?.featuredId) return;

    let updatedData = { ...editData };
    if (image && image !== featured.image) {
      try {
        setIsSubmitting(true);
        const data = await uploadImage(image, `featured/${featured.featuredId}`);
        if (data.success) {
          updatedData.image = data.url;
          setIsError(false);
          setMessage("Image uploaded successfully!");
        } else {
          setMessage(data.result || "Image upload failed.");
          setIsError(true);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toastError("Image upload error.");
        return;
      }
    }

    const result = await updateFeatured(featured.featuredId, updatedData);
    if (result.success) {
      toastSuccess("Featured story updated successfully!");
      setIsSubmitting(false);
      setIsEditing(false);
    } else {
      toastError("Failed to update: " + result.message);
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return <div style={{ margin: "20px" }}>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="cursor-pointer" onClick={() => router.push("/admin-dashboard")}>
          <div>Home</div>
          </span>
          <div>
            <ChevronRight size={15} />
          </div>
           <span className="cursor-pointer" onClick={() => router.push("/admin-dashboard/create-story")}>
          <div>Manage Featured Stories</div>
          </span>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-bold text-[var(--primary-blue)]">
            {featured?.title}
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="font-bold text-3xl">{featured?.title}</div>
            {!isEditing && (
              <div
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
              >
                <Pencil size={18} /> Edit Featured Story
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <form
            className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4"
            onSubmit={handleEdit}
          >
            <div className="flex flex-col gap-5">
              {/* Title */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium flex items-center"
                >
                  <Asterisk size={16} className="text-red-600" /> Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Title"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  required
                  disabled={!isEditing}
                />
              </div>

              {/* text */}
              <div className="space-y-2">
                <label
                  htmlFor="text"
                  className="text-sm font-medium flex items-center"
                >
                  <Asterisk size={16} className="text-red-600" /> text
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="text"
                  value={editData.text}
                  onChange={(e) =>
                    setEditData({ ...editData, text: e.target.value })
                  }
                  required
                  disabled={!isEditing}
                />
              </div>

              {/* Image */}
              <div className="space-y-2 text-start">
                <div className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Featured Image:
                </div>
                
                <div className="mt-3">
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={!isEditing} />
                  <label
                    htmlFor="image-upload"
                    className={`inline-flex items-center justify-center gap-2 ${
                      isEditing 
                      ? "bg-[#0856BA] text-white hover:bg-[#0645a0] cursor-pointer" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    } px-4 py-2 rounded-md transition-colors`}
                  >
                    <Upload className="size-4" />
                    Attach Photo
                  </label>
                </div>

                {preview && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Preview:</p>
                    <img
                      src={preview}
                      alt="Uploaded Preview" 
                      style={{ width: "200px", borderRadius: "8px" }}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
              </div>

            {/* Buttons */}
            {isEditing && (
              <div className="bg-white rounded-2xl p-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
                >
                  {isSubmitting ? "Processing…" : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default FeaturedStoryDetailPage;