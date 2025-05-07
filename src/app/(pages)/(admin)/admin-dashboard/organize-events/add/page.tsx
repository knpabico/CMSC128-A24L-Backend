"use client";

import { useState, useEffect } from "react";
import { useEvents } from "@/context/EventContext";
import { Asterisk, Upload } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function CreateEventPage() {
  const router = useRouter();
  const {
    addEvent,
    image,
    setEventImage,
    setEventTitle,
    setEventDescription,
    setEventLocation,
    setEventDate,
    setEventTime,
    handleSave,
    title,
    description,
    date,
    time,
    location,
    fileName,
    setFileName,
    handleImageChange,
    preview,
    setPreview
  } = useEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedButton, setButton] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Check if form is complete
  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    location.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    image !== "" &&
    (visibility !== "batch" || selectedBatches.length > 0) &&
    (visibility !== "alumni" || selectedAlumni.length > 0);

  const resetFormState = () => {
    setEventTitle("");
    setEventDescription("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventImage("");
    setVisibility("all");
    setSelectedBatches([]);
    setSelectedAlumni([]);
    setFileName("");
    setErrorMessage("");
    setButton("");
    setPreview(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Check form completion first
    if (!formComplete) {
      setErrorMessage("Please fill out all required fields before proposing the event.");
      setIsSubmitting(false);
      return; // Stop further processing
    }

    // store the selected guests
    const targetGuests =
      visibility === "batch"
        ? selectedBatches
        : visibility === "alumni"
        ? selectedAlumni
        : [];

    // Validate batch inputs if batch visibility is selected
    if (visibility === "batch") {
      if (selectedBatches.length === 0) {
        setErrorMessage("Please add at least one batch.");
        setIsSubmitting(false);
        return;
      }
      if (selectedBatches.some(batch => !/^\d+$/.test(batch))) {
        setErrorMessage("Batch inputs must contain only numbers.");
        setIsSubmitting(false);
        return;
      }
    }

    // Validate alumni inputs if alumni visibility is selected
    if (visibility === "alumni") {
      if (selectedAlumni.length === 0) {
        setErrorMessage("Please add at least one alumni email.");
        setIsSubmitting(false);
        return;
      }
      if (selectedAlumni.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        setErrorMessage("Please ensure all alumni inputs are valid email addresses.");
        setIsSubmitting(false);
        return;
      }
    }

    // Handle creation based on selected button
    if (selectedButton === "Create") {
      const form = document.querySelector("form");
      if (!form || !form.checkValidity()) {
        form?.reportValidity();
        setIsSubmitting(false);
        return;
      }

      const newEvent = {
        datePosted: new Date(),
        title,
        description,
        date,
        time,
        location,
        image,
        inviteType: visibility,
        numofAttendees: 0,
        targetGuests,
        stillAccepting: true,
        needSponsorship: false,
        rsvps: [],
        eventId: "",
        status: "Accepted",
        creatorId: "",
        creatorName: "",
        creatorType: "",
        donationDriveId: ""
      };

      addEvent(newEvent, true, true);
    } else {
      // If button is not "Create", save as draft
      handleSave(e, image, targetGuests, visibility, "Draft");
    }

 
    resetFormState();
    setIsSubmitting(false);
    router.push("/admin-dashboard/organize-events");
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <Breadcrumbs
        items={[
          { href: "/admin-dashboard", label: "Admin Dashboard" },
          { href: "/admin-dashboard/organize-events", label: "Events" },
          { label: "Create Event" },
        ]}
      />
      
      <div className="text-3xl font-bold">Create Event</div>
      
      <form
        className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto"
        onSubmit={handleSubmit}
      >
        {/* Event Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Asterisk size={16} className="text-red-600 inline-block mr-1" />
            Event Title
          </label>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setEventTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* Event Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Asterisk size={16} className="text-red-600 inline-block mr-1" />
            Description
          </label>
          <textarea
            rows={6}
            placeholder="Event Description (Format: online / F2F & Venue/Platform)"
            value={description}
            onChange={(e) => setEventDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <Button onClick={() => setIsModalOpen(true)} className="mt-2">
            Need AI help for description?
          </Button>
          <ModalInput
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={(response) => setEventDescription(response)}
            title="AI Assistance for Events"
            type="event"
            mainTitle={title}
            subtitle="Get AI-generated description for your event. Only fill in the applicable fields."
          />
        </div>

        {/* Event Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Asterisk size={16} className="text-red-600 inline-block mr-1" />
            Location
          </label>
          <textarea
            placeholder="Event Location"
            value={location}
            onChange={(e) => setEventLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">
              <Asterisk size={16} className="text-red-600 inline-block mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setEventDate(e.target.value)}
              onKeyDown={(e) => e.preventDefault()} // prevent manual typing
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              min={
                date
                  ? new Date(date).toISOString().split("T")[0]
                  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
              }
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">
              <Asterisk size={16} className="text-red-600 inline-block mr-1" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              min="08:00"
              max="22:00"
            />
          </div>
        </div>

        {/* Event Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Asterisk size={16} className="text-red-600 inline-block mr-1" />
            Event Image
          </label>
          <label
            htmlFor="image-upload"
            className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center w-fit"
          >
            <Upload className="inline-block mr-2" size={18} />
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
          {fileName && (
            <p className="mt-2 text-sm text-gray-600">Selected file: {fileName}</p>
          )}
          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {/* Visibility Options */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Asterisk size={16} className="text-red-600 inline-block mr-1" />
            Visibility
          </label>
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            {/* Open to All Option */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="all"
                checked={visibility === "all"}
                onChange={() => {
                  setVisibility("all");
                  setSelectedAlumni([]);
                  setSelectedBatches([]);
                }}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              />
              <span>Open to all</span>
            </label>

            {/* Batch Option */}
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="batch"
                checked={visibility === "batch"}
                onChange={() => {
                  setVisibility("batch");
                  setSelectedAlumni([]);
                }}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 mt-1"
              />
              <div className="flex flex-col w-full">
                <span>Batch:</span>
                {visibility === "batch" && (
                  <>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBatches.map((batch, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center"
                        >
                          {batch}
                          <button
                            type="button"
                            className="ml-2 text-red-500 font-bold"
                            onClick={() =>
                              setSelectedBatches((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      placeholder="e.g. 2022"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value && !selectedBatches.includes(value)) {
                            setSelectedBatches([...selectedBatches, value]);
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <p className="text-gray-500 text-sm mt-2">Press "Enter" to add the batch.</p>
                  </>
                )}
              </div>
            </label>

            {/* Alumni Option */}
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="alumni"
                checked={visibility === "alumni"}
                onChange={() => {
                  setVisibility("alumni");
                  setSelectedBatches([]);
                }}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 mt-1"
              />
              <div className="flex flex-col w-full">
                <span>Alumni:</span>
                {visibility === "alumni" && (
                  <>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAlumni.map((email, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center"
                        >
                          {email}
                          <button
                            type="button"
                            className="ml-2 text-red-500 font-bold"
                            onClick={() =>
                              setSelectedAlumni((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      placeholder="e.g. email1@up.edu.ph"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value && !selectedAlumni.includes(value)) {
                            setSelectedAlumni([...selectedAlumni, value]);
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <p className="text-gray-500 text-sm mt-2">Press "Enter" to add the alumni.</p>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              resetFormState(); // Reset the form state
              router.push("/admin-dashboard/organize-events"); // Navigate back to the events page
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            <button
              type="submit"
              onClick={() => setButton("Draft")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              onClick={() => setButton("Create")}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formComplete}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
