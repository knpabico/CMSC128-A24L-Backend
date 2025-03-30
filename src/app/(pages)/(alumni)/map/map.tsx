"use client";

import { useState, useEffect } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  PolylineF,
} from "@react-google-maps/api";
import { WorkExperience } from "@/models/models";
import { useGoogleMaps } from "@/context/GoogleMapsContext";

interface MapComponentProps {
  workExperienceList: WorkExperience[];
  onLocationClick: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapComponent: React.FC<MapComponentProps> = ({ workExperienceList, onLocationClick, selectedLocation }) => {
  const { isLoaded } = useGoogleMaps();
  const [selectedPlace, setSelectedPlace] = useState<WorkExperience | null>(null);
  const [center, setCenter] = useState({ lat: 14, lng: 120 });
  const [zoom, setZoom] = useState(3);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (selectedLocation && map) {
      console.log("Centering on:", selectedLocation); // Debugging log
      map.panTo(selectedLocation); // Move map to selected location
      map.setZoom(10); // Optional: Zoom in on selected location
    }
  }, [selectedLocation, map]);

  const smoothZoom = (targetZoom: number) => {
    let currentZoom = map?.getZoom() ?? 3;
    const zoomInterval = setInterval(() => {
      if (currentZoom < targetZoom) {
        map?.setZoom(++currentZoom);
      } else if (currentZoom > targetZoom) {
        map?.setZoom(--currentZoom);
      } else {
        clearInterval(zoomInterval);
      }
    }, 400);
  };

  const polylinepath = workExperienceList.map((experience) => ({
    lat: experience.latitude,
    lng: experience.longitude,
  }));

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedLocation || center} 
        zoom={zoom}
        onLoad={(map) => setMap(map)}
      >
      {workExperienceList?.map((experience) => (
        <MarkerF
          key={experience.location}
          position={{ lat: experience.latitude, lng: experience.longitude }}
          onClick={() => onLocationClick(experience.latitude, experience.longitude)}
        />
      ))}

      <PolylineF
        path={polylinepath}
        options={{
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 4,
          geodesic: true,
        }}
      />
      
      {selectedPlace && (
        <InfoWindowF
          position={{
            lat: selectedPlace.latitude,
            lng: selectedPlace.longitude,
          }}
          zIndex={1}
          onCloseClick={() => {
            setSelectedPlace(null);
            setActiveMarker(null);
            if (map) {
              map.setZoom(3);
            }
          }}
        >
          <div>
            <h3>{selectedPlace.location}</h3>
            <div className="text relative z-50">
              <h1 className="font-bold text-xl md:text-3xl relative">
                Company Name: {selectedPlace.company}
              </h1>
              <p className="font-normal text-base relative my-4">
                Description: Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </p>
            </div>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default MapComponent;
