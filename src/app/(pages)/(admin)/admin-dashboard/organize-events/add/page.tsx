"use client";

import React, { useState, useEffect } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { toastSuccess } from "@/components/ui/sonner";
import { Asterisk, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateEvent() {
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
  } = useEvents();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    image: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<string[]>([]);
  const [formComplete, setFormComplete] = useState(false);

  // Handle image change with preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Update form data with the image file
      setFormData({ ...formData, image: selectedFile });
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      setEventImage(selectedFile); // Set image in context
    }
  };

  // Check if form is complete
  useEffect(() => {
    const isComplete =
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.date !== "" &&
      formData.time !== "" &&
      formData.image !== null &&
      (visibility !== "batch" || selectedBatches.length > 0) &&
      (visibility !== "alumni" || selectedAlumni.length > 0);

    setFormComplete(isComplete);
  }, [formData, visibility, selectedBatches, selectedAlumni]);

  // Clean up preview URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Check form completion first
    if (!formComplete) {
      setErrorMessage("Please fill out all required fields before creating the event.");
      setIsSubmitting(false);
      return;
    }

    // Validate batch inputs if batch visibility is selected
    if (visibility === "batch") {
      if (selectedBatches.length === 0) {
        setErrorMessage("Please add at least one batch.");
        setIsSubmitting(false);
        return;
      }
      if (selectedBatches.some((batch) => !/^\d+$/.test(batch))) {
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
      if (selectedAlumni.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        setErrorMessage("Please ensure all alumni inputs are valid email addresses.");
        setIsSubmitting(false);
        return;
      }
    }

    // Store the selected guests
    const targetGuests =
      visibility === "batch"
        ? selectedBatches
        : visibility === "alumni"
        ? selectedAlumni
        : [];

    // Set context values before adding event
    setEventTitle(formData.title);
    setEventDescription(formData.description);
    setEventLocation(formData.location);
    setEventDate(formData.date);
    setEventTime(formData.time);
    setEventImage(formData.image);

    const newEvent: Event = {
      datePosted: new Date(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      image: "", // Will be set inside addEvent after upload
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
      donationDriveId: "",
    };

    try {
      // Add event - passing the image file through the context
      await addEvent(newEvent, true, true);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        time: "",
        image: null,
      });
      setPreview(null);
      setSelectedBatches([]);
      setSelectedAlumni([]);
      setVisibility("all");
    } catch (error) {
      setErrorMessage("Failed to create event. Please try again.");
      console.error("Error creating event:", error);
    } finally {
      router.push("/admin-dashboard/organize-events");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-3xl font-bold">Create Event</div>
      <form
        className="bg-white p-6 rounded-lg shadow-md"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter event title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter event description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        {/* Event Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Asterisk size={16} className="text-red-600 inline-block mr-1" />
            Location
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter event location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              min={
                formData.date
                  ? new Date(formData.date).toISOString().split("T")[0]
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
            Upload Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            required
          />
          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
          {!preview && (
            <p className="text-sm text-gray-500 mt-2">No image selected</p>
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
            onClick={() => router.push("/admin-dashboard/organize-events")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
            Cancel
        </button>

        {/* TO BE IMPLEMENTED */}
        <div className="flex gap-2">
            <button
            type="button"
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
            >
            Save as Draft
            </button>

          <button
            type="submit"
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