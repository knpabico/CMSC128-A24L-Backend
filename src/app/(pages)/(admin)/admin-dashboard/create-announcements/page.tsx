"use client";
import ModalInput from "@/components/ModalInputForm";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import { Button } from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";

export default function Users() {
  const {
    announces,
    isLoading,
    isEdit,
    handleSubmit,
    handleCheckbox,
    handleDelete,
    handleEdit,
    title,
    description,
    showForm,
    type,
    isPublic,
    setTitle,
    setDescription,
    setShowForm,
    setType,
    setIsEdit,
    setCurrentAnnouncementId,
    setIsPublic,
  } = useAnnouncement();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <h1>ANNOUNCEMENTS</h1>
      {isLoading && <h1>Loading</h1>}
      {announces.map((user: Announcement, index: any) => (
        <div
          key={index}
          className="p-1 flex justify-between items-center borderwww-b pb-2"
        >
          <div>
            <h1>{user.title}</h1>
            <h2>{user.datePosted.toLocaleString()}</h2>
            <h2>{user.description}</h2>
            <h2>Announcement Type: {user.type.join(", ")}</h2>
          </div>
          <div className="flex gap-4">
            <button
              className="text-blue-500 hover:underline"
              onClick={() => {
                // Set the form fields to the values of the announcement being edited
                setTitle(user.title);
                setDescription(user.description);
                setType(user.type);
                setShowForm(true);
                setIsEdit(true);
                setCurrentAnnouncementId(user.announcementId);
              }}
            >
              Edit
            </button>
            <button
              className="text-red-500 hover:underline"
              onClick={() => handleDelete(user.announcementId)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full"
        onClick={() => {
          setShowForm(!showForm);
          setTitle("");
          setDescription("");
          setType([]);
        }}
      >
        +
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <form
            onSubmit={isEdit ? handleEdit : handleSubmit}
            className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w"
          >
            <h2 className="text-xl mb-4">Add Announcement</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <textarea
              rows={6}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <Button onClick={() => setIsModalOpen(true)}>
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
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value="Update"
                  checked={type.includes("Update")}
                  onChange={() => handleCheckbox("Update")}
                />
                Update
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  value="Announcement"
                  checked={type.includes("Announcement")}
                  onChange={() => handleCheckbox("Announcement")}
                />
                Announcement
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  value="isPublic"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                />
                Make this announcement public?
              </label>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
