"use client";

import React, { useState } from "react";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";

interface ProposeEventFormProps
{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setEventTitle: (title: string) => void;
  description: string;
  setEventDescription: (description: string) => void;
  date: string;
  setEventDate: (date: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (e: React.FormEvent, categories: string[], visibility: string, creatorId: string | undefined, creatorName: string | undefined, creatorType: string) => void;
  alumInfo: any;
}

const ProposeEventForm: React.FC<ProposeEventFormProps> = (
{
  isOpen,
  onClose,
  title,
  setEventTitle,
  description,
  setEventDescription,
  date,
  setEventDate,
  handleImageChange,
  handleSave,
  alumInfo,
}) => 
{
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmForm, setConfirmForm] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  const requiredSentence = "I certify on my honor that the proposed event details are accurate, correct, and complete.";
  const formComplete = title.trim() !== "" && description.trim() !== "" && date.trim() !== "";

  if (!isOpen) return null;

  return (
    <>
      {/* Event Proposal Modal */}
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
        <form
          className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-30"
        >
          <h2 className="text-xl font-bold mb-4">Propose Event</h2>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setEventTitle(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <textarea
            placeholder="Event Description"
            value={description}
            onChange={(e) => setEventDescription(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <Button onClick={() => setIsModalOpen(true)}>
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
          <input
            type="date"
            value={date}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
            min={
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            } // Events must be scheduled at least one week in advance
          />

          <label htmlFor="image-upload" className="text-[14px] cursor-pointer px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Upload Photo
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500"
            >
              Cancel
            </button>
            <div className="flex gap-2 my-5">
              <button
                type="submit"
                className="bg-[#BFBFBF] text-white p-2 rounded-[22px]"
              >
                Save As Draft
              </button>
              <button
                type="button"
                onClick={() =>
                {
                  const form = document.querySelector("form");
                  if (form && form.checkValidity())
                  {
                    setConfirmForm(true);
                  } 
                  
                  else
                  {
                    form?.reportValidity(); // Show browser's validation tooltips
                  }
                }}
                className="bg-[#0856BA] text-white p-3 rounded-[25px]"
              >
                Propose
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-30">
          <form
            onSubmit={(e) =>
            {
              e.preventDefault();
              if (userInput !== requiredSentence)
              {
                alert("Please type the sentence exactly to confirm.");
                return;
              }
              
              // Add creator information to the event
              handleSave(e, [], "all", alumInfo?.alumniId, alumInfo?.firstName, "alumni");
              onClose();
              setConfirmForm(false);
            }}
            className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-40"
          >
            <h2 className="text-xl text-justify font-bold mb-4">Please certify on your honor that all the details are accurate, correct, and complete.</h2>

            <div className="mb-4">
              <p className="text-[16px] text-gray-900 font-semibold">
                As a sign of your confirmation, please type the following text in the text field below:
              </p>
            </div>
            <div className="border-l-4 border-[#0856BA] pl-4">
              <p className="text-[14px] text-gray-700 text-left my-4">
                  I certify on my honor that the proposed event details are accurate, correct, and complete.
              </p>
            </div>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onPaste={(e) => e.preventDefault()} // Prevent paste
              placeholder="Type the sentence here"
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setConfirmForm(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#0856BA] text-white p-2 w-1/3 rounded-[30px]"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ProposeEventForm;