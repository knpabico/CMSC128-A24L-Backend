"use client";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";
import MyMap from '../map/page';

export default function WorkExperiencePage() {
  const { allWorkExperience, isLoading } = useWorkExperience();
  
  //gets the positions of the places n the previous job
  // const [position, setPosition] = useState([]);
  

  return (
    <div>
      <h1>Work Experience (ALL)</h1>
      <MyMap position={[0,0]} zoom={2} />
      {allWorkExperience.map((workExperience: WorkExperience, index: any) => (
        <div key={index} className="p-1">
          
          <h1>Company: {workExperience.company}</h1>
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
