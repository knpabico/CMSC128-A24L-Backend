"use client";

import { useState, useEffect, useRef } from "react";
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
  onLocationClick: (lat: number, lng: number, index: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
  activeMarker: number | null;
}


const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapComponent: React.FC<MapComponentProps> = ({
  workExperienceList,
  onLocationClick,
  selectedLocation,
  activeMarker,
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useGoogleMaps();
  const [center, setCenter] = useState({ lat: 14, lng: 120 });
  const [zoom, setZoom] = useState(0);
  const [animatedMarker, setAnimatedMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<WorkExperience | null>(
    null
  );

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      animateMapAndMarker(selectedLocation);
      smoothZoom(20);
    }
  }, [selectedLocation]);

  const animateMapAndMarker = (destination: { lat: number; lng: number }) => {
    if (!mapRef.current) return;

    let start = animatedMarker || center;
    let step = 0;
    const totalSteps = 15;
    const intervalTime = 8;

    function move() {
      if (step <= totalSteps) {
        const progress = step / totalSteps;
        const interpolatedLat =
          start.lat + (destination.lat - start.lat) * progress;
        const interpolatedLng =
          start.lng + (destination.lng - start.lng) * progress;

        setAnimatedMarker({ lat: interpolatedLat, lng: interpolatedLng });
        mapRef.current?.panTo({ lat: interpolatedLat, lng: interpolatedLng });

        step++;
        setTimeout(move, intervalTime);
      } else {
        setAnimatedMarker(destination);
        mapRef.current?.panTo(destination);
      }
    }

    move();
  };

  //sorts ecxperiencelist
  const sortExperienceList = (
    experienceList: WorkExperience[]
  ): WorkExperience[] => {
    return [...experienceList].sort((a, b) => a.startDate - b.startDate);
  };

  const smoothZoom = (targetZoom: number) => {
    if (!mapRef.current) return;
    let currentZoom = mapRef.current.getZoom() ?? 3;
    const zoomInterval = setInterval(() => {
      if (currentZoom < targetZoom) {
        mapRef.current?.setZoom(++currentZoom);
      } else if (currentZoom > targetZoom) {
        mapRef.current?.setZoom(--currentZoom);
      } else {
        clearInterval(zoomInterval);
      }
    }, 120);
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedLocation || center}
      zoom={zoom}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        restriction: {
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180,
          },
          strictBounds: true,
        },
        minZoom: 2,
        maxZoom: 20,
        gestureHandling: "greedy",
      }}
    >
      {workExperienceList?.map((experience, index) => (
        <MarkerF
          key={index}
          position={{ lat: experience.latitude, lng: experience.longitude }}
          onClick={() => {
            onLocationClick(experience.latitude, experience.longitude, index);
            setSelectedPlace(experience);
          }}
          animation={
            activeMarker === index ? window.google.maps.Animation.BOUNCE : null
          }
        />
      ))}

      {selectedPlace && (
        <InfoWindowF
          position={{
            lat: selectedPlace.latitude,
            lng: selectedPlace.longitude,
          }}
          zIndex={2}
          options={{
            pixelOffset: {
              width: 0,
              height: -40,
            },
          }}
          onCloseClick={() => {
            console.log("Closing InfoWindowF...");
            setSelectedPlace(null);
          }}
        >
          <div>
            <h1 className="font-bold text-xl md:text-2xl  relative z-10">
              {selectedPlace.company}
            </h1>
            <h1 className="font-bold text-xl md:text-2xl  relative z-10">
              Location: {selectedPlace.location}
            </h1>
            <p className="font-normal text-sm relative z-10 my-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, in
              minima! Praesentium perferendis exercitationem enim blanditiis
              earum id aperiam autem, molestias, unde impedit natus? Eveniet
              eaque molestiae delectus quo repudiandae?
            </p>
          </div>
        </InfoWindowF>
      )}

      <PolylineF
        path={sortExperienceList(workExperienceList).map((exp) => ({
          lat: exp.latitude,
          lng: exp.longitude,
        }))}
        options={{
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          // geodesic: true,
        }}
      />
    </GoogleMap>
  );
};

export default MapComponent;
