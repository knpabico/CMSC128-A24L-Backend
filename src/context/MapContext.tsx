"use client";


import { createContext, useState, ReactNode } from "react";

interface MapContextType {
  selectedLocation: { lat: number; lng: number } | null;
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void;
}

export const MapContext = createContext<MapContextType | undefined>(undefined);

export default function MapProvider({ children }: { children: ReactNode }) {
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <MapContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </MapContext.Provider>
  );
}
