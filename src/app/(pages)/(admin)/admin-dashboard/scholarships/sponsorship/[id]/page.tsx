// will show the following
// alum info
// student info
// scholarship info
// pdf
"use client";

import {
  AlertCircle,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Download,
  Eye,
  HelpCircle,
  Loader2,
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useScholarship } from "@/context/ScholarshipContext";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import {
  Alumnus,
  Scholarship,
  ScholarshipStudent,
  Student,
} from "@/models/models";

export default function SponsorshipDetails() {
  const router = useRouter();
  const params = useParams();
  const {
    getStudentById,
    getAlumniById,
    getScholarshipById,
    getScholarshipStudentById,
  } = useScholarship();

  const [student, setStudent] = useState<Student | null>(null);
  const [alumni, setAlumni] = useState<Alumnus | null>(null);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [sponsorship, setSponsorship] = useState<ScholarshipStudent | null>(
    null
  );
  const [isPreview, setPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

  const sponsorshipId = params?.id as string;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        // Fetch the scholarship-student relationship
        const sponsorshipDetails = await getScholarshipStudentById(
          sponsorshipId
        );
        setSponsorship(sponsorshipDetails);
        if (sponsorshipDetails) {
          // Fetch student details
          const studentDetails = await getStudentById(
            sponsorshipDetails.studentId
          );
          setStudent(studentDetails);

          // Fetch alumni details
          const alumniDetails = await getAlumniById(sponsorshipDetails.alumId);
          setAlumni(alumniDetails);

          // Fetch scholarship details
          const scholarshipDetails = await getScholarshipById(
            sponsorshipDetails.scholarshipId
          );
          setScholarship(scholarshipDetails);
        }
      } catch (error) {
        //console.error("Error fetching sponsorship details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [
    getScholarshipStudentById,
    getStudentById,
    getAlumniById,
    getScholarshipById,
    sponsorshipId,
  ]);

  const manage = () => {
    router.push("/admin-dashboard/scholarships/sponsorship");
  };
  const home = () => {
    router.push("/admin-dashboard");
  };

  const handlePreview = () => {
    setPreview(!isPreview);
  };

  useEffect(() => {
    const fetchPDFUrl = async () => {
      setLoading(true);
      try {
        const storage = getStorage();
        const pdfRef = ref(
          storage,
          `scholarship/${sponsorshipId}/scholarshipAgreement.pdf`
        );
        const pdfUrl = await getDownloadURL(pdfRef);
        //console.log("PDF URL:", pdfUrl);
        setPdfUrl(pdfUrl);
      } catch (error) {
        //console.error("Error fetching PDF URL:", error);
        setPdfUrl(undefined);
      }
    };

    fetchPDFUrl();
    setLoading(false);
  }, [sponsorshipId]);

  return (
    <>
      <title>Sponsorship Details | ICS-ARMS</title>
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
            <div className="font-bold text-3xl">Sponsorship Details</div>
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
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">Name: </span>
                <span className="font-medium text-sm">{student?.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">Email Address: </span>
                <span className="font-medium text-sm">
                  {student?.emailAddress}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">Student Number: </span>
                <span className="font-medium text-sm">
                  {student?.studentNumber}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">Address: </span>
                <span className="font-medium text-sm">{student?.address}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Background: </span>
                <span className="font-medium text-sm">
                  {student?.shortBackground}
                </span>
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
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">Name: </span>
                <span className="font-medium text-sm">
                  {alumni?.firstName} {alumni?.middleName} {alumni?.lastName}{" "}
                  {alumni?.suffix}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">Email Address: </span>
                <span className="font-medium text-sm">{alumni?.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-gray-500">Address: </span>
                <span className="font-medium text-sm">
                  {alumni?.address[1]}, {alumni?.address[2]},{" "}
                  {alumni?.address[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-5 w-full">
          <div className="bg-white flex flex-col rounded-2xl overflow-hidden w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-md font-medium flex items-center">
                Scholarship Information
              </div>
              <div className="w-1/6 flex justify-end">
                <button
                  className={`flex text-md rounded-full px-3 py-1 shadow-lg transition-colors justify-center items-center gap-2
										${(() => {
                      switch (sponsorship?.status) {
                        case "approved":
                          return "bg-green-500 text-white ";
                        case "pending":
                          return "bg-yellow-500 text-white ";
                        case "rejected":
                          return "bg-red-500 text-white 0";
                        default:
                          return "bg-gray-400 text-white";
                      }
                    })()}`}
                >
                  {(() => {
                    switch (sponsorship?.status) {
                      case "approved":
                        return <CircleCheck className="size-4" />;
                      case "pending":
                        return <Clock className="size-4" />;
                      case "rejected":
                        return <CircleX className="size-4" />;
                      default:
                        return <HelpCircle className="size-4" />;
                    }
                  })()}
                  {sponsorship?.status
                    ? sponsorship.status.charAt(0).toUpperCase() +
                      sponsorship.status.slice(1)
                    : "Unknown"}
                </button>
              </div>
            </div>
            <div className="flex">
              {sponsorship?.status === "approved" ? (
                <div>
                  {/* Buttons row */}
                  <div className="flex space-x-3 mb-4 just">
                    <button
                      onClick={handlePreview}
                      className={`px-5 py-2 rounded-full cursor-pointer text-sm flex items-center gap-2 ${
                        isPreview
                          ? "bg-red-500 text-white hover:bg-red-400"
                          : "bg-blue-500 text-white hover:bg-blue-400"
                      }`}
                    >
                      {isPreview ? (
                        <>
                          <X className="size-4" />
                          Close Preview
                        </>
                      ) : (
                        <>
                          <Eye className="size-4" />
                          View PDF
                        </>
                      )}
                    </button>
                    <a
                      href={pdfUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      download="scholarshipAgreement.pdf"
                    >
                      <button className="bg-blue-500 text-white px-5 py-2 rounded-full cursor-pointer text-sm hover:bg-blue-400 flex items-center gap-2">
                        <Download className="size-4" />
                        Download PDF
                      </button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center w-full py-4">
                  <AlertCircle className="size-6 text-yellow-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-500">
                    {sponsorship?.status === "pending"
                      ? "The sponsorship is not yet approved"
                      : "The sponsorship was rejected"}
                  </p>
                </div>
              )}
            </div>
            {/* Preview section */}
            {isPreview && (
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                {loading ? (
                  <div className="flex justify-center items-center h-32 bg-gray-50">
                    <div className="flex flex-col items-center">
                      <Loader2 className="size-8 text-blue-500 animate-spin mb-2" />
                      <p className="text-gray-500">Loading PDF...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {pdfUrl ? (
                      <iframe
                        src={`${pdfUrl}#toolbar=0`}
                        width="100%"
                        height="600px"
                        title="Scholarship PDF"
                        className="border-0"
                      ></iframe>
                    ) : (
                      <div className="flex justify-center items-center h-32 bg-gray-50">
                        <p className="text-gray-500">PDF not available</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
