"use client";

import React, { useState, useEffect } from "react";
import { useScholarship } from "@/context/ScholarshipContext";
import {
  Clock,
  CircleCheck,
  CircleX,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useBookmarks } from "@/context/BookmarkContext";
import { useAuth } from "@/context/AuthContext";
import {
  Scholarship,
  ScholarshipStudent,
  Student,
} from "@/models/models";
import { PdfPreviewDialog } from "./PdfPreviewDialog";




export default function ScholarshipsProfile()
  {

  const { scholarships, students, scholarshipStudents } =
      useScholarship();
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const handleStatusFilterChange = (f: React.ChangeEvent<HTMLSelectElement>) => 
    {
        setStatusFilter(f.target.value);
    };
    const [selectedScholarshipStudentId, setSelectedScholarshipStudentId] =
      useState<string | null>(null);
    const [userScholarshipStudent, setUserScholarshipStudent] = useState<
      ScholarshipStudent[]
    >([]);
    const [scholarshipMapping, setScholarshipMapping] = useState<
      Record<string, string>
    >({});
    const [studentMapping, setStudentMapping] = useState<Record<string, string>>(
      {}
    );
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  
    useEffect(() => {
      //function to fetch student while being mapped to studentId
      const mapStudent = async () => {
        if (students.length === 0) return;
        if (!students) return;
  
        try {
          //intialize as empty record
          const studentMap: Record<string, string> = {};
          //fetch student
          const fetchStudent = students.forEach((student: Student) => {
            studentMap[student.studentId] = student.name;
          });
          //set scholarship student map
          setStudentMapping(studentMap);
        } catch (error) {
          console.error("Error fetching scholarshipStudent:", error);
          return [];
        }
      };
  
      //function to fetch scholarship while being mapped to scholarshipId
      const mapScholarship = async () => {
        if (scholarshipStudents.length === 0) return;
        if (!scholarshipStudents) return;
  
        try {
          //intialize as empty record
          const scholarshipMap: Record<string, string> = {};
          //fetch student
          const fetchScholarship = scholarships.forEach(
            (scholarships: Scholarship) => {
              scholarshipMap[scholarships.scholarshipId] = scholarships.title;
            }
          );
          //set scholarship student map
          setScholarshipMapping(scholarshipMap);
        } catch (error) {
          console.error("Error fetching scholarshipStudent:", error);
          return [];
        }
      };
  
      const fetchUserScholarshipStudent = async () => {
        if (scholarshipStudents.length === 0) return;
        if (!scholarshipStudents) return;
  
        try {
          //fetch scholarshipStudent of user
          const scholarshipStudentList = scholarshipStudents.filter(
            (scholarship: ScholarshipStudent) => scholarship.alumId === user?.uid
          );
          //set user scholarship student
          setUserScholarshipStudent(scholarshipStudentList);
        } catch (error) {
          console.error("Error fetching scholarshipStudent:", error);
          return [];
        }
      };
  
      mapStudent();
      mapScholarship();
      fetchUserScholarshipStudent();
    }, [students, scholarships, scholarshipStudents]);

  
    // Filtering and sorting for myScholars tab
  const filteredUserScholarshipStudent = [...userScholarshipStudent]
    .filter((scholarshipStudent) => {
      const status = scholarshipStudent.status?.toLowerCase();
      if (statusFilter === "all") {
        return ["approved", "pending", "rejected"].includes(status);
      }
      return status === statusFilter;
    });
  

    

    return(
    <div className="mx-50 mt-10 mb-15">

      <div className="filter-controls flex space-x-5 mb-5 justify-end items-center text-sm">
        <label htmlFor="status" className="mr-2">Status:</label>
        <div className="relative">
            <select 
                id="status" 
                value={statusFilter} 
                onChange={handleStatusFilterChange} 
                className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
            >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>

            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
            </div>
        </div>
      </div>
        
      {filteredUserScholarshipStudent.length > 0 ? (  
      <div className="bg-[#FFFF] py-[20px] px-[20px] rounded-[10px] shadow-md border border-gray-200">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider"
                  >
                    Scholarship
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                  >
                    Agreement
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUserScholarshipStudent.map((scholarshipStudent) => (
                  <tr
                    key={scholarshipStudent.ScholarshipStudentId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-left whitespace-nowrap text-sm text-gray-700">
                      {
                        scholarshipMapping[
                          scholarshipStudent.scholarshipId
                        ]
                      }
                      {/* {'Loading campaign name...'} */}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-medium text-gray-900">
                      {studentMapping[scholarshipStudent.studentId]}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                      {/* Status column */}
                      <div className="flex justify-center items-center">
                        <button
                          className={`flex text-sm rounded-full px-3 py-1 shadow-lg transition-colors justify-center items-center gap-2
                                                                  ${(() => {
                                const status =
                                  scholarshipStudent.status?.toLowerCase();

                                switch (status) {
                                  case "approved":
                                    return "bg-green-500 text-white hover:bg-green-600";
                                  case "pending":
                                    return "bg-yellow-500 text-white hover:bg-yellow-600";
                                  case "rejected":
                                    return "bg-red-500 text-white hover:bg-red-600";
                                  default:
                                    return "bg-gray-400 text-white hover:bg-gray-500";
                                }
                              })()}`}
                        >
                          {(() => {
                            const status =
                              scholarshipStudent.status.toLowerCase();

                            switch (status) {
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

                          <span className="whitespace-nowrap">
                            {scholarshipStudent.status
                              ? scholarshipStudent.status
                                  ?.charAt(0)
                                  .toUpperCase() +
                                scholarshipStudent.status?.slice(1)
                              : "None"}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          if (scholarshipStudent.status === "approved") {
                            setSelectedScholarshipStudentId(
                              scholarshipStudent.ScholarshipStudentId
                            );
                            setSelectedFile(scholarshipStudent.pdf);
                          }
                        }}
                        disabled={
                          scholarshipStudent.status !== "approved"
                        }
                        className={`text-sm ${
                          scholarshipStudent.status === "approved"
                            ? "text-blue-500 hover:underline cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        View PDF
                      </button>
                      {selectedScholarshipStudentId ===
                        scholarshipStudent.ScholarshipStudentId &&
                        selectedFile && (
                          <PdfPreviewDialog
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                          />
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
      ) : (
        statusFilter === "all" ? (
          <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
            <p className="text-gray-700">No sponsorships have been made yet.</p>
          </div>
        ) : statusFilter === "pending" ? (
          <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
            <p className="text-gray-700">No pending sponsorships.</p>
          </div>
        ) : statusFilter === "approved" ? (
          <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
            <p className="text-gray-700">No approved sponsorships.</p>
          </div>
        ) : statusFilter === "rejected" ? (
          <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
            <p className="text-gray-700">No rejected sponsorships.</p>
          </div>
        ) : null
      )}

    </div>
    )
};