"use client";
import { createContext, useContext } from "react";
import { useLoadScript } from "@react-google-maps/api";

const GoogleMapsContext = createContext<{ isLoaded: boolean }>({
  isLoaded: false,
});

export const GoogleMapsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCnDnz-yF_a-LiquYYONJcf1wFobK75tNk",
    libraries: ["places"],
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
