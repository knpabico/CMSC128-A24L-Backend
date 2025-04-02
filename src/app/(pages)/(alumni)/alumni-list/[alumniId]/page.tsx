"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience } from "@/models/models";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import MapComponent from "../../map/map";




export default function AlumPage() {
  const { alums, loading: alumsloading } = useAlums();
  const { loading: authloading } = useAuth();
  const { fetchWorkExperience, isLoading: workLoading } = useWorkExperience();
  const params = useParams();
  const [selectedAlumWorkExperience, setSelectedAlumWorkExperience] = useState<WorkExperience[]>([]);
  const [showWorkExperience, setShowWorkExperience] = useState(false);
  

  const alumniId = params?.alumniId;
  const [alum, setAlum] = useState<Alumnus | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeMarker, setActiveMarker] = useState(0);

  
  
  useEffect(() => {
    if (alumniId) {
      const foundAlum = alums.find((alum: Alumnus) => String(alum.alumniId) === String(alumniId)) || null;
      setAlum(foundAlum);
      
      fetchWorkExperience(alumniId).then((data) => {
        console.log("Fetched Work Experience inside AlumPage:", data);
        setSelectedAlumWorkExperience(data);
      });
    }
  }, [alumniId, alums]);
  
  if (alumsloading || authloading) return <h1>Loading...</h1>;
  if (!alum) return <h1>Alum not found...</h1>;
  console.log("fetch experiences:", selectedAlumWorkExperience);
  
  const handleLocationClick = (lat: number, lng: number, index: number) => {
    setSelectedLocation({ lat, lng });
    setActiveMarker(index); // Make marker bounce
    setTimeout(() => setActiveMarker(null), 2000); // Stop bouncing after 2 seconds
  };

//handles the clicked button see exp
  const handleFetchWorkExperience = async () => {
    if (alumniId) {
      const workExperience = await fetchWorkExperience(alumniId);
      setSelectedAlumWorkExperience(workExperience);
      setShowWorkExperience(true);
    }
  };

  return (
    <div>
      <h1>{alum.name}</h1>
      
      <h1>{alum.companyName}</h1>
      <h1>{alum.address}</h1>
      <h1>{alum.age}</h1>
      <h1>{alum.birthDate.toDate().toISOString().slice(0,10).replaceAll("-", "/")}</h1>
      <h1>{alum.fieldOfWork}</h1>
      <h1>{alum.companyName}</h1>
      <h1>{alum.jobTitle}</h1>
      <h1>{alum.address}</h1>
      <h1>{alum.affiliation}</h1>

      <h1>Working Experience</h1>
      
      <button onClick={handleFetchWorkExperience} disabled={workLoading}>
        {workLoading ? "Loading..." : "See Working Experience"}
      </button>
 
      {showWorkExperience && (
      <>
      <MapComponent
        workExperienceList={selectedAlumWorkExperience}
        onLocationClick={handleLocationClick}
        selectedLocation={selectedLocation}
        activeMarker={activeMarker}
      />
        {selectedAlumWorkExperience.length > 0 ? (
          selectedAlumWorkExperience.map((work, index) => (
            <div key={index} onClick={() => handleLocationClick(work.latitude, work.longitude, index)}>
              <p>Company Name: {work.company}</p>
              <p>Location: {work.location}</p>
              <h2>
            Duration:{" "}
            {work.startingDate.toDate().toISOString().slice(0, 10).replaceAll("-", "/")}
            {" - "}
            {work.endingDate.toDate().toISOString().slice(0, 10).replaceAll("-", "/")}
          </h2>
            </div>
          ))
        ) : (
          <p>No work experience found.</p>
        )}
      </>
    )}

    </div>
  );
}
