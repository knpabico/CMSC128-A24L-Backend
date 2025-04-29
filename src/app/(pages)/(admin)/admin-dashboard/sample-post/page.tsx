"use client";

import { Asterisk, ChevronRight, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SampleAdminPage() {
  const [isSticky, setIsSticky] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const buttonsContainerRef = useRef(null);
  const placeholderRef = useRef(null);

  useEffect(() => {
    if (!placeholderRef.current || !isEditing) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the buttons container is visible (intersecting), it's not sticky
        // When it's not visible (not intersecting), make it sticky
        setIsSticky(!entry.isIntersecting);
      },
      { 
        threshold: 0,
        rootMargin: "0px" // Adjust if needed
      }
    );

    observer.observe(placeholderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setIsSticky(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>
          Manage Donation Drives
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          Donation Drive Name
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Donation Drive Name
          </div>
          {!isEditing && (
            <div 
              onClick={handleEditClick}
              className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
            >
              <Pencil size={18} /> Edit Donation Drive
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4 h-200">
          <div className="flex flex-col gap-5">
            {/* Basic text input with individual state */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Donation Drive Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your name"
                required
                disabled={!isEditing}
              />
            </div>

            {/* Textarea for longer text */}
            <div className="space-y-2">
              <label htmlFor="bio" className="block text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Description
              </label>
              <textarea
                id="bio"
                name="bio"
                // rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself"
                disabled={!isEditing}
              />
            </div>

            {/* Select dropdown */}
            <div className="space-y-2 ">
              <label htmlFor="role" className="block text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isEditing}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
              <input
                id="notifications"
                name="notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={!isEditing}
              />
              <label htmlFor="notifications" className="ml-2 block text-sm">
                Checkbox
              </label>
            </div>


            {/* Radio buttons for subscription plan - horizontal layout */}
            <div className="space-y-2">
              <p className="block text-sm font-medium">Subscription Plan</p>
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <input
                    id="subscription-monthly"
                    name="subscription"
                    type="radio"
                    value="monthly"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={!isEditing}
                  />
                  <label htmlFor="subscription-monthly" className="ml-2 block text-sm">
                    Monthly ($9.99)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="subscription-yearly"
                    name="subscription"
                    type="radio"
                    value="yearly"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={!isEditing}
                  />
                  <label htmlFor="subscription-yearly" className="ml-2 block text-sm">
                    Yearly ($99.99)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="subscription-lifetime"
                    name="subscription"
                    type="radio"
                    value="lifetime"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={!isEditing}
                  />
                  <label htmlFor="subscription-lifetime" className="ml-2 block text-sm">
                    Lifetime ($299.99)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Original buttons container - will be visible when in viewport and editing is active */}
        {isEditing && (
          <div ref={placeholderRef} className="bg-white rounded-2xl p-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
      
      {/* Fixed buttons container that appears when original is out of view and editing is active */}
      {isSticky && isEditing && (
        <div className="bg-[var(--primary-white)] fixed bottom-0 rounded-t-2xl gap-2 p-4 flex justify-end" style={{ width: "calc(96% - 256px)", boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)' }}>
          <button
            type="button"
            onClick={handleCancelClick}
            className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}