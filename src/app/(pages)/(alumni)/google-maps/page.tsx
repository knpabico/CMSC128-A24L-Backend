"use client";
import { useState } from "react";
import GoogleMapsModal from "./map";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    address: "",
    latitude: 14.25,
    longitude: 121.25,
  });

  const handleLocationSave = (address: string, lat: number, lng: number) => {
    setSelectedLocation({
      address,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <div className="w-full h-screen flex items-center justify-center ">
      <div className="flex flex-col w-full items-center gap-y-4">
        <span className="text-6xl text-gray-700 font-bold">
          Google Maps Implementation
        </span>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Choose Location
        </button>

        {selectedLocation.address && (
          <div className="flex flex-col items-center mt-4">
            <span className="text-2xl font-semibold text-gray-700">
              Selected Location
            </span>
            <div className="mt-2 p-4 bg-white rounded-lg shadow-md">
              <p className="text-xl">
                <strong>Address:</strong> {selectedLocation.address}
              </p>
              <p className="text-xl">
                <strong>Latitude:</strong>{" "}
                {selectedLocation.latitude.toFixed(4)}
              </p>
              <p className="text-xl">
                <strong>Longitude:</strong>{" "}
                {selectedLocation.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        )}

        <GoogleMapsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialAddress={selectedLocation.address}
          initialLatitude={selectedLocation.latitude}
          initialLongitude={selectedLocation.longitude}
          onSave={handleLocationSave}
        />
      </div>
    </div>
  );
}
