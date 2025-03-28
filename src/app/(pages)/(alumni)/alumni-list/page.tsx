"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus } from "@/models/models";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";
import { db } from "@/lib/firebase";
import { useState } from "react";




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
      const q = query(collection(db, "work_experience"), where("alumniId", "==", alumniId));
      const querySnapshot = await getDocs(q);

      const workExperienceList: WorkExperience[] = querySnapshot.docs.map((doc) => doc.data() as WorkExperience);
      setWorkExperience(workExperienceList);
    } catch (error) {
      console.error("Error fetching work experience:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Alums</h1>
      {isLoading && <h1>Loading</h1>}
      {alums.map((user: Alumnus, index: any) => (
        <div key={index} 
            className="bg-green-500 p-3 border-4 border-red-50"
            onClick={() => router.push(`/alumni-list/${user.alumniId}`)}>
          <Link
            href={`/alumni-list/${user.alumniId}`}
            className="text-blue-700 underline"
          >
            {user.firstName} {user.lastName}
          </Link>
          <h1>{user.email}</h1>
          <h2>{user.graduationYear}</h2>
          <h2>{user.fieldOfWork}</h2>
        </div>
      ))}
      {selectedAlumniId && (
        <div className="mt-4 p-4 border border-gray-300 bg-gray-100">
          <h2 className="text-lg font-bold">Work Experience</h2>
          {loading ? (
            <p>Loading...</p>
          ) : workExperience.length > 0 ? (
            <ul>
              {workExperience.map((exp, i) => (
                <li key={i}>
                  <h3 className="font-semibold">{exp.companyName}</h3>
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
  );
}
