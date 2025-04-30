// components/ProposeEventForm.tsx
import React, { useState } from 'react';

interface ProposeEventFormProps {
  onSaveDraft: (eventDetails: EventDetails) => void;
  onSubmit: (eventDetails: EventDetails) => void;
  onCancel: () => void;
}

interface EventDetails {
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventDate: string;
}

const requiredSentence =
  'I certify on my honor that the proposed event details are accurate, correct, and complete.';

const ProposeEventForm: React.FC<ProposeEventFormProps> = ({
  onSaveDraft,
  onSubmit,
  onCancel,
}) => {
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    eventTitle: '',
    eventDescription: '',
    eventLocation: '',
    eventDate: '',
  });
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');

  const handleChange = (
    field: keyof EventDetails,
    value: string
  ): void => {
    setEventDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAsDraft = (): void => {
    onSaveDraft(eventDetails);
  };

  const handleProposeEvent = (): void => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (userInput !== requiredSentence) {
      alert('Please type the sentence exactly to confirm.');
      return;
    }

    onSubmit(eventDetails);
    setShowConfirmModal(false);
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
      <form onSubmit={(e) => e.preventDefault()} className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-30"
      >
        <h2 className="text-xl font-bold mb-4">Propose Event</h2>

        <InputField
          label="Event Title"
          value={eventDetails.eventTitle}
          onChange={(value) => handleChange('eventTitle', value)}
        />
        <InputField
          label="Event Description"
          value={eventDetails.eventDescription}
          onChange={(value) => handleChange('eventDescription', value)}
          isTextArea
        />
        <InputField
          label="Event Location"
          value={eventDetails.eventLocation}
          onChange={(value) => handleChange('eventLocation', value)}
        />
        <InputField
          label="Event Date"
          value={eventDetails.eventDate}
          onChange={(value) => handleChange('eventDate', value)}
          type="date"
        />

        <div className="flex justify-between">
          <button type="button" onClick={onCancel} className="text-gray-500">
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="bg-[#BFBFBF] text-white p-2 rounded-[22px]"
            >
              Save As Draft
            </button>
            <button
              type="button"
              onClick={handleProposeEvent}
              className="bg-[#0856BA] text-white p-2 rounded-[22px]"
            >
              Propose
            </button>
          </div>
        </div>

        {showConfirmModal && (
          <ConfirmationModal
            userInput={userInput}
            onUserInputChange={setUserInput}
            onCancel={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmSubmit}
          />
        )}
      </form>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  isTextArea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  isTextArea = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      )}
    </div>
  );
};

interface ConfirmationModalProps {
  userInput: string;
  onUserInputChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: (e: React.FormEvent) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  userInput,
  onUserInputChange,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-30">
      <form
        onSubmit={onConfirm}
        className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-40"
      >
        <h2 className="text-xl font-bold mb-4">
          Please certify on your honor that all the details are accurate, correct, and complete.
        </h2>
        <p className="text-gray-700 text-sm">
          As a sign of your confirmation, please type the following text in the text field below:
        </p>
        <p className="text-gray-900 text-left my-2">{requiredSentence}</p>
        <InputField
          label="Confirm Details"
          value={userInput}
          onChange={onUserInputChange}
        />
        <div className="flex justify-between">
          <button type="button" onClick={onCancel} className="text-gray-500">
            Cancel
          </button>
          <button type="submit" className="bg-[#0856BA] text-white p-2 rounded-[22px]">
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposeEventForm;
