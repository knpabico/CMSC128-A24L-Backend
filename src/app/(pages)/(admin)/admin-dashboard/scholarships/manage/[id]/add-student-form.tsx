"use client";

import React from "react";
import { Asterisk, Trash2Icon } from "lucide-react";
import { handleYearInput } from "@/validation/auth/sign-up-form-schema";
import { StudentFormData } from "../../add/page";

export const AddStudent = ({
  formData,
  onUpdate,
  onRemove,
  type,
  index,
}: {
  formData: StudentFormData;
  onUpdate: (updatedData: StudentFormData) => void;
  onRemove: () => void;
  type: string;
  index: number;
}) => {
  // setFormData for each input field
  const setFormData = (field: string, value: string) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <div className="flex flex-col gap-5 ">
      {/* Form */}
      <div className="flex flex-col gap-3 bg-gray-100 px-3 py-5 rounded-lg my-2">
        <div className="flex w-full justify-between gap-3">
          {/* Student Name */}
          <div className="space-y-2 w-2/3">
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
          {!(type === "add" && index === 0) && (
            <button
              onClick={onRemove}
              className="flex justify-center gap-2 cursor-pointer"
            >
              <Trash2Icon className="hover:text-gray-500 text-gray-700" />
              {/* Remove */}
            </button>
          )}
        </div>
        <div className="flex w-full gap-3">
          {/* Address */}
          <div className="space-y-2 w-full">
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
          <div className="space-y-2 w-full">
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
        </div>
        <div className="flex flex-col gap-5">
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
        </div>
      </div>
    </div>
  );
};
