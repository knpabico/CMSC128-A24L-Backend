"use client";
import ModalInput from "@/components/ModalInputForm";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { ArrowLeft, ChevronRight, Pencil, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toastError } from "@/components/ui/sonner";

export default function AddAnnouncement() {
  const {
    isEdit,
    handleSubmit,
    handleEdit,
    handleCheckbox,
    title,
    description,
    image,
    type,
    setTitle,
    setDescription,
    setType,
    setAnnounceImage,
    handleImageChange
  } = useAnnouncement();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const syncImagePreview = async () => {
      const contextImage = await getImageFromContext();
      if (contextImage) {
        setImagePreview(contextImage);
      }
    };
    
    syncImagePreview();
  }, []);

  const getImageFromContext = async () => {
    if (image) return image;
    else return null
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
    
    if (imagePreview) {
      setAnnounceImage(imagePreview);
    } else {
      toastError(`Error uploading image`)
    }    
    try {
      await handleEdit(e);
      
      setIsEditing(false);
      router.push("/admin-dashboard/announcements/manage");
    } catch (error) {
      toastError("Error submitting announcement");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setImagePreview(image);
    setImageFile(null);
    setIsEditing(false);
  };
  
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setAnnounceImage(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.push("/admin-dashboard")}
          className="cursor-pointer rounded-full transition"
        >
          Home
        </button>
        <div>
          <ChevronRight size={15} />
        </div>
        <button 
          onClick={() => router.push("/admin-dashboard/announcements/manage")}
          className="cursor-pointer rounded-full transition"
        >
          Manage Announcements
        </button>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          {isEditing ? 'Edit Announcement' : (title ? title : 'View Announcement')}
        </div>
      </div>
      
      {/* Header with Edit button */}
      <div className={`${isEditing ? 'w-full py-1' : 'w-full'}`}>
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            {title || "Announcement"}
          </div>
          {!isEditing && (
            <div 
              onClick={handleEditClick}
              className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
            >
              <Pencil size={18} /> Edit Announcement
            </div>
          )}
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-3">
          <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
            <div className="flex flex-col gap-3">
              
              {/* Title */}
              <div className="space-y-2">
                <input
                  id="title"
                  type="text"
                  placeholder="Announcement Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-none text-xl font-bold rounded-md focus:outline-none"
                  required
                  disabled={!isEditing}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <textarea
                  id="description"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full resize-y border-none rounded-md focus:outline-none"
                  required
                  disabled={!isEditing}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <div className="relative bg-amber-300 h-32 w-32 rounded-md flex items-center justify-center overflow-hidden">
                    <div 
                      className={`relative bg-amber-300 ${isEditing ? 'hover:bg-amber-400 cursor-pointer' : ''} h-32 w-32 rounded-md flex items-center justify-center overflow-hidden`}
                      onClick={() => isEditing && document.getElementById("image-upload")?.click()}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Announcement image"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <Plus size={24} className="mt-5"/>
                          <span className="text-sm">Upload an image</span>
                        </div>
                      )}
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChangeLocal}
                        className="hidden"
                        disabled={!isEditing}
                      /> 
                    </div> 
                    {imagePreview && isEditing && (
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    )} 
                  </div>
                </div>
              </div>

              {/* Announcement Type */}
              <div className="space-y-2 mt-5 mb-10">
                <p className="block text-sm font-medium">Announcement type</p>
                <div className="flex space-x-6">                  
                  <label className="ml-2 block text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Donation Update"
                      checked={type && type.includes("Donation Update")}
                      onChange={() => isEditing && handleCheckbox("Donation Update")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled={!isEditing}
                    />
                    <span>Donation Update</span>
                  </label>
                  <label className="ml-2 block text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Event"
                      checked={type && type.includes("Event Update")}
                      onChange={() => isEditing && handleCheckbox("Event Update")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled={!isEditing}
                    />
                    <span>Event Update</span>
                  </label>
                  <label className="ml-2 block text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="General Announcement"
                      checked={type && type.includes("General Announcement")}
                      onChange={() => isEditing && handleCheckbox("General Announcement")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled={!isEditing}
                    />
                    <span>General Announcement</span>
                  </label>
                </div>
              </div>

              {/* AI - only show when editing */}
              {isEditing && (
                <div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="pl-2 text-[#0856BA] hover:text-blue-700 font-semibold text-sm bg-transparent hover:bg-transparent"
                  >
                    Need AI help for description?
                  </button>
                  <ModalInput
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={(response) => setDescription(response)}
                    title="AI Assistance for Announcement"
                    type="announcement"
                    subtitle="Get AI-generated description for your announcement. Only fill in the applicable fields."
                    mainTitle={title}
                  />
                </div>
              )}
            </div>          
          </div>
          
          {/* Cancel and Update buttons - only show when editing */}
          {isEditing && (
            <div className="fixed right-0 left-64 bottom-0 border-t border-x border-blue-700 bg-white rounded-t-2xl p-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelClick}
                className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700 transition"
              >
                Update
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}