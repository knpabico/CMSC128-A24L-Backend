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

export const Career = ({ index, form }: { index: number; form: any }) => {
  //dynamic fields for career

  const [endYear, setEndYear] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleEndYear = (value: boolean) => {
    setEndYear(value);
  };

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

    //manually update values of location, latitude, presentJob
    form.setValue(`career.${index}.location`, address);
    form.setValue(`career.${index}.latitude`, lat);
    form.setValue(`career.${index}.longitude`, lng);
  };

  return (
    <div className="bg-gray-200 rounded-xl py-5 p-4">
      {/* career form field */}

      <div className="grid grid-cols-12 gap-x-4 gap-y-3">
        {/* industry */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name={`career.${index}.industry`}
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
            name={`career.${index}.jobTitle`}
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
            name={`career.${index}.company`}
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
              name={`career.${index}.startYear`}
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="text-xs font-light">
                    Start Year
                  </FormLabel>
                  <FormControl>
                    <Input
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
            {endYear === false && (
              <FormField
                control={form.control}
                name={`career.${index}.endYear`}
                render={({ field }) => (
                  <FormItem className="gap-0">
                    <FormLabel className="text-xs font-light">
                      End Year
                    </FormLabel>
                    <FormControl>
                      <Input
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
            {endYear === true && (
              <div>
                <p className="text-xs font-light">End Year</p>
                <p className="cursor-not-allowed text-sm bg-gray-300 py-[7.2px] px-2.5 border border-gray-500 w-full text-gray-500 rounded-md">
                  Present
                </p>
              </div>
            )}
          </div>

          <div>
            {/* checkbox field for identifying whether it is up to present or not*/}
            <FormField
              control={form.control}
              name={`career.${index}.presentJob`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2 justify-start items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value: boolean) => {
                          field.onChange(value);
                          handleEndYear(value);
                        }}
                        className="bg-white"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-light">
                      Present job?
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

      </div>

      {/*kinopya lang 'yung implementation sa add-work-experience */}
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
      </div>

      {endYear === true && (
        <div className="col-span-12">
          <p className="text-xs font-light pt-3">Proof of Employment</p>
          <AlumDocumentUpload index={index} form={form}></AlumDocumentUpload>
        </div>
      )}
    </div>
  );
};
