"use client";
import { useAlums } from "@/context/AlumContext";
import { db } from "@/lib/firebase";
import {
  Affiliation,
  Alumnus,
  Education,
  WorkExperience,
} from "@/models/models";
import { collection, getDocs, query, where } from "firebase/firestore"; // Import missing Firebase functions
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Banner from "@/components/Banner";
import Image from "next/image";
import { set, string } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Slider, Typography } from "@mui/material";

//for filtering
const fieldOfWorkFilters = [
  "Software Development",
  "Web Development",
  "Mobile App Development",
  "Artificial Intelligence/Machine Learning",
  "Data Science & Analytics",
  "Cloud Computing",
  "Cybersecurity",
  "Game Development",
  "Blockchain & Cryptocurrency",
  "Internet of Things (IoT)",
  "Robotics & Automation",
  "Bioinformatics",
  "FinTech (Financial Technology)",
  "EdTech (Educational Technology)",
  "HealthTech/MedTech",
  "E-commerce",
  "Telecommunications",
  "IT Consulting",
  "Computer Hardware & Semiconductors",
  "Network Infrastructure",
  "DevOps & System Administration",
  "Database Administration",
  "Computer Vision",
  "Natural Language Processing",
  "Virtual Reality/Augmented Reality",
  "Quantum Computing",
  "Digital Marketing & SEO",
  "Business Intelligence",
  "Enterprise Resource Planning (ERP)",
  "User Experience/Interface Design",
  "Computer Graphics & Animation",
  "High-Performance Computing",
  "Geographic Information Systems (GIS)",
  "Computer Forensics",
  "IT Support & Services",
  "Information Systems Management",
  "Human-Computer Interaction",
  "Embedded Systems",
  "Computer Engineering",
  "Aerospace Computing",
  "Defense & Military Technology",
  "Smart Cities & Urban Technologies",
  "Information Security",
  "Big Data",
  "Digital Twins Technology",
  "Computer-Aided Design (CAD)",
  "Social Media & Digital Platforms",
  "Supply Chain Technology",
  "Speech Recognition & Processing",
  "Computational Science",
  "Other",
];

