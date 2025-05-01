"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus } from "@/models/models";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import missing Firebase functions
import { ChevronDown } from "lucide-react";

export default function Users() {
  const { alums, isLoading } = useAlums();
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const fetchWorkExperience = async (alumniId: string) => {
    setLoading(true);
    setSelectedAlumniId(alumniId);

    try {
      const q = query(
        collection(db, "work_experience"),
        where("alumniId", "==", alumniId)
      );
      const querySnapshot = await getDocs(q);

      const workExperienceList: WorkExperience[] = querySnapshot.docs.map(
        (doc) => doc.data() as WorkExperience
      );
      setWorkExperience(workExperienceList);
    } catch (error) {
      console.error("Error fetching work experience:", error);
    }

    setLoading(false);
  };

  // Mock data to demonstrate the layout
  const mockAlums = [
    {
      id: "1",
      name: "Dela Cruz, Juan",
      degrees: [
        { name: "BS Computer Science", year: "2026" },
        { name: "MS Computer Science", year: "2030" }
      ],
      interests: ["Cybersecurity", "AI", "Machine Learning", "Data Science"]
    },
    {
      id: "2",
      name: "Santos, Maria",
      degrees: [
        { name: "Master of Information Technology", year: "2025" },
        { name: "MS Computer Science", year: "2030" }
      ],
      interests: ["Web Development", "UX Design"]
    },
    {
      id: "3",
      name: "Reyes, Pedro",
      degrees: [
        { name: "BS Computer Science", year: "2026" },
        { name: "PhD Computer Science", year: "2035" }
      ],
      interests: ["Cloud Computing", "Blockchain", "IoT"]
    },
    {
      id: "4",
      name: "Garcia, Ana",
      degrees: [
        { name: "BS Computer Engineering", year: "2027" }
      ],
      interests: ["Robotics", "Embedded Systems"]
    },
    {
      id: "5",
      name: "Garcia, Ana",
      degrees: [
        { name: "BS Computer Engineering", year: "2027" }
      ],
      interests: ["Robotics", "Embedded Systems"]
    }
  ];

  return (
    <div>
      <div className="bg-amber-300 h-80">
        <div className="container mx-auto h-full flex items-center justify-center">
          <h1 className="text-3xl font-bold">Alumni Directory</h1>
        </div>
      </div>
      
      <div className="container mx-auto flex flex-col gap-5" style={{ padding: "30px 10% 10% 10%" }}>

        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Any Date</div>
            <ChevronDown size={20} />
          </div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Status</div>
            <ChevronDown size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockAlums.map((alum) => (
            <div 
              key={alum.id}
              className="bg-white shadow-md rounded-lg flex flex-col h-full overflow-hidden"
            >
              {/* Image placeholder - consistent aspect ratio */}
              <div className="bg-blue-400 w-full aspect-square flex items-center justify-center">
                <span className="text-white">Profile Photo</span>
              </div>
              
              {/* Content area with fixed structure */}
              <div className="p-5 flex flex-col gap-3 flex-grow">
                {/* Name - centered */}
                <div className="flex items-center justify-center font-bold text-[16px]">
                  {alum.name}
                </div>
              
                <hr className="text-gray-300"></hr>
                
                {/* Degree info - consistent table */}
                <div className="flex-grow text-[12px] px-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="border-b border-gray-300">
                        <tr>
                          <th className="text-left pb-2 pr-3 pt-1 font-medium text-gray-500">Degree</th>
                          <th className="text-center pb-2 pt-1 font-medium text-gray-500">Graduated</th>
                        </tr>
                      </thead>
                      <tbody className="pt-3"> {/* Add space above the tbody */}
                        {alum.degrees.map((degree, idx) => (
                          <tr key={idx} className={idx === 0 ? "pt-5" : "pt-0"}>
                            <td className="text-left py-1 pr-3 pt-2">{degree.name}</td>
                            <td className="text-center pt-2">{degree.year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <hr className="text-gray-300"></hr>
                
                {/* Interests - flexbox with wrapping */}
                <div className="flex flex-wrap gap-1 items-center justify-center">
                  {alum.interests.map((interest, idx) => (
                    <div 
                      key={idx}
                      className="text-xs px-2 py-1 rounded-md border border-blue-500 text-blue-500"
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Work Experience Section (when an alumni is selected) */}
        {selectedAlumniId && (
          <div className="mt-8 p-4 border border-gray-300 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Work Experience</h2>
            {loading ? (
              <p>Loading...</p>
            ) : workExperience.length > 0 ? (
              <ul className="space-y-4">
                {workExperience.map((exp, i) => (
                  <li key={i} className="p-3 bg-white shadow rounded">
                    <h3 className="font-semibold text-lg">{exp.companyName}</h3>
                    <p>Position: {exp.position}</p>
                    <p>Years: {exp.years}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No work experience found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}