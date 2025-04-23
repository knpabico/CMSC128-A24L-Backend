"use client";
import LoadingPage from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { useAlums } from "@/context/AlumContext";
import { useAuth } from "@/context/AuthContext";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { Career, Education, WorkExperience } from "@/models/models";
import Link from "next/link";

export default function Home() {
  const { user, loading, alumInfo } = useAuth();
  const { userWorkExperience, isLoading } = useWorkExperience();
  const { myCareer, myEducation } = useAlums();

  if (loading || (user && !alumInfo)) return <LoadingPage />;
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <h1 className="text-black text-[70px] font-bold">WELCOME, Guest!</h1>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row min-h-screen justify-center items-center">
        <h1 className="text-black text-[70px] font-bold">
          Welcome, {alumInfo!.firstName} {alumInfo!.lastName}!
        </h1>
      </div>
      <div>
        <p className="text-black text-[25px] font-bold">
          Email: {alumInfo!.email}
        </p>
        <p className="text-black text-[25px] font-bold">Age: {alumInfo!.age}</p>
        <p className="text-black text-[25px] font-bold">
          Birthdate: {alumInfo!.birthDate ? alumInfo!.birthDate.toString() : ""}
        </p>
        <p className="text-black text-[25px] font-bold">
          Student Number: {alumInfo!.studentNumber}
        </p>
        <p className="text-black text-[25px] font-bold">
          Affiliation:{" "}
          {alumInfo!.affiliation
            ? `${alumInfo!.affiliation[0]}, ${alumInfo!.affiliation[2]}, ${
                alumInfo!.affiliation[1]
              }`
            : ""}
        </p>
      </div>
      {/*EDUCATION*/}
      <div>
        <p></p>
        <p className="text-black text-[25px] font-bold">Education: </p>
        {isLoading && <h1>Loading</h1>}
        {myEducation.map((education: Education, index: any) => (
          <div key={index} className="p-1">
            <p className="text-black text-[15px] font-bold">
              {education.major}
            </p>
            <p className="text-black text-[15px] font-bold">
              {education.university}
            </p>
            <p className="text-black text-[15px] font-bold">
              Graduation Year: {education.yearGraduated}
            </p>

            <h2> </h2>
          </div>
        ))}
      </div>
      {/*CAREER*/}
      <div>
        <p></p>
        <p className="text-black text-[25px] font-bold">Career: </p>
        {isLoading && <h1>Loading</h1>}
        {myCareer.map((career: Career, index: any) => (
          <div key={index} className="p-1">
            <p className="text-black text-[15px] font-bold">
              Company: {career.company}
            </p>
            <p className="text-black text-[15px] font-bold">
              Job Title: {career.jobTitle}
            </p>
            <p className="text-black text-[15px] font-bold">
              Industry: {career.industry}
            </p>
            <p className="text-black text-[15px] font-bold">
              Duration: {career.startYear.toString()} -{" "}
              {career.endYear.toString()}
            </p>

            <h2> </h2>
          </div>
        ))}
      </div>
      {/*WORK EXPERIENCE*/}
      <div>
        <p></p>
        <p className="text-black text-[25px] font-bold">Work Experience: </p>
        {isLoading && <h1>Loading</h1>}
        {userWorkExperience.map(
          (workExperience: WorkExperience, index: any) => (
            <div key={index} className="p-1">
              <p className="text-black text-[15px] font-bold">
                Company: {workExperience.company}
              </p>
              <p className="text-black text-[15px] font-bold">
                Location: {workExperience.location}
              </p>
              <p className="text-black text-[15px] font-bold">
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
              </p>
              <h2> </h2>
            </div>
          )
        )}
      </div>
    </>
  );
}
