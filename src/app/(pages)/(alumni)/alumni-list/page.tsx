"use client";
import { useAlums } from "@/context/AlumContext";
import { db } from "@/lib/firebase";
import { Alumnus, Education, WorkExperience } from "@/models/models";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import missing Firebase functions
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Banner from "@/components/Banner";
import Image from "next/image";
export default function Users() {
  const { alums, isLoading } = useAlums();
  //const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [workExperience, setWorkExperience] = useState<
    Record<string, WorkExperience[]>
  >({});
  const [educationMapping, setEducationMapping] = useState<
    Record<string, Education[]>
  >({});
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // const fetchWorkExperience = async (alumniId: string) => {
  //   setLoading(true);
  //   setSelectedAlumniId(alumniId);

  //   try {
  //     const q = query(
  //       collection(db, "work_experience"),
  //       where("alumniId", "==", alumniId)
  //     );
  //     const querySnapshot = await getDocs(q);

  //     const workExperienceList: WorkExperience[] = querySnapshot.docs.map(
  //       (doc) => doc.data() as WorkExperience
  //     );
  //     setWorkExperience(workExperienceList);
  //   } catch (error) {
  //     console.error("Error fetching work experience:", error);
  //   }

  //   setLoading(false);
  // };

  useEffect(() => {
    //function to fetch work experience while being mapped to alumniId
    const mapWorkExperience = async () => {
      if (alums.length === 0) return;
      if (!alums) return;
      setLoading(true);

      try {
        //fetch educationList of alums
        const fetchWorkExperience = alums.map(async (alum: Alumnus) => {
          const alumniId = alum.alumniId;
          const q = query(
            collection(db, "work_experience"),
            where("alumniId", "==", alumniId)
          );

          const querySnapshot = await getDocs(q);

          const workExperienceList = querySnapshot.docs.map(
            (doc) => doc.data() as WorkExperience
          );

          return { alumniId, workExperienceList };
        });

        const workExp = await Promise.all(fetchWorkExperience);

        //intialize as empty work experience record
        const workExperienceMap: Record<string, WorkExperience[]> = {};
        //map each alumniId to each workExperienceList
        workExp.forEach((data) => {
          workExperienceMap[data.alumniId] = data.workExperienceList;
        });

        //set workExperience
        setWorkExperience(workExperienceMap);
      } catch (error) {
        console.error("Error fetching work experience:", error);

        return [];
      } finally {
        setLoading(false);
      }
    };

    mapWorkExperience();
  }, [alums]);

  useEffect(() => {
    //function to fetch education while being mapped to alumniId
    const mapEducation = async () => {
      if (alums.length === 0) return;
      if (!alums) return;
      setLoading(true);

      try {
        //fetch educationList of alums
        const fetchEducation = alums.map(async (alum: Alumnus) => {
          const alumniId = alum.alumniId;
          const q = query(
            collection(db, "education"),
            where("alumniId", "==", alumniId)
          );

          const querySnapshot = await getDocs(q);

          const educationList = querySnapshot.docs.map(
            (doc) => doc.data() as Education
          );

          return { alumniId, educationList };
        });

        const education = await Promise.all(fetchEducation);

        //intialize as empty education record
        const educationMap: Record<string, Education[]> = {};
        education.forEach((educ) => {
          educationMap[educ.alumniId] = educ.educationList;
        });

        //set educationMap
        setEducationMapping(educationMap);
      } catch (error) {
        console.error("Error fetching education:", error);

        return [];
      } finally {
        setLoading(false);
      }
    };

    mapEducation();
  }, [alums]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner
        title="Alumni Records"
        description="Meet your fellow alumni and learn about their UPLB degrees, graduation years, and shared interest in the field of Computer Science."
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <h1 className="text-xl font-semibold">Loading...</h1>
        </div>
      ) : (
        <div className=" mx-[10%] py-10 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl flex flex-wrap gap-3 px-5 py-3 items-center shadow-sm">
            <div className="text-sm text-blue-500">Filter:</div>
            <div className="px-3 py-1.5 rounded-full text-blue-500 flex gap-1 items-center justify-between text-sm cursor-pointer border-[2px] border-blue-500">
              <div>Degree</div>
              <ChevronDown size={16} />
            </div>
            <div className="px-3 py-1.5 rounded-full text-blue-500 flex gap-1 items-center justify-between text-sm cursor-pointer border-[2px] border-blue-500">
              <div>Year Graduated</div>
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Alumni Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {alums.map((alum, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image container with proper Next.js Image implementation */}
                <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                  {isLoading ? (
                    <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                  ) : alum.image ? (

                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      src={alum.image}
                      alt={`${alum.firstName} ${alum.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      src="/default-profile.jpg"
                      alt="Default alumni image"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Content area */}
                <div className="p-5 flex flex-col gap-3 flex-grow">
                  {/* Name - centered */}
                  <div className="flex items-center justify-center font-bold text-lg">
                    {alum.firstName} {alum.lastName}
                  </div>
                  {alum.contactPrivacy && (
                    <div
                      className="cursor-pointer text-center text-xs text-blue-500 underline"
                      onClick={() =>
                        window.open(
                          `https://mail.google.com/mail/?view=cm&fs=1&to=${alum.email}&su=Greetings, ${alum.firstName} ${alum.lastName}`,
                          "_blank"
                        )
                      }
                    >
                      Contact Me
                    </div>
                  )}
                  <hr className="border-gray-200" />

                  {/* Degree info */}
                  <div className="flex-grow text-sm px-1">
                    <table className="min-w-full">
                      <thead className="border-b border-gray-200">
                        <tr>
                          <th className="text-left pb-2 pr-3 font-medium text-gray-600">
                            Degree
                          </th>
                          <th className="text-center pb-2 font-medium text-gray-600">
                            Graduated
                          </th>
                        </tr>
                      </thead>
                      <tbody className="pt-2">
                        {educationMapping[alum.alumniId]?.map((degree, idx) => (
                          <tr key={idx}>
                            <td className="text-left py-1.5 pr-3">
                              {degree.major}
                            </td>
                            <td className="text-center py-1.5">
                              {degree.yearGraduated}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <hr className="border-gray-200" />

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1.5 items-center justify-center">
                    {alum.fieldOfInterest?.map((interest, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Work Experience Section */}
          {selectedAlumniId && (
            <div className="mt-6 p-5 border border-gray-200 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Work Experience</h2>
              {loading ? (
                <p className="text-gray-600">Loading work experience...</p>
              ) : workExperience[selectedAlumniId]?.length > 0 ? (
                <ul className="space-y-4">
                  {workExperience[selectedAlumniId].map((exp, i) => (
                    <li
                      key={i}
                      className="p-4 bg-gray-50 border border-gray-100 shadow-sm rounded"
                    >
                      <h3 className="font-semibold text-lg">{exp.company}</h3>
                      <p className="text-gray-700">Position: {exp.jobTitle}</p>
                      <p className="text-gray-700">
                        Years: {exp.startYear} - {exp.endYear || "Present"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No work experience found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
