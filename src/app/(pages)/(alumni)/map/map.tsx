"use client";

import { useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { WorkExperience } from "@/models/models";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: 14, lng: 120 };

export default function MapComponent({ workExperienceList }: { workExperienceList: WorkExperience[] }) {
  const [selectedPlace, setSelectedPlace] = useState<string | undefined>(undefined);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCnDnz-yF_a-LiquYYONJcf1wFobK75tNk",
  });

  if (!isLoaded) return <p>Loading Map...</p>;

  console.log("HI there")

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={3}>
      {workExperienceList?.map((experience) => (
        <MarkerF
          key={`${experience.location}-${experience.latitude}-${experience.longitude}`}
          position={{ lat: experience.latitude, lng: experience.longitude }}
          onClick={() =>
            setSelectedPlace(
              experience.location === selectedPlace ? undefined : experience.location
            )
          }
          position={{lat:experience.latitude, lng:experience.longitude}}
        />

      ))}
    </GoogleMap>
  );
}
