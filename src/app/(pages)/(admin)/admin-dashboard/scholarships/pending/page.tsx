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
  const navigateToDetail = (scholarshipId: string) => {
    router.push(`/admin-dashboard/scholarships/manage/${scholarshipId}`);
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
  ) => {};

  //function for rejecting scholarshipStudent
  const handleReject = async (scholarshipStudentId: string) => {
    try {
      //call updateScholarship function to update the status of the scholarshipStudent
      await updateScholarshipStudent(scholarshipStudentId, {
        status: "rejected",
      });
      toastSuccess("Scholarship student rejected successfully.");
    } catch (error) {
      setError("Failed to reject scholarship student.");
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
          View Pending Scholarships{" "}
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Pending Scholarships</div>
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
          <div
            className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
              isSticky ? "fixed top-0" : ""
            }`}
            style={{ width: isSticky ? headerWidth : "100%" }}
          >
            <div className="w-1/2 flex items-center justify-baseline font-semibold">
              Scholarship Info
            </div>
          </div>

          {/* Spacer div to prevent content jump when header becomes fixed */}
          {isSticky && <div style={{ height: "56px" }}></div>}

          {/* Dynamic rows */}
          {sortedScholarships.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
              'No scholarships available.'
            </div>
          ) : (
            <div className="">
              {sortedScholarships.map((scholarship: Scholarship, index) => (
                <div
                  key={scholarship.scholarshipId}
                  className={`w-full flex gap-4 border-t border-gray-300 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  <div className="w-1/2 flex flex-col p-4 gap-1">
                    <div className="text-base font-bold">
                      {scholarship.title} {"("}
                      {scholarship.status}
                      {")"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Date Posted: {scholarship.datePosted.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Sponsors: {scholarship.alumList.length}
                    </div>
                  </div>
                  {scholarship.status === "active" &&
                    scholarshipStudentMapping[scholarship.scholarshipId] &&
                    scholarshipStudentMapping[scholarship.scholarshipId].map(
                      (scholarshipStudent: ScholarshipStudent) => (
                        <div key={scholarshipStudent.ScholarshipStudentId}>
                          {scholarshipStudent.status === "pending" && (
                            <div>
                              <div
                                key={scholarshipStudent.studentId}
                                className="w-full flex items-center gap-4 border-t border-gray-300 p-4"
                              >
                                {/* Student Info */}
                                <div className="w-1/3 text-sm text-gray-600">
                                  <span className="font-medium">Student:</span>{" "}
                                  {
                                    studentScholar[
                                      scholarshipStudent.ScholarshipStudentId
                                    ].name
                                  }
                                </div>

                                {/* Sponsor Info */}
                                <div className="w-1/3 text-sm text-gray-600">
                                  <span className="font-medium">Sponsor:</span>{" "}
                                  {
                                    sponsorAlum[
                                      scholarshipStudent.ScholarshipStudentId
                                    ].firstName
                                  }{" "}
                                  {
                                    sponsorAlum[
                                      scholarshipStudent.ScholarshipStudentId
                                    ].lastName
                                  }
                                </div>

                                {/* Actions */}
                                <div className="w-1/3 flex justify-end items-center gap-4">
                                  <button
                                    className="text-[var(--primary-blue)] hover:underline cursor-pointer text-sm"
                                    onClick={() => {
                                      handleApprove(
                                        scholarshipStudent,
                                        studentScholar[
                                          scholarshipStudent
                                            .ScholarshipStudentId
                                        ],
                                        sponsorAlum[
                                          scholarshipStudent
                                            .ScholarshipStudentId
                                        ]
                                      );
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="text-red-700 hover:cursor-pointer"
                                    onClick={() => {
                                      handleReject(
                                        scholarshipStudent.ScholarshipStudentId
                                      );
                                    }}
                                  >
                                    <Trash2 className="size-6" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
