"use client";

import { Asterisk, ChevronRight, Pencil } from "lucide-react";

export default function SampleAdminPage() {

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
        <div>
          Add Donation Drives
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Add Donation Drive
          </div>
        </div>
      </div>

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
        <div>
          Donation Drive Name
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Donation Drive Name
          </div>
          <div className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300">
           <Pencil size={18} /> Edit Donation Drive
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          <div className="">
            <form className="flex flex-col gap-5">
              {/* Basic text input with individual state */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600"/> Donation Drive Name
                </label>
                <input
                  id="name"
                  type="text"
                  // value={name}
                  // onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your name"
                  required
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
                  // value={formData.bio}
                  // onChange={handleFormChange}
                  // rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
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
                  // value={formData.role}
                  // onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  // checked={formData.notifications}
                  // onChange={handleFormChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm">
                  Checkbox
                </label>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center w-30 gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
              >
                Submit
              </button>

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
                      // checked={formData.subscription === "monthly"}
                      // onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                      // checked={formData.subscription === "yearly"}
                      // onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                      // checked={formData.subscription === "lifetime"}
                      // onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="subscription-lifetime" className="ml-2 block text-sm">
                      Lifetime ($299.99)
                    </label>
                  </div>
                </div>
              </div>

            </form>

          </div>
        </div>
        
        
      </div>
      <div className="bg-[var(--primary-white)] fixed bottom-0 rounded-t-2xl p-4 flex justify-end" style={{ width: "calc(96% - 256px)", boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)' }}>
        <button
          type="submit"
          className="flex items-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}