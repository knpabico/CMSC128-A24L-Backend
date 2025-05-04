"use client"
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { WorkExperience } from "@/models/models";
import { useState,useRef } from "react";

interface MapComponentProps {
  workExperienceList: WorkExperience[];
}

const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapComponent: React.FC<MapComponentProps> = ({ workExperienceList }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: 14, lng: 120 });
  const [zoom, setZoom] = useState(3);

  if (!workExperienceList.length) {
    return <p>No present job markers available</p>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={(map) => (mapRef.current = map)}
    >
      {workExperienceList.map((experience, index) => (
        <MarkerF
          key={experience.workExperienceId}
          position={{ lat: experience.latitude, lng: experience.longitude }}
          onClick={() => {
            console.log(`Marker clicked: ${experience.company}`);
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default MapComponent;
