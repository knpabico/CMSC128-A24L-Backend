"use client";

import { useState, useEffect } from "react";
import { useEvents } from "@/context/EventContext";
import { Asterisk, Upload } from 'lucide-react';
import { useRouter, useParams } from "next/navigation";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;

  console.log("Event ID from params:", eventId);
  
  const {
    events,
    updateEvent,
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(null);

  console.log("Event ID:", eventId);
  // Fetch event data on component mount
  useEffect(() => {
    if (eventId && events?.length > 0) {
      const event = events.find(event => event.eventId === eventId);

      
      
      if (event) {
        setCurrentEvent(event);
        // Initialize form with event data
        setEventTitle(event.title || "");
        setEventDescription(event.description || "");
        setEventDate(event.date || "");
        setEventTime(event.time || "");
        setEventLocation(event.location || "");
        
        // Set image and preview if available
        if (event.image) {
          setEventImage(event.image);
          setPreview(event.image);
          // Extract filename from the image URL or path if possible
          const imageName = event.image.split('/').pop();
          setFileName(imageName || "Current image");
        }

        // Set visibility and target guests
        if (event.inviteType) {
          setVisibility(event.inviteType);
          
          if (event.inviteType === "batch" && event.targetGuests?.length > 0) {
            setSelectedBatches(event.targetGuests);
          } else if (event.inviteType === "alumni" && event.targetGuests?.length > 0) {
            setSelectedAlumni(event.targetGuests);
          }
        }
        
        setIsLoading(false);
      } else {
        // Event not found
        setErrorMessage("Event not found");
        setIsLoading(false);
      }
    }
  }, [eventId, events, setEventTitle, setEventDescription, setEventDate, setEventTime, setEventLocation, setEventImage, setPreview]);

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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrorMessage("");
    
      // Validate form completion
      if (!formComplete) {
        setErrorMessage("Please fill out all required fields before updating the event.");
        setIsSubmitting(false);
        return;
      }
    
      // Prepare the targetGuests based on visibility
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
    
      // Prepare the updated event object
      const updatedEvent: Event = {
        eventId: currentEvent?.eventId || "", // Use the existing eventId
        datePosted: currentEvent?.datePosted || new Date(), // Use the existing datePosted or set to now
        title,
        description,
        date,
        rsvps: currentEvent?.rsvps || [], // Retain existing RSVPs
        status: selectedButton === "Update" ? "Accepted" : "Draft", // Set status based on action
        inviteType: visibility,
        creatorId: currentEvent?.creatorId || "admin", // Retain creatorId
        creatorName: currentEvent?.creatorName || "Admin", // Retain creatorName
        creatorType: currentEvent?.creatorType || "admin", // Retain creatorType
        time,
        location,
        image: currentEvent?.image || "", // Retain existing image
        numofAttendees: currentEvent?.numofAttendees || 0, // Retain existing attendee count
        targetGuests,
        stillAccepting: currentEvent?.stillAccepting || true, // Retain existing value
        needSponsorship: currentEvent?.needSponsorship || false, // Retain existing value
        donationDriveId: currentEvent?.donationDriveId || "", // Retain existing donation drive ID
      };
    
      try {
        if (selectedButton === "Finalize") {
          // Finalize the event
          const result = await addEvent(updatedEvent, true, false); // Finalize the event
          if (result.success) {
           // toastSuccess("Event updated successfully!");
            router.push("/admin-dashboard/organize-events");
          } else {
            setErrorMessage(result.message || "Failed to update event.");
          }
        } else if (selectedButton === "Update") {
          // Save as draft
          const result = await addEvent(updatedEvent, false, false); // Save as draft
          if (result.success) {
           // toastSuccess("Draft updated successfully!");
            router.push("/admin-dashboard/organize-events");
          } else {
            setErrorMessage(result.message || "Failed to save draft.");
          }
        }
      } catch (error) {
        console.error("Error updating event:", error);
        setErrorMessage("An error occurred while updating the event.");
      } finally {
        setIsSubmitting(false);
      }
    };

  // Show loading state while fetching event data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading event data...</div>
      </div>
    );
  }

  // Show error message if event not found
  if (!currentEvent && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">
          Event not found. Please check the event ID or return to the events list.
          <div className="mt-4">
            <button
              onClick={() => router.push("/admin-dashboard/organize-events")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <Breadcrumbs
        items={[
          { href: "/admin-dashboard", label: "Admin Dashboard" },
          { href: "/admin-dashboard/organize-events", label: "Events" },
          { label: "Edit Event" },
        ]}
      />
      
      <div className="text-3xl font-bold">Edit Event</div>
      
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
                new Date().toISOString().split("T")[0]
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

        {/* Submit Buttons */}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => router.push("/admin-dashboard/organize-events")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            <button
              type="submit"
              onClick={() => setButton("Update")}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Update
            </button>

            <button
              type="submit"
              onClick={() => setButton("Finalize")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formComplete}
            >
              {isSubmitting ? "Finalizing..." : "Finalize"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}