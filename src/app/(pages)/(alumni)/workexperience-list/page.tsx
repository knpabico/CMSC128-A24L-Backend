"use client";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";
import { useState } from "react";
import MapComponent from "../map/map";

export default function WorkExperiencePage() {
  const { userWorkExperience, isLoading } = useWorkExperience();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationClick = (lat: number, lng: number) => {
    console.log("Location clicked:", { lat, lng });
    setSelectedLocation({ lat, lng });
  };
  

  return (
    <div>
      <MapComponent 
        workExperienceList={userWorkExperience} 
        onLocationClick={handleLocationClick}  
        selectedLocation={selectedLocation} 
      />

      <h1>Work Experience (ALL)</h1>
      {isLoading && <h1>Loading</h1>}
      {userWorkExperience.map((workExperience: WorkExperience, index: number) => (
        <div key={index} className="p-1" onClick={() => handleLocationClick(workExperience.latitude, workExperience.longitude)}>  
          <h1>Company: {workExperience.company}</h1>
          <h1>Latitude: {workExperience.latitude}</h1>
          <h1>Longitude: {workExperience.longitude}</h1>
          <h2>Location: {workExperience.location}</h2>
          <h2>
            Duration:{" "}
            {workExperience.startingDate.toDate().toISOString().slice(0, 10).replaceAll("-", "/")}
            {" - "}
            {workExperience.endingDate.toDate().toISOString().slice(0, 10).replaceAll("-", "/")}
          </h2>
        </div>
      ))}
    </div>
  );
}