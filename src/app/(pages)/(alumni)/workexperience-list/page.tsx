"use client";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";
import MapComponent from "../map/map";

export default function WorkExperiencePage() {
  const { allWorkExperience, isLoading } = useWorkExperience();
  console.log(isLoading);
  console.log(isLoading);
  return (
    <div>
      <MapComponent workExperienceList={allWorkExperience} />
      <h1>Work Experience (ALL)</h1>
      {isLoading && <h1>Loading</h1>}
      {console.log("Hi",allWorkExperience)}
      {/* {!isLoading && <h1>Done Loading</h1>} */}
      {isLoading && <h1>Loading</h1>}
      {console.log("Hi",allWorkExperience)}
      {/* {!isLoading && <h1>Done Loading</h1>} */}
      {allWorkExperience.map((workExperience: WorkExperience, index: any) => (
        <div key={index} className="p-1">
          <h1>Company: {workExperience.company}</h1>
          <h1>Latitude: {workExperience.latitude}</h1>
          <h1>Longitude: {workExperience.longitude}</h1>
          <h1>Latitude: {workExperience.latitude}</h1>
          <h1>Longitude: {workExperience.longitude}</h1>
          <h2>Location: {workExperience.location}</h2>
          <h2>
            Duration:{" "}
            {workExperience.startingDate
              .toDate()
              .toISOString()
              .slice(0, 10)
              .replaceAll("-", "/")}
            {" - "}
            {workExperience.endingDate
              .toDate()
              .toISOString()
              .slice(0, 10)
              .replaceAll("-", "/")}
          </h2>
          <h2> </h2>
        </div>
      ))}
    </div>
  );
}
