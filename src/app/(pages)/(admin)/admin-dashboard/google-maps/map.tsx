"use client";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { WorkExperience, Alumnus } from "@/models/models";
import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog";import { useAlums } from "@/context/AlumContext";


interface MapComponentProps {
  workExperienceList: WorkExperience[];
}

const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapComponent: React.FC<MapComponentProps> = ({
  workExperienceList,
}) => {
  const { alums } = useAlums();

  const mapRef = useRef<google.maps.Map | null>(null);
  const [center] = useState({ lat: 14, lng: 120 });
  const [zoom] = useState(3);

  const [selectedWork, setSelectedWork] = useState<WorkExperience | null>(null);
  const [selectedAlum, setSelectedAlum] = useState<Alumnus | null>(null);


  const handleMarkerClick = (experience: WorkExperience) => {
    const alum = alums.find((a:Alumnus) => a.alumniId === experience.alumniId);
    setSelectedWork(experience);
    setSelectedAlum(alum ?? null);
  };

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={(map) => (mapRef.current = map)}
      >
        {workExperienceList.map((experience) => (
          <MarkerF
            key={experience.workExperienceId}
            position={{ lat: experience.latitude, lng: experience.longitude }}
            onClick={() => handleMarkerClick(experience)}
          />
        ))}
      </GoogleMap>

      {selectedWork && selectedAlum && (
        <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
        <DialogContent className="max-w-md w-full p-6 rounded-2xl shadow-xl text-left">
            <DialogHeader>
            <DialogTitle>{selectedWork.company}</DialogTitle>
            <DialogDescription>
                Details of the alumnus currently working at this company.
            </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
            <p>
                <strong>Job Title:</strong> {selectedWork.jobTitle}
            </p>
            <p>
                <strong>Alumnus:</strong> {selectedAlum.firstName} {selectedAlum.lastName}
            </p>
            <p>
                <strong>Email:</strong> {selectedAlum.email}
            </p>
            </div>
        </DialogContent>
        </Dialog>


      )}
    </>
  );
};

export default MapComponent;
