// will show the following
// alum info
// student info
// scholarship info
// pdf
"use client";

import { ChevronRight } from "lucide-react";
import { useRouter, useParams} from "next/navigation";
import { useEffect, useState } from "react";
import { useScholarship } from "@/context/ScholarshipContext";

export default function SponsorshipDetails() {
  const router = useRouter();
  const params = useParams();
  const { getStudentById, getAlumniById, getScholarshipById, getScholarshipStudentById } = useScholarship();

  const [student, setStudent] = useState<any | null>(null);
  const [alumni, setAlumni] = useState<any | null>(null);
  const [scholarship, setScholarship] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const sponsorshipId = params?.id as string;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        // Fetch the scholarship-student relationship
        const sponsorshipDetails = await getScholarshipStudentById(sponsorshipId);
        if (sponsorshipDetails) {
          // Fetch student details
          const studentDetails = await getStudentById(sponsorshipDetails.studentId);
          setStudent(studentDetails);

          // Fetch alumni details
          const alumniDetails = await getAlumniById(sponsorshipDetails.alumId); 
          setAlumni(alumniDetails);

          // Fetch scholarship details
          const scholarshipDetails = await getScholarshipById(sponsorshipDetails.scholarshipId);
          setScholarship(scholarshipDetails);
        }
      } catch (error) {
        console.error("Error fetching sponsorship details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [getScholarshipStudentById, getStudentById, getAlumniById, getScholarshipById, sponsorshipId]);

  const manage = () => {
    router.push("/admin-dashboard/scholarships/sponsorship");
  };
  const home = () => {
    router.push("/admin-dashboard");
  };


	return (
		<>
			<div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="hover:text-blue-600 cursor-pointer" onClick={home}>
            Home
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="hover:text-blue-600 cursor-pointer" onClick={manage}>
            Manage Sponsorship
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-bold text-[var(--primary-blue)]">
            Student Name
          </div>
        </div>

				<div className="w-full">
					<div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
						<div className="font-bold text-3xl">
							Sponsorship Details
						</div>
					</div>
				</div>

				<div className="flex gap-5">
					<div className="bg-white flex flex-col rounded-2xl overflow-hidden w-full p-4">
						<div className="flex justify-between items-center mb-4">
							<div className="text-md font-medium flex items-center">
								Student Information
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Name: </span>
								<span className="font-medium">{student?.name}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Email Address: </span>
								<span className="font-medium">{student?.emailAddress}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Student Number: </span>
								<span className="font-medium">{student?.studentNumber}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Background: </span>
								<span className="font-medium">{student?.shortBackground}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Address: </span>
								<span className="font-medium">{student?.address}</span>
							</div>
						</div>
					</div>
					<div className="bg-white flex flex-col rounded-2xl overflow-hidden w-full p-4">
						<div className="flex justify-between items-center mb-4">
							<div className="text-md font-medium flex items-center">
								Alumni Information
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Name: </span>
								<span className="font-medium">{alumni?.firstName} {alumni?.middleName}  {alumni?.lastName} {alumni?.suffix}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Email Address: </span>
								<span className="font-medium">{alumni?.email}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Address: </span>
								<span className="font-medium">{alumni?.address[1]}, {alumni?.address[2]}, {alumni?.address[0]}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-5">
					<div className="bg-white flex flex-col rounded-2xl overflow-hidden w-full p-4">
						<div className="flex justify-between items-center mb-4">
							<div className="text-md font-medium flex items-center">
								Scholarship Information
							</div>
							<div className="text-md font-medium flex items-center">
								Status
							</div>
						</div>
						<div>
							PDF Viewer and download
						</div>
					</div>
				</div>
			</div>
		</>
	)
}