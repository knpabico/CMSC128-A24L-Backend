"use client";

// components
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button, TextField, Typography, Snackbar } from "@mui/material";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import GoogleMapsModal from "@/app/(pages)/(alumni)/google-maps/map";
import { AlumDocumentUpload } from "./career_proof";
import { MapPin, PencilIcon } from "lucide-react";
import { handleYearInput } from "@/validation/auth/sign-up-form-schema";

export const Career = ({
  index,
  form,
  type,
}: {
  index: number;
  form: any;
  type: "career" | "currentJob";
}) => {
  //dynamic fields for career

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState({
    location: "",
    latitude: 14.25,
    longitude: 121.25,
  });

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      location: address,
      latitude: lat,
      longitude: lng,
    });

    //manually update values of location, latitude, longitude
    form.setValue(`${type}.${index}.location`, address);
    form.setValue(`${type}.${index}.latitude`, lat);
    form.setValue(`${type}.${index}.longitude`, lng);
  };

  return (
    <div className="bg-gray-200 rounded-xl py-5 p-4">
      {/* career form field */}

      <div className="grid grid-cols-12 gap-x-4 gap-y-3">
        {/* industry */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name={`${type}.${index}.industry`}
            render={({ field }) => (
              <FormItem className="gap-0">
                <FormLabel className="text-xs font-light">Industry</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Cybersecurity"
                    {...field}
                    className="bg-white border border-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* job title */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name={`${type}.${index}.jobTitle`}
            render={({ field }) => (
              <FormItem className="gap-0">
                <FormLabel className="text-xs font-light">Job Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Programmer"
                    {...field}
                    className="bg-white border border-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-12">
          {/* university */}
          <FormField
            control={form.control}
            name={`${type}.${index}.company`}
            render={({ field }) => (
              <FormItem className="gap-0">
                <FormLabel className="text-xs font-light">
                  Company/Organization
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Company X"
                    {...field}
                    className="bg-white border border-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-6">
          <div>
            {/* start year */}
            <FormField
              control={form.control}
              name={`${type}.${index}.startYear`}
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="text-xs font-light">
                    Start Year
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1980}
                      onKeyDown={handleYearInput}
                      placeholder="2020"
                      {...field}
                      className="bg-white border border-gray-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs font-light pt-3">Location</p>
        </div>

        <div key={index} className="col-span-6 space-y-1">
          <div>
            {/* end year */}
            {type === "career" && (
              <FormField
                control={form.control}
                name={`${type}.${index}.endYear`}
                render={({ field }) => (
                  <FormItem className="gap-0">
                    <FormLabel className="text-xs font-light">
                      End Year
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1980}
                        onKeyDown={handleYearInput}
                        placeholder={"2025"}
                        {...field}
                        className="bg-white border border-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {type === "currentJob" && (
              <div>
                <p className="text-xs font-light">End Year</p>
                <p className="cursor-not-allowed text-sm bg-gray-300 py-[7.2px] px-2.5 border border-gray-500 w-full text-gray-500 rounded-md">
                  Present
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-12">
        {selectedLocation.location !== "" && (
          <div>
            <p className="text-sm bg-gray-300 py-[7.2px] px-2.5 border border-gray-500 w-full text-gray-500 rounded-md">
              {selectedLocation.location}
            </p>
          </div>
        )}
        <button
          className="flex items-center space-x-2 cursor-pointer pt-2"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <p className="text-[#0856ba]">
            {selectedLocation.location !== "" ? (
              <PencilIcon className="w-4" />
            ) : (
              <MapPin className="w-4" />
            )}
          </p>
          <p className="text-[#0856ba] text-sm hover:underline">
            {selectedLocation.location !== "" ? "Edit" : "Enter"} location
          </p>
        </button>
        <GoogleMapsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialAddress={selectedLocation.location}
          initialLatitude={selectedLocation.latitude}
          initialLongitude={selectedLocation.longitude}
          onSave={handleLocationSave}
        />

        {/*display validation message for location*/}
        {selectedLocation.location === "" && type === "career" && (
          <>
            {form.formState.errors.career?.[index]?.location && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.career[index].location.message}
              </p>
            )}
          </>
        )}

        {selectedLocation.location === "" && type === "currentJob" && (
          <>
            {form.formState.errors.currentJob?.[index]?.location && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.currentJob[index].location.message}
              </p>
            )}
          </>
        )}
      </div>

      {type === "currentJob" && (
        <div className="col-span-12">
          <p className="text-xs font-light pt-3">Proof of Employment</p>
          <AlumDocumentUpload index={index} form={form}></AlumDocumentUpload>
        </div>
      )}
    </div>
  );
};
