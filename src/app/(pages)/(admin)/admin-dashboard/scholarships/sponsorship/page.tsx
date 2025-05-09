"use client";

import {
  Alumnus,
  Scholarship,
  ScholarshipStudent,
  Student,
} from "@/models/models";
import { useScholarship } from "@/context/ScholarshipContext";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toastSuccess } from "@/components/ui/sonner";
import {
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Trash2,
} from "lucide-react";
import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useAlums } from "@/context/AlumContext";
import ScholarshipDetailPage from "../manage/[id]/page";
import { uploadDocToFirebase } from "./scholarshipPDF";

export default function ViewPendingScholarships() {
  const {
    scholarships,
    updateScholarship,
    students,
    scholarshipStudents,
    updateScholarshipStudent,
  } = useScholarship();

  const { alums } = useAlums();
  const [activeTab, setActiveTab] = useState("Posted");
  const tableRef = useRef(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();

  const navigateToDetail = (scholarship_studentID: string) => {
    router.push(`/admin-dashboard/scholarships/sponsorship/${scholarship_studentID}`);
  };

  //for retrieving each scholarshipStudent info per studentId
  const [scholarshipStudentMapping, setScholarshipStudentMapping] = useState<
    Record<string, ScholarshipStudent[]>
  >({});

  //for retrieving each alum info per scholarshipStudent
  const [sponsorAlum, setSponsorAlumMapping] = useState<
    Record<string, Alumnus>
  >({});

  //for retrieving each student info per scholarshipStudent
  const [studentScholar, setStudentScholarMapping] = useState<
    Record<string, Student>
  >({});

  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const [sortOption, setSortOption] = useState<
    | "newest"
    | "oldest"
    | "number of sponsors (asc)"
    | "number of sponsors (dsc)"
  >("newest");
  const sortScholarships = (scholarships: Scholarship[]) =>
    [...scholarships].sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return (
            new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime()
          );
        case "newest":
          return (
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
          );
        case "number of sponsors (asc)":
          return a.alumList.length - b.alumList.length; // ascending = small to big
        case "number of sponsors (dsc)":
          return b.alumList.length - a.alumList.length; // descending = big to small
        default:
          return 0;
      }
    });
  const sortedScholarships = sortScholarships(scholarships);

  //useEffect to fetch scholarshipStudent with mapping
  useEffect(() => {
    //function to fetch scholarshipStudent while being mapped to studentId
    const mapScholarshipStudent = async () => {
      if (sortedScholarships.length === 0) return;
      if (!sortedScholarships) return;
      setLoading(true);

      try {
        //fetch educationList of students
        const fetchScholarshipStudent = sortedScholarships.map(
          async (sch: Scholarship) => {
            const scholarshipId = sch.scholarshipId;

            //get scholarshipStudent list by filtering by studentId
            const scholarshipList = scholarshipStudents.filter(
              (scholarshipStudent: ScholarshipStudent) =>
                scholarshipStudent.scholarshipId === scholarshipId
            );

            return { scholarshipId, scholarshipList };
          }
        );

        const scholarshipStudent = await Promise.all(fetchScholarshipStudent);

        //intialize as empty scholarship map
        const scholarshipStudentMap: Record<string, ScholarshipStudent[]> = {};
        const scholarshipSponsor: Record<string, Alumnus> = {};
        const studentScholar: Record<string, Student> = {};
        scholarshipStudent.forEach((scholar) => {
          scholar.scholarshipList.forEach((ss: ScholarshipStudent) => {
            //finding the alumId per scholarshipStudent in the alumList
            const alumSponsor = alums.find(
              (alum: Alumnus) => alum.alumniId === ss.alumId
            );
            scholarshipSponsor[ss.ScholarshipStudentId] = alumSponsor;

            //finding the studentId per scholarshipStudent in the studentList
            const student = students.find(
              (stud: Student) => stud.studentId === ss.studentId
            );
            studentScholar[ss.ScholarshipStudentId] = student;
          });

          //map all scholarshipStudent entry with scholarshipId
          scholarshipStudentMap[scholar.scholarshipId] =
            scholar.scholarshipList;
        });

        //set mapping of scholarshipIds to  scholarshipStudent, alum, and student
        setScholarshipStudentMapping(scholarshipStudentMap);
        setSponsorAlumMapping(scholarshipSponsor);
        setStudentScholarMapping(studentScholar);
      } catch (error) {
        console.error("Error fetching scholarshipStudent:", error);

        return [];
      } finally {
        setLoading(false);
      }
    };

    mapScholarshipStudent();
  }, [students, scholarshipStudents, alums, scholarships]);

  // Track scroll position and update header state
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();

      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(tableRect.width);
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth);
    }

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky]);

  const home = () => {
    router.push("/admin-dashboard");
  };

  const handleApprove = async (
    scholarshipStudent: ScholarshipStudent,
    student: Student,
    alum: Alumnus
  ) => {
    setLoadingApprove(true);
    try {
      //generate and upload the scholarship agreement to firebase
      await uploadDocToFirebase(scholarshipStudent, student, alum);

      //call updateScholarship function to update the status of the scholarshipStudent
      await updateScholarshipStudent(scholarshipStudent.ScholarshipStudentId, {
        status: "approved",
      });
      toastSuccess("Scholarship student approved successfully.");
    } catch (error) {
      setError("Failed to approve scholarship student.");
    } finally {
      setLoadingApprove(false);
    }
  };

  //function for rejecting scholarshipStudent
  const handleReject = async (scholarshipStudentId: string) => {
    setLoadingReject(true);
    try {
      //call updateScholarship function to update the status of the scholarshipStudent
      await updateScholarshipStudent(scholarshipStudentId, {
        status: "rejected",
      });
      toastSuccess("Scholarship student rejected successfully.");
    } catch (error) {
      setError("Failed to reject scholarship student.");
    } finally {
      setLoadingReject(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="hover:text-blue-600 cursor-pointer" onClick={home}>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          {" "}
         	Manage Sponsorship{" "}
        </div>
      </div>
      <div className="w-full">
        <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="font-bold text-3xl">
            Manage Sponsorships
          </div>
        </div>
      </div>
      {/* Filter Buttons */}
      <div className="flex flex-col gap-3">
        <div className="w-full flex gap-2">
          <div 
            onClick={() => setStatusFilter("pending")} 
            className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${statusFilter === "pending" ? "bg-[var(--primary-blue)]" : "bg-white"}`}
          >
            <div className={`w-full h-1 transition-colors ${statusFilter === "pending" ? "bg-[var(--primary-blue)]" : "bg-transparent"}`}> </div>
            <div className={`w-full py-3 flex items-center justify-center rounded-t-2xl font-semibold text-base ${statusFilter === "pending" ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"}`}>
              Pending
            </div>
          </div>
          <div 
            onClick={() => setStatusFilter("approved")} 
            className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${statusFilter === "approved" ? "bg-[var(--primary-blue)]" : "bg-white"}`}
          >
            <div className={`w-full h-1 transition-colors ${statusFilter === "approved" ? "bg-[var(--primary-blue)]" : "bg-transparent"}`}> </div>
            <div className={`w-full py-3 flex items-center justify-center rounded-t-2xl font-semibold text-base ${statusFilter === "approved" ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"}`}>
              Approved
            </div>
          </div>
          <div 
            onClick={() => setStatusFilter("rejected")} 
            className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${statusFilter === "rejected" ? "bg-[var(--primary-blue)]" : "bg-white"}`}
          >
            <div className={`w-full h-1 transition-colors ${statusFilter === "rejected" ? "bg-[var(--primary-blue)]" : "bg-transparent"}`}> </div>
            <div className={`w-full py-3 flex items-center justify-center rounded-t-2xl font-semibold text-base ${statusFilter === "rejected" ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"}`}>
              Rejected
            </div>
          </div>
        </div>
      </div>
      {/* Filter tabs */}
      <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
        <div className="text-sm font-medium">Filter by:</div>
        <div className=" pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-300">
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="flex items-center text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="number of sponsors (asc)">
              Number of Sponsors (ASC)
            </option>
            <option value="number of sponsors (dsc)">
              Number of Sponsors (DSC)
            </option>
          </select>
        </div>
      </div>
      {/* Table Container with Fixed Height for Scrolling */}
      <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
        <div
          className="rounded-xl overflow-hidden border border-gray-300 relative"
          ref={tableRef}
        >
          {/* Header Row */}
          <div
            className={`bg-blue-100 w-full flex p-4 text-xs z-10 shadow-sm ${
              isSticky ? "fixed top-0" : ""
            }`}
            style={{ width: isSticky ? headerWidth : "100%" }}
          >
            <div className="w-1/3 font-semibold">Scholarship Info</div>
            <div className="w-1/5 font-semibold">Student</div>
            <div className="w-1/5 font-semibold">Alumnus</div>
            <div className="w-1/5 font-semibold text-center">Actions</div>
          </div>

          {/* Spacer div to prevent content jump when header becomes fixed */}
          {isSticky && <div style={{ height: "56px" }}></div>}

          {/* Dynamic rows */}
          {sortedScholarships.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
              No scholarships available.
            </div>
          ) : (
            <div>
              {sortedScholarships.map((scholarship: Scholarship, index) => (
                <div
                  key={scholarship.scholarshipId}
                  className={`w-full flex-col ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } `}
                >
                  <div className="flex flex-col w-full">
                    {scholarship.status === "active" &&
                      scholarshipStudentMapping[scholarship.scholarshipId] &&
                      scholarshipStudentMapping[scholarship.scholarshipId]
                        .filter((scholarshipStudent: ScholarshipStudent) => {
                          // Filter based on statusFilter
                          if (statusFilter === "all") return true;
                          return scholarshipStudent.status === statusFilter;
                        })
                        .map((scholarshipStudent: ScholarshipStudent) => {
                          // Skip rendering if student or alum data is missing
                          if (!studentScholar[scholarshipStudent.ScholarshipStudentId] || 
                              !sponsorAlum[scholarshipStudent.ScholarshipStudentId]) {
                            return null;
                          }

                          return (
                            <div 
                              key={scholarshipStudent.ScholarshipStudentId}
                              className="hover:bg-blue-50"
                            >
                              <div className="w-full flex items-center border-t border-gray-300 p-4">
                                <div className="w-1/3">
                                  <div className="font-semibold">
                                    {scholarship.title} <span className="font-normal">({scholarship.status})</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Status: <span className={`font-medium ${
                                      scholarshipStudent.status === "pending" ? "text-yellow-600" :
                                      scholarshipStudent.status === "approved" ? "text-green-600" :
                                      "text-red-600"
                                    }`}>
                                      {scholarshipStudent.status.charAt(0).toUpperCase() + scholarshipStudent.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Student Info */}
                                <div className="w-1/6 text-sm text-gray-600">
                                  {studentScholar[scholarshipStudent.ScholarshipStudentId].name}
                                </div>

                                {/* Sponsor Info */}
                                <div className="w-1/6 text-sm text-gray-600">
                                  {sponsorAlum[scholarshipStudent.ScholarshipStudentId].firstName}{" "}
                                  {sponsorAlum[scholarshipStudent.ScholarshipStudentId].lastName}
                                </div>

                                {/* Actions */}
                                <div className="w-1/3 flex justify-center items-center gap-4">
                                  {scholarshipStudent.status === "pending" && (
                                    <>
                                      <button
                                        className="bg-green-600 text-white px-4 py-1 rounded-full cursor-pointer text-sm hover:bg-green-400 flex gap-1 items-center"
                                        onClick={() => {
                                          handleApprove(
                                            scholarshipStudent,
                                            studentScholar[scholarshipStudent.ScholarshipStudentId],
                                            sponsorAlum[scholarshipStudent.ScholarshipStudentId]
                                          );
                                        }}
                                        disabled={loadingApprove}
                                      >
                                        <CircleCheck className="size-4.5" />
                                        {loadingApprove ? "Approving..." : "Approve"}
                                      </button>
                                      <button
                                        className="bg-red-500 text-white px-5 py-1 rounded-full cursor-pointer text-sm hover:bg-red-400 flex gap-1 items-center"
                                        onClick={() => {
                                          handleReject(scholarshipStudent.ScholarshipStudentId);
                                        }}
                                        disabled={loadingReject}
                                      >	
                                        <CircleX className="size-4.5"/>
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <button
                                    className="bg-blue-500 text-white px-5 py-1 rounded-full cursor-pointer text-sm hover:bg-blue-400 flex gap-1 items-center"
                                    onClick={() => {
                                      navigateToDetail(scholarshipStudent.ScholarshipStudentId);
                                    }}
                                  >	
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}