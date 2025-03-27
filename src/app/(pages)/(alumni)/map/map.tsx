"use client";

import { useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { WorkExperience } from "@/models/models";

const containerStyle = {
  width: "100%",
  height: "500px",
};

export default function MapComponent({ workExperienceList }: { workExperienceList: WorkExperience[] }) {
  const [selectedPlace, setSelectedPlace] = useState<WorkExperience | null>(null);
  const [center, setCenter] = useState({ lat: 14, lng: 120 });
  const [zoom, setZoom] = useState(3);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCnDnz-yF_a-LiquYYONJcf1wFobK75tNk",
  });

  if (!isLoaded) return <p>Loading Map...</p>;

  console.log("HI there");

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
      {workExperienceList?.map((experience) => (
        <MarkerF
          key={`${experience.location}-${experience.latitude}-${experience.longitude}`}
          position={{ lat: experience.latitude, lng: experience.longitude }}
          onClick={() => {
            setSelectedPlace(experience);
            setCenter({ lat: experience.latitude, lng: experience.longitude });
            setZoom(10);
          }}
        />
      ))}
      {selectedPlace && (
        <InfoWindowF
          position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
          zIndex={1}
          options={{
            pixelOffset: {
              width: 0,
              height: -40,
            },
          }}
          onCloseClick={() => {
            setSelectedPlace(null);
            setZoom(3);
          }}
        >
          <div>
            <h3>{selectedPlace.location}</h3>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
