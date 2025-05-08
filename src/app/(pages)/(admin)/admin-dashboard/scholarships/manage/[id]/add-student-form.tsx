"use client";

import React from "react";
import { Asterisk } from "lucide-react";
import { handleYearInput } from "@/validation/auth/sign-up-form-schema";

export const AddStudent = ({
  formData,
  onUpdate,
  onRemove,
  type,
  index,
}: {
  formData: any;
  onUpdate: (updatedData: any) => void;
  onRemove: () => void;
  type: string;
  index: number;
}) => {
  // setFormData for each input field
  const setFormData = (field: string, value: string) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Add Student</div>
          {!(type === "add" && index === 0) && (
            <button
              onClick={onRemove}
              className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {/* Form */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-5">
          {/* Student Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={16} className="text-red-600" /> Student Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Student name"
              value={formData.name}
              onChange={(e) => setFormData("name", e.target.value)}
              required
            />
          </div>

          {/* Student Number */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={16} className="text-red-600" /> Student Number
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="20XX-XXXX"
              pattern="^(20\d\d|2100)-\d{5}$"
              value={formData.studentNumber}
              onChange={(e) => setFormData("studentNumber", e.target.value)}
              required
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={16} className="text-red-600" /> Age
            </label>
            <input
              onKeyDown={handleYearInput}
              min={18}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData("age", e.target.value)}
              required
            />
          </div>

          {/* Short Background */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={16} className="text-red-600" /> Short Background
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Short Background"
              value={formData.shortBackground}
              onChange={(e) => setFormData("shortBackground", e.target.value)}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={16} className="text-red-600" /> Address
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData("address", e.target.value)}
              required
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={16} className="text-red-600" /> Email Address
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Email address"
              value={formData.emailAddress}
              onChange={(e) => setFormData("emailAddress", e.target.value)}
              required
            />
          </div>

          {/* Background */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={16} className="text-red-600" /> Background
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Background"
              value={formData.background}
              onChange={(e) => setFormData("background", e.target.value)}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};
