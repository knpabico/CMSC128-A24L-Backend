"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience } from "@/models/models";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import MapComponentA from "@/components/ui/map";
import {
  MapPin,
  Cake,
  PersonStanding,
  Heart,
  GraduationCap,
  BookOpenText,
  Award,
  UsersRound,
  Briefcase,
  XIcon,
  ChevronRight,
  File,
} from "lucide-react";
import Image from "next/image";
import { Education } from "@/models/models";
import { useEducation } from "@/context/EducationContext";
import { Affiliation } from "@/models/models";
import { useAffiliation } from "@/context/AffiliationContext";
import { Dialog, DialogContent } from "@mui/material";
import Link from "next/link";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { formatDate } from "@/utils/formatDate";
import MapComponent from "../../google-maps/map";

export default function AlumPage() {
  const { alums, loading: alumsloading } = useAlums();
  const { loading: authloading } = useAuth();
  const params = useParams();
  const alumniId = params?.alumniId;
  const [alum, setAlum] = useState<Alumnus | null>(null);
  const { allEducation } = useEducation();
  const [edu, setEdu] = useState<Education[]>([]);
  const { allAffiliation } = useAffiliation();
  const [affil, setAffil] = useState<Affiliation[]>([]);
  const { allWorkExperience } = useWorkExperience();
  const [work, setWork] = useState<WorkExperience[]>([]);
  const [isMapOpenArray, setIsMapOpenArray] = useState<boolean[]>([]);
  const { isLoaded } = useGoogleMaps();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
const [activeMarker, setActiveMarker] = useState<number | null>(null);


  

  const calculateAge = (birthDate: Date) => {
    //current date
    const current_date = new Date();
    const current_day = current_date.getDate();
    const current_month = current_date.getMonth();
    const current_year = current_date.getFullYear();

    //birthDate
    const day = birthDate.getDate();
    const month = birthDate.getMonth();
    const year = birthDate.getFullYear();

    //student number

    let age = current_year - year;
    //if current day < day or current month < month
    if (
      (current_month === month && current_day < day) ||
      current_month < month
    ) {
      age = age - 1; //subtract 1 from age
    }

    return age;
  };

  useEffect(() => {
    if (alumniId) {
      const foundAlum =
        alums.find(
          (alum: Alumnus) => String(alum.alumniId) === String(alumniId)
        ) || null;
      setAlum(foundAlum);

      const foundEdu = allEducation.filter(
        (edu: Education) => String(edu.alumniId) === String(alumniId)
      );
      setEdu(foundEdu);

      const foundAffil = allAffiliation.filter(
        (affil: Affiliation) => String(affil.alumniId) === String(alumniId)
      );
      setAffil(foundAffil);

      const foundWork = allWorkExperience.filter(
        (work: WorkExperience) => String(work.alumniId) === String(alumniId)
      );
      setWork(foundWork);
    }
  }, [alumniId, alums, allEducation, allAffiliation, allWorkExperience]);

  useEffect(() => {
    setIsMapOpenArray(new Array(work.length).fill(false));
  }, [work]);

  if (alumsloading || authloading) return <h1>Loading...</h1>;
  if (!alum) return <h1>Alum not found...</h1>;

  const openMap = (index: number) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = true;
    setIsMapOpenArray(newIsMapOpenArray);
  };
  const closeMap = (index: number) => {
    const newIsMapOpenArray = [...isMapOpenArray];
    newIsMapOpenArray[index] = false;
    setIsMapOpenArray(newIsMapOpenArray);
  };

  return (
    <div>
      <div className="space-y-10 md:sticky md:top-8 z-[100] relative">
        <div className="flex items-center gap-2 w-full top-0 left-0">
          <Link href="/admin-dashboard" className="cursor-pointer">
            Home
          </Link>
          <div>
            <ChevronRight size={15} />
          </div>
          <div
            onClick={() => {
              window.history.back();
            }}
            className="cursor-pointer"
          >
            Manage Users
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div>
            {alum.lastName}, {alum.firstName}{" "}
            {alum.middleName !== "" ? alum.middleName : ""}
          </div>
        </div>
      </div>

      <div className="flex space-x-10 m-5 mt-15">
        <div className="w-content h-max space-x-15 md:sticky md:top-29">
          <div className="w-75 bg-white rounded-xl shadow-md p-10 flex flex-col justify-center items-center gap-5 max-h-fit">
            <div className="relative group bg-gray-200 w-50 h-50 flex justify-center items-center mb-2 rounded-full">
              {alum?.image ? (
                <Image
                  src={alum.image}
                  alt="Alumnus Image"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <span className="text-white"></span>
              )}
            </div>
            <div>
              <p className="text-xl font-bold text-center break-words max-w-md">
                {alum.lastName}, {alum.firstName}{" "}
                {alum.middleName !== "" ? alum.middleName : ""}
              </p>
              <p className="text-center">{alum.email}</p>
              <p className="text-center">{alum.studentNumber}</p>
            </div>
            <div className="space-x-5">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  alum.activeStatus
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {alum.activeStatus ? "Active" : "Inactive"}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  alum.regStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : alum.regStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {alum.regStatus.charAt(0).toUpperCase() +
                  alum.regStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-x-15 w-full">
          <div className="top-0 w-full fixed h-20 bg-[#eaeaea]"></div>
          <div className="space-y-8">
            <div className="space-y-5 bg-white p-5 rounded-lg">
              <div>
                <p className="text-xl font-bold w-full pb-1.5">Personal</p>
                <hr className="text-gray-300"></hr>
              </div>

              <div className="grid grid-cols-10 gap-8">
                <div className="col-span-5">
                  <div className="flex space-x-3 items-center">
                    <Cake />
                    <p className="font-semibold">
                      Birthday <span className="font-light">(YYYY/MM/DD)</span>
                    </p>
                  </div>
                  <p className="pl-9 pt-3">
                    {alum.birthDate
                      ? formatDate(alum.birthDate).replaceAll("-", "/")
                      : ""}
                  </p>
                </div>
                <div className="col-span-5">
                  <div className="flex space-x-3 items-center">
                    <PersonStanding />
                    <p className="font-semibold">Current Age</p>
                  </div>
                  <p className="pl-9 pt-3">
                    {calculateAge(
                      alum.birthDate instanceof Date
                        ? alum.birthDate
                        : alum.birthDate &&
                          typeof alum.birthDate === "object" &&
                          alum.birthDate !== null &&
                          "toDate" in alum.birthDate
                        ? (alum.birthDate as { toDate(): Date }).toDate()
                        : new Date() // Provide a default date instead of null
                    )}
                  </p>
                </div>
                <div className="col-span-5">
                  <div className="flex space-x-3 items-center">
                    <MapPin />
                    <p className="font-semibold">Current Location</p>
                  </div>
                  <p className="pl-9 pt-3">
                    {alum.address[1]}, {alum.address[2]}, {alum.address[0]}
                  </p>
                </div>
                <div className="col-span-5">
                  <div className="flex space-x-3 items-center">
                    <Heart />
                    <p className="font-semibold">Fields of Interest</p>
                  </div>
                  <p className="pl-9 pt-3">
                    {alum.fieldOfInterest.length > 0 ? (
                      alum.fieldOfInterest.map((f, i) => (
                        <span key={i}>
                          {f}
                          {i < alum.fieldOfInterest.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      <span>None</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white p-5 rounded-lg">
              <div>
                <p className="text-xl font-bold w-full pb-1.5">Education</p>
                <hr className="text-gray-300"></hr>
              </div>

              <div className="grid grid-cols-10 gap-8">
                <div className="col-span-10">
                  <div className="flex space-x-3 items-center">
                    <GraduationCap />
                    <p className="font-semibold">Bachelor&apos;s Degree</p>
                  </div>
                  {edu.filter(
                    (edu: { type: string }) => edu.type === "bachelors"
                  ).length > 0 ? (
                    <table className="w-full text-left border-separate pl-9 pt-3">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-1 w-3/8">Degree Program</th>
                          <th className="py-1 w-4/8 px-3">University</th>
                          <th className="py-1 w-1/9">Graduated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {edu
                          .filter(
                            (edu: { type: string }) => edu.type === "bachelors"
                          )
                          .sort((a, b) => {
                            // Convert to string before comparison to avoid type errors
                            const yearA = String(b.yearGraduated);
                            const yearB = String(a.yearGraduated);
                            return yearA.localeCompare(yearB);
                          })
                          .map((edu: Education, index: number) => (
                            <tr key={index}>
                              <td className="py-1">{edu.major}</td>
                              <td className="py-1 px-3">{edu.university}</td>
                              <td className="py-1">{edu.yearGraduated}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="pl-9 pt-3">None</p>
                  )}
                </div>

                <div className="col-span-10">
                  <div className="flex space-x-3 items-center">
                    <BookOpenText />
                    <p className="font-semibold">Master&apos;s Degree</p>
                  </div>
                  {edu.filter((edu: { type: string }) => edu.type === "masters")
                    .length > 0 ? (
                    <table className="w-full text-left border-separate pl-9 pt-3">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-1 w-3/8">Degree Program</th>
                          <th className="py-1 w-4/8 px-3">University</th>
                          <th className="py-1 w-1/9">Graduated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {edu
                          .filter(
                            (edu: { type: string }) => edu.type === "masters"
                          )
                          .sort((a, b) => {
                            // Convert to string before comparison to avoid type errors
                            const yearA = String(b.yearGraduated);
                            const yearB = String(a.yearGraduated);
                            return yearA.localeCompare(yearB);
                          })
                          .map((edu: Education, index: number) => (
                            <tr key={index}>
                              <td className="py-1">{edu.major}</td>
                              <td className="py-1 px-3">{edu.university}</td>
                              <td className="py-1">{edu.yearGraduated}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="pl-9 pt-3">None</p>
                  )}
                </div>

                <div className="col-span-10">
                  <div className="flex space-x-3 items-center">
                    <Award />
                    <p className="font-semibold">Doctoral Degree</p>
                  </div>
                  {edu.filter(
                    (edu: { type: string }) => edu.type === "doctoral"
                  ).length > 0 ? (
                    <table className="w-full text-left border-separate pl-9 pt-3">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-1 w-3/8">Degree Program</th>
                          <th className="py-1 w-4/8 px-3">University</th>
                          <th className="py-1 w-1/9">Graduated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {edu
                          .filter(
                            (edu: { type: string }) => edu.type === "doctoral"
                          )
                          .sort((a, b) => {
                            // Convert to string before comparison to avoid type errors
                            const yearA = String(b.yearGraduated);
                            const yearB = String(a.yearGraduated);
                            return yearA.localeCompare(yearB);
                          })
                          .map((edu: Education, index: number) => (
                            <tr key={index}>
                              <td className="py-1">{edu.major}</td>
                              <td className="py-1 px-3">{edu.university}</td>
                              <td className="py-1">{edu.yearGraduated}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="pl-9 pt-3">None</p>
                  )}
                </div>

                <div className="col-span-10">
                  <div className="flex space-x-3 items-center">
                    <UsersRound />
                    <p className="font-semibold">Affiliations</p>
                  </div>
                  {affil.length > 0 ? (
                    <table className="w-full text-left border-separate pl-9 pt-3">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-1 w-3/8">Affiliation</th>
                          <th className="py-1 w-4/8 px-3">University</th>
                          <th className="py-1 w-1/9">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {affil
                          .sort((a, b) => {
                            // Convert to string before comparison to avoid type errors
                            const yearA = String(b.yearJoined);
                            const yearB = String(a.yearJoined);
                            return yearA.localeCompare(yearB);
                          })
                          .map((affil: Affiliation, index: number) => (
                            <tr key={index}>
                              <td className="py-1">{affil.affiliationName}</td>
                              <td className="py-1 px-3">{affil.university}</td>
                              <td className="py-1">{affil.yearJoined}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="pl-9 pt-3">None</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white p-5 rounded-lg">
              <div>
                <p className="text-xl font-bold w-full pb-1.5">Career</p>
                <hr className="text-gray-300"></hr>
              </div>

              <div className="col-span-10">
                <div className="flex space-x-3 items-center">
                  <Briefcase />
                  <p className="font-semibold">Work Experience</p>
                </div>
                {work.length > 0 ? (
                  <table className="w-full text-left border-separate pl-9 pt-3">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-1 w-3/13">Job Title</th>
                        <th className="py-1 w-3/13 px-3">Company</th>
                        <th className="py-1 w-3/13">Industry</th>
                        <th className="py-1 w-3/13 px-3">From - To</th>
                        <th className="py-1 w-1/13">Loc</th>
                        <th className="py-1 w-1/13 pl-1">Proof</th>
                      </tr>
                    </thead>
                    <tbody>
                      {work
                        .sort((a, b) => {
                          const currentYear = new Date().getFullYear();
                          const startA =
                            a.endYear === "present"
                              ? 100000
                              : parseInt(a.endYear);
                          const startB =
                            b.endYear === "present"
                              ? 100000
                              : parseInt(b.endYear);
                          return startB - startA;
                        })
                        .map((w: WorkExperience, index: number) => (
                          <tr key={index}>
                            <td className="py-1">{w.jobTitle}</td>
                            <td className="py-1 px-3">{w.company}</td>
                            <td className="py-1">{w.industry}</td>
                            <td className="py-1 px-3">
                              {w.startYear} - {w.endYear}
                            </td>
                            <td className="py-1">
                              <MapPin
                                className="text-[#3675c5] cursor-pointer"
                                onClick={() => openMap(index)}
                              />
                            </td>
                            <td className="py-1 pl-1">
                              {w.proofOfEmployment !== "" &&
                              w.endYear === "present" ? (
                                <a
                                  href={w.proofOfEmployment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <File className="text-[#3675c5] cursor-pointer" />
                                </a>
                              ) : (
                                <p>N/A</p>
                              )}
                            </td>

                            <Dialog
                              open={isMapOpenArray[index]}
                              onClose={() => closeMap(index)}
                            >
                              <DialogContent className="w-150">
                                <div className="flex items-center justify-between relative">
                                  <p className="text-xl font-bold pb-3">
                                    {w.company} Location
                                  </p>
                                  <button
                                    onClick={() => closeMap(index)}
                                    className="absolute top-0 right-0"
                                  >
                                    <XIcon className="cursor-pointer hover:text-red-500" />
                                  </button>
                                </div>
                                <div className="h-[400px] w-full">
                                  {!isLoaded ? (
                                    <div className="flex items-center justify-center h-full">
                                      <p className="text-xl text-gray-600">
                                        Loading map...
                                      </p>
                                    </div>
                                  ) : (
                                    <GoogleMap
                                      mapContainerStyle={{
                                        width: "100%",
                                        height: "100%",
                                      }}
                                      center={{
                                        lat: w.latitude,
                                        lng: w.longitude,
                                      }}
                                      zoom={15}
                                    >
                                      <Marker
                                        position={{
                                          lat: w.latitude,
                                          lng: w.longitude,
                                        }}
                                        title={w.company}
                                      />
                                    </GoogleMap>
                                  )}
                                </div>
                                <div className="mt-4 text-center">
                                  <p>{w.location}</p>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* <Dialog
                              open={showProof}
                              onClose={() => setShowProof(false)}
                            >
                              <DialogContent className="w-150">
                                <div className="flex items-center justify-between relative">
                                  <p className="text-xl font-bold pb-3">Proof of Employment</p>
                                  <button onClick={() => setShowProof(false)} className="absolute top-0 right-0"><XIcon className="cursor-pointer hover:text-red-500"/></button>
                                </div>
                                {getFileType(w.proofOfEmployment) === 'image' ? (
                                  <img
                                    src={w.proofOfEmployment}
                                    alt="Proof of Employment"
                                    className="w-full h-auto object-cover rounded-lg border-2 border-gray-300"
                                  />
                                ) : getFileType(w.proofOfEmployment) === 'pdf' ? (
                                  <iframe
                                    src={w.proofOfEmployment}
                                    title="Proof of Employment PDF"
                                    className="w-full h-[600px] rounded-lg border-2 border-gray-300"
                                  />
                                ) : getFileType(w.proofOfEmployment) === 'doc' ? (
                                  <a href={w.proofOfEmployment} target="_blank" rel="noopener noreferrer">
                                    <p className="text-blue-500 underline">Download Document</p>
                                  </a>
                                ) : (
                                  <p className="text-red-500">Unknown file type</p>
                                )}
                              </DialogContent>
                            </Dialog> */}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="pl-9 pt-3">None</p>
                )}
              </div>

              <MapComponentA
                workExperienceList={work}
                onLocationClick={(lat, lng, index) => {
                  setSelectedLocation({ lat, lng });
                  setActiveMarker(index);
                }}
                selectedLocation={selectedLocation}
                activeMarker={activeMarker}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
