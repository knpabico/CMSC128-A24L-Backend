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
    <>
      {/* career form field */}

      <div className="grid grid-cols-12 gap-4">
        {/* industry */}
        <div className="col-span-4">
          <FormField
            control={form.control}
            name={`career.${index}.industry`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="Industry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* job title */}
        <div className="col-span-8">
          <FormField
            control={form.control}
            name={`career.${index}.jobTitle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Job Title" {...field} />
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
              <FormItem>
                <FormLabel>Company/Organization</FormLabel>
                <FormControl>
                  <Input placeholder="Company/Organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-6">
          {/* start year */}
          <FormField
            control={form.control}
            name={`career.${index}.startYear`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Year</FormLabel>
                <FormControl>
                  <Input placeholder="Start Year" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div key={index} className="col-span-6">
          {/* end year */}
          {endYear === false && (
            <FormField
              control={form.control}
              name={`career.${index}.endYear`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Year</FormLabel>
                  <FormControl>
                    <Input placeholder={"End Year"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="col-span-6">
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
                    />
                  </FormControl>
                  <FormLabel className="inline">Present job?</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/*kinopya lang 'yung implementation sa add-work-experience */}
        <div className="col-span-6">
          <Typography>Please specify location</Typography>
          {selectedLocation.location !== "" && (
            <div>
              <Typography>{selectedLocation.location}</Typography>
            </div>
          )}
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>
            {selectedLocation.location !== "" ? "Edit" : "Enter"} location
          </Button>
          <GoogleMapsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialAddress={selectedLocation.location}
            initialLatitude={selectedLocation.latitude}
            initialLongitude={selectedLocation.longitude}
            onSave={handleLocationSave}
          />
        </div>
      </div>
    </>
  );
};
