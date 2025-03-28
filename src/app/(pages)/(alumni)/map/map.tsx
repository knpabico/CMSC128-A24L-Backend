"use client";

import { useState } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  PolylineF,
  useJsApiLoader,
  useLoadScript,
} from "@react-google-maps/api";
import { WorkExperience } from "@/models/models";
import { useGoogleMaps } from "@/context/GoogleMapsContext";

const containerStyle = {
  width: "100%",
  height: "500px",
};

export default function MapComponent({
  workExperienceList,
}: {
  workExperienceList: WorkExperience[];
}) {
  const { isLoaded } = useGoogleMaps();
  const [selectedPlace, setSelectedPlace] = useState<WorkExperience | null>(
    null
  );
  const [center, setCenter] = useState({ lat: 14, lng: 120 });
  const [zoom, setZoom] = useState(3);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  //this function is to smoothen the transition for the meantime
  const smoothZoom = (targetZoom: number) => {
    let currentZoom = map?.getZoom() ?? 3;
    const zoomInterval = setInterval(() => {
      if (currentZoom < targetZoom) {
        map?.setZoom(++currentZoom);
      } else {
        clearInterval(zoomInterval);
      }
    }, 400);
  };

  //function to extract the polylinepath
  const polylinepath = workExperienceList.map((experience) => ({
    lat: experience.latitude,
    lng: experience.longitude,
  }));

  if (!isLoaded) return <p>Loading Map...</p>;

  console.log("HI there");

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={(map) => setMap(map)}
    >
      {workExperienceList?.map((experience) => (
        <MarkerF
          key={`${experience.location}-${experience.latitude}-${experience.longitude}`}
          position={{ lat: experience.latitude, lng: experience.longitude }}
          animation={
            activeMarker === experience.location
              ? window.google.maps.Animation.BOUNCE
              : undefined
          }
          onClick={() => {
            setSelectedPlace(experience);
            setCenter({ lat: experience.latitude, lng: experience.longitude });
            setZoom(10);
            setActiveMarker(experience.location);
            if (map) {
              map.panTo({
                lat: experience.latitude,
                lng: experience.longitude,
              });
              smoothZoom(20);
            }
          }}
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
          options={{
            pixelOffset: {
              width: 0,
              height: -40,
            },
          }}
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
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
