"use client";
import CollapseText from "@/components/CollapseText";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

export default function Users() {
  const {
    announces,
    isLoading,
    isEdit,
    handleSubmit,
    handleDelete,
    handleEdit,
    title,
    description,
    showForm,
    setTitle,
    setDescription,
    setShowForm,
    setIsEdit,
    setCurrentAnnouncementId,
    setAnnounceImage,
    handleImageChange,
    preview,
    setPreview,
  } = useAnnouncement();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (imageFile) {
      const localUrl = URL.createObjectURL(imageFile);
      setAnnounceImage(imageFile);
      setPreview(localUrl);
    } 
    isEdit ? handleEdit(e) : handleSubmit(e);
    setImageFile(null);
    setPreview(null);
    setAnnounceImage(null);
    setShowForm(false);
  };

  function formatDate(timestamp: any) {
    if (!timestamp || !timestamp.seconds) return "Invalid Date";
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split("T")[0];
  }

  return (
    <div className="p-8">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 transition"
          onClick={() => {
            setShowForm(true);
            setTitle("");
            setDescription("");
            setAnnounceImage(null);
            setPreview(null);
            setImageFile(null);
            setIsEdit(false);
          }}
        >
          + Create Announcement
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-lg mb-6">
        <span className="font-medium text-gray-700">Filter by:</span>
        <select className="border rounded-lg px-3 py-1 text-sm focus:outline-none">
          <option>Any Date</option>
          <option>Today</option>
          <option>This Week</option>
        </select>
        <select className="border rounded-lg px-3 py-1 text-sm focus:outline-none">
          <option>Privacy</option>
          <option>Public</option>
          <option>Private</option>
        </select>
      </div>

      {/* Announcements List */}
      {isLoading && <h1>Loading...</h1>}
      {announces.map((announcement: Announcement, index: number) => (
        <div
          key={index}
          className="bg-white p-6 mb-4 rounded-lg border border-gray-300 flex justify-between items-start"
        >
          <div className="flex-1 pr-4">
            <p className="text-sm text-gray-500 mb-1">
              Date Posted: {announcement.datePosted.toDateString()}
            </p>
            <h2 className="text-lg font-semibold mb-2">{announcement.title}</h2>
            <CollapseText
              text={announcement.description + " "}
              maxChars={200}
            />
          </div>

          {announcement.image && (
            <div
              className="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
              style={{ minWidth: "130px" }}
            >
              <img
                src={announcement.image}
                alt="Announcement"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              className="text-gray-700 px-3 py-1 rounded-full cursor-pointer"
              onClick={() =>
                setShowDropdown(showDropdown === index ? null : index)
              }
            >
              <EllipsisVertical className="h-4 w-4" />
            </button>

            {showDropdown === index && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border w-40">
                <button
                  className="w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                  onClick={() => {
                    setTitle(announcement.title);
                    setDescription(announcement.description);
                    setShowForm(true);
                    setIsEdit(true);
                    setCurrentAnnouncementId(announcement.announcementId);
                    setPreview(announcement.image ?? null);
                    setShowDropdown(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  onClick={() => {
                    handleDelete(announcement.announcementId);
                    setShowDropdown(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Create/Edit Announcement Modal */}
      {showForm && (
        <div className="fixed w-full h-full bg-gray-200/50">
          <div className="fixed top-0 left-0 right-0 w-full backdrop-blur-sm h-full flex items-center justify-center ">
            <form
              onSubmit={handleFormSubmit}
              className="bg-white p-8 rounded-[26px] border-2 border-gray-300 shadow-lg w-[725px] h-[600px] 2xl:h-[800px] z-50 flex flex-col gap-6 relative"
            >
              {/* Modal Header with Close Button */}
              <div className="absolute top-0 right-0 p-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  &times;
                </button>
              </div>

              <div className="flex justify-center mb-[5px]">
                <h2 className="text-[32px] font-bold">
                  {isEdit ? "Edit Announcement" : "Create Announcement"}
                </h2>
              </div>

              <hr className="mb-6 text-[#D9D9D9]" />

              {/* Title as H1 (Large Text) */}
              <input
                type="text"
                placeholder="Title here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mb-[19px] text-[36px] font-bold outline-none placeholder:text-[#C0C0C0] p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Description as H2 (Medium Text) */}
              <textarea
                placeholder="Description here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none text-[16px] outline-none placeholder:text-[#C0C0C0] p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={5}
                required
              />

              {/* Separator Line between Description and Image Upload */}
              <hr className="my-6 text-[#D9D9D9]" />

              {/* Image Upload Button */}
              <div
                className="w-[155px] h-[155px] rounded-[12px] flex items-center justify-center cursor-pointer bg-[#E5F1FF] mb-6"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-[40px] text-[#0856BA] ">+</span>
                )}
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Post Button */}
              <button
                type="submit"
                className="bg-[#0856BA] text-white text-[20px] py-2 w-full rounded-full hover:bg-blue-600 "
              >
                {isEdit ? "Update" : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