const attainment = ["Bachelor's", "Master's", "PhD"];
const attainmentRecord = {
  bachelors: "Bachelor's",
  masters: "Master's",
  doctoral: "PhD",
};
export default function Users() {
  const { alums, isLoading } = useAlums();
  const [filteredAlums, setFilteredAlums] = useState<Alumnus[]>([]);
  //const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [workExperience, setWorkExperience] = useState<
    Record<string, WorkExperience[]>
  >({});
  const [affiliationMapping, setAffiliationMapping] = useState<
    Record<string, Affiliation[]>
  >({});
  const [educationMapping, setEducationMapping] = useState<
    Record<string, Education[]>
  >({});
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  //for field of work filter
  const [showFieldOfWorkFilter, setShowFieldOfWorkFilter] = useState(false);
  const [fieldOfWorkFilter, setFieldOfWorkFilter] = useState<string[]>([]);

  //for attainment filter
  const [showAttainmentFilter, setShowAttainmentFilter] = useState(false);
  const [attainmentFilter, setAttainmentFilter] = useState<string[]>([]);

  //for graduation year filter
  const [showGraduationYearFilter, setShowGraduationYearFilter] =
    useState(false);
  const [graduationYearFilter, setGraduationYearFilter] = useState<
    [number, number]
  >([1980, new Date().getFullYear()]);

  const fieldOfWorkContainerRef = useRef<HTMLDivElement>(null);
  const attainmentContainerRef = useRef<HTMLDivElement>(null);
  const graduationYearContainerRef = useRef<HTMLDivElement>(null);

  const [countryFilter, setCountryFilter] = useState("");
  const [affiliationFilter, setAffiliationFilter] = useState("");

  const [openFilter, setOpenFilter] = useState<
    null | "fieldOfWork" | "attainment" | "yearGraduated"
  >(null);

  const handleFieldOfWorkFilter = (fieldOfWork: string) => {
    setFieldOfWorkFilter((current) => {
      //if a field of work filter is clicked when it is already selected, it will be removed
      if (current.includes(fieldOfWork)) {
        return current.filter(
          (existingFieldOfWork) => existingFieldOfWork !== fieldOfWork
        );
        //selected field of work will be added to the list of selected filters
      } else {
        return [...current, fieldOfWork];
      }
    });
  };

  const handleAttainmentFilter = (Attainment: string) => {
    setAttainmentFilter((current) => {
      //if an attainment filter is clicked when it is already selected, it will be removed
      if (current.includes(Attainment)) {
        return current.filter(
          (existingAttainment) => existingAttainment !== Attainment
        );
        //selected attainment will be added to the list of selected filters
      } else {
        return [...current, Attainment];
      }
    });
  };

  //getting updated attainmentMapping when there are changes
  const attainmentMapping = useMemo(() => {
    const attainment = Object.values(educationMapping).flat();
    const attainmentMap = new Map<string, typeof attainment>();

    for (const educ of attainment) {
      if (!attainmentMap.has(educ.alumniId)) {
        attainmentMap.set(educ.alumniId, []);
      }
      attainmentMap.get(educ.alumniId).push(educ);
    }

    return attainmentMap;
  }, [educationMapping]);

  useEffect(() => {
    //remove current user from alumni list
    let filteredAlumni = alums.filter(
      (alum: Alumnus) => alum.alumniId !== user?.uid
    );

    //sort alphabetically by first name
    filteredAlumni = filteredAlumni.sort((a: Alumnus, b: Alumnus) =>
      a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
    );

    //country search filter
    if (countryFilter) {
      filteredAlumni = filteredAlumni.filter((alum: Alumnus) => {
        // Replace 'yourArrayAttribute' with the actual attribute name
        if (alum.address && alum.address.length > 0) {
          return alum.address[0]
            .toLowerCase()
            .includes(countryFilter.toLowerCase());
        }
        return false;
      });
    }

    //affiliation search filter
    if (affiliationFilter) {
      filteredAlumni = filteredAlumni.filter((alum: Alumnus) => {
        // Get the affiliations for this alumnus using their id
        const affiliations = affiliationMapping[alum.alumniId];

        // Check if affiliations exist and search through affiliationName
        if (affiliations && affiliations.length > 0) {
          return affiliations.some((affiliation: Affiliation) =>
            affiliation.affiliationName
              .toLowerCase()
              .includes(affiliationFilter.toLowerCase())
          );
        }
        return false;
      });
    }

    //filter alums based on selected field of work/s
    if (fieldOfWorkFilter.length > 0) {
      filteredAlumni = filteredAlumni.filter((alum: Alumnus) =>
        alum.fieldOfInterest?.some((field) => fieldOfWorkFilter.includes(field))
      );
    }

    //filter alums based on educational attainment
    if (attainmentFilter.length > 0) {
      filteredAlumni = filteredAlumni.filter((alum: Alumnus) => {
        const education = attainmentMapping.get(alum.alumniId) || [];
        return education.some((educ) =>
          attainmentFilter.includes(attainmentRecord[educ.type])
        );
      });
    }

    //graduation year filter on educational attainment
    if (graduationYearFilter.length == 2) {
      filteredAlumni = filteredAlumni.filter((alum: Alumnus) => {
        const education = attainmentMapping.get(alum.alumniId) || [];

        const hasMatchingYear = education.some((educ) => {
          const gradYear = parseInt(educ.yearGraduated);

          if (isNaN(gradYear)) return false;

          const inRange =
            gradYear >= graduationYearFilter[0] &&
            gradYear <= graduationYearFilter[1];

          return inRange;
        });

        return hasMatchingYear;
      });
    }
    //sort alphabetically by first name
    filteredAlumni = filteredAlumni.sort((a: Alumnus, b: Alumnus) =>
      a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
    );

    setFilteredAlums(filteredAlumni);
  }, [
    alums,
    fieldOfWorkFilter,
    attainmentFilter,
    attainmentMapping,
    graduationYearFilter,
    countryFilter,
    affiliationFilter,
  ]);

  //close filter dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const clickedOutside =
        (!fieldOfWorkContainerRef.current ||
          !fieldOfWorkContainerRef.current.contains(target)) &&
        (!attainmentContainerRef.current ||
          !attainmentContainerRef.current.contains(target)) &&
        (!graduationYearContainerRef.current ||
          !graduationYearContainerRef.current.contains(target));

      if (clickedOutside) {
        // setShowFieldOfWorkFilter(false);
        // setShowAttainmentFilter(false);
        // setShowGraduationYearFilter(false);
        setOpenFilter(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    //function to fetch affiliation while being mapped to alumniId
    const mapAffiliation = async () => {
      if (alums.length === 0) return;
      if (!alums) return;
      setLoading(true);

      try {
        //fetch educationList of alums
        const fetchAffiliation = alums.map(async (alum: Alumnus) => {
          const alumniId = alum.alumniId;
          const q = query(
            collection(db, "affiliation"),
            where("alumniId", "==", alumniId)
          );

          const querySnapshot = await getDocs(q);

          const affiliationList = querySnapshot.docs.map(
            (doc) => doc.data() as Affiliation
          );

          return { alumniId, affiliationList };
        });

        const affil = await Promise.all(fetchAffiliation);

        //intialize as empty affiliation record
        const affiliationMap: Record<string, Affiliation[]> = {};
        //map each alumniId to each affiliation
        affil.forEach((data) => {
          affiliationMap[data.alumniId] = data.affiliationList;
        });

        //set workExperience
        setAffiliationMapping(affiliationMap);
      } catch (error) {
        return [];
      } finally {
        setLoading(false);
      }
    };

    mapAffiliation();
  }, [alums]);

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
      // Use ALL alums, not filteredAlums
      if (alums.length === 0) return;
      if (!alums) return;
      setLoading(true);

      try {
        //fetch educationList of ALL alums
        const fetchEducation = alums.map(async (alum: Alumnus) => {
          const alumniId = alum.alumniId;
          const q = query(
            collection(db, "education"),
            where("alumniId", "==", alumniId)
          );

          const querySnapshot = await getDocs(q);

          let educationList = querySnapshot.docs.map(
            (doc) => doc.data() as Education
          );

          //sort educationList by yearGraduated in descending order
          educationList = educationList.sort(
            (a: Education, b: Education) =>
              Number(b.yearGraduated) - Number(a.yearGraduated)
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
        return [];
      } finally {
        setLoading(false);
      }
    };

    mapEducation();
  }, [alums]); // Chang

  return (
    <div className="min-h-screen bg-gray-100">
      <title>Alumni List | ICS-ARMS</title>
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
          <div className="bg-white rounded-xl flex flex-wrap gap-3 p-3 items-center shadow-sm">
            <div className="text-sm font-medium">Filter by:</div>

            {/*FIELD OF WORK FILTER*/}
            <div
              ref={fieldOfWorkContainerRef}
              className="relative inline-block bg-gray-200 px-3 py-1.5 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors"
            >
              <button
                onClick={() => {
                  //setShowFieldOfWorkFilter(!showFieldOfWorkFilter);
                  setOpenFilter(
                    openFilter === "fieldOfWork" ? null : "fieldOfWork"
                  );
                }}
                className="flex items-center gap-1 w-full"
              >
                Field of Work
                <ChevronDown size={16} />
              </button>

              {openFilter === "fieldOfWork" && (
                <div className="absolute z-30 mt-2 w-[1200px] bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Field of Work</h3>
                    <div className="grid grid-cols-4 gap-1">
                      {fieldOfWorkFilters.map((field) => (
                        <div
                          key={field}
                          className="items-start gap-2 break-words"
                        >
                          <input
                            type="checkbox"
                            id={field}
                            checked={fieldOfWorkFilter.includes(field)}
                            onChange={() => handleFieldOfWorkFilter(field)}
                            className="rounded border-gray-300 mt-1"
                          />
                          <label
                            htmlFor={field}
                            className="text-sm cursor-pointer"
                          >
                            {field}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end items-center mt-2">
                      {fieldOfWorkFilter.length > 0 && (
                        <button
                          className="text-red-700 rounded text-sm"
                          onClick={() => {
                            setFieldOfWorkFilter([]);
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/*attainment filter*/}
            <div className="relative inline-block" ref={attainmentContainerRef}>
              <div className="bg-gray-200 px-3 py-1.5 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors">
                <button
                  onClick={() => {
                    //setShowAttainmentFilter(!showAttainmentFilter);
                    setOpenFilter(
                      openFilter === "attainment" ? null : "attainment"
                    );
                  }}
                  className="flex items-center gap-1 w-full"
                >
                  Attainment
                  <ChevronDown size={16} />
                </button>
              </div>

              {openFilter === "attainment" && (
                <div className="absolute mt-2 bg-white p-4 rounded shadow-lg z-10 border border-gray-200 w-60">
                  <h3 className="font-semibold mb-2">Attainment</h3>
                  <div className="space-y-2">
                    {attainment.map((filter) => (
                      <div key={filter} className="flex items-center">
                        <input
                          type="checkbox"
                          id={filter}
                          checked={attainmentFilter.includes(filter)}
                          onChange={() => handleAttainmentFilter(filter)}
                          className="mr-2"
                        />
                        <label htmlFor={filter}>{filter}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Graduation Year Filter */}
            <div
              className="relative inline-block"
              ref={graduationYearContainerRef}
            >
              <div className="bg-gray-200 px-3 py-1.5 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors">
                <button
                  onClick={() => {
                    //setShowGraduationYearFilter(!showGraduationYearFilter);
                    setOpenFilter(
                      openFilter === "yearGraduated" ? null : "yearGraduated"
                    );
                  }}
                  className="flex items-center gap-1 w-full"
                >
                  Graduation Year
                  <ChevronDown size={16} />
                </button>
              </div>

              {openFilter === "yearGraduated" && (
                <div className="absolute mt-2 bg-white p-4 rounded shadow-lg z-10 border border-gray-200 w-72">
                  <h3 className="font-semibold mb-2">Graduation Year</h3>
                  <div className="space-y-4">
                    <Slider
                      value={graduationYearFilter}
                      onChange={(_, newValue) => {
                        const typedValue = newValue as [number, number];
                        setGraduationYearFilter(typedValue);
                      }}
                      valueLabelDisplay="auto"
                      min={1980}
                      max={new Date().getFullYear()}
                      step={1}
                    />

                    <div className="text-sm text-center text-gray-700">
                      Showing alumni from{" "}
                      <strong>{graduationYearFilter[0]}</strong> to{" "}
                      <strong>{graduationYearFilter[1]}</strong>
                    </div>

                    <div className="flex justify-end">
                      <button
                        className="text-red-700 rounded text-sm"
                        onClick={() =>
                          setGraduationYearFilter([
                            1980,
                            new Date().getFullYear(),
                          ])
                        }
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-200 px-3 py-1.5 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors">
              <input
                type="text"
                placeholder="Search by Country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              />
            </div>
            <div className="bg-gray-200 px-3 py-1.5 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors">
              <input
                type="text"
                placeholder="Search by Affiliation"
                value={affiliationFilter}
                onChange={(e) => setAffiliationFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Alumni Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAlums.map((alum, index) => (
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
                      className="cursor-pointer text-center text-xs text-[var(--primary-blue)] underline"
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
                        className="text-xs px-2.5 py-1 rounded-md border border-[var(--primary-blue)] text-[var(--primary-blue)] hover:bg-blue-50 transition-colors"
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
