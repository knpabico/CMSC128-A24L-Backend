"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useScholarship } from "@/context/ScholarshipContext";
import {
  Alumnus,
  Scholarship,
  ScholarshipStudent,
  Student,
} from "@/models/models";
import DonutChart from "@/components/charts/DonutChart";
import BarGraph from "@/components/charts/BarGraph";
import { useAlums } from "@/context/AlumContext";
import ReportSummaryCard from "@/components/ReportSummaryCard";

const ScholarshipReports = () => {
  const { scholarshipStudents, students, scholarships } = useScholarship();
  const { alums: alumList } = useAlums();

  const filteredStudents: ScholarshipStudent[] = useMemo(
    () =>
      scholarshipStudents.filter(
        (student: ScholarshipStudent) => student.status === "approved"
      ),
    [scholarshipStudents]
  );

  const scholarshipDetails: {
    scholarship: Scholarship;
    students: { studentId: string; name: string }[];
  }[] = useMemo(() => {
    return scholarships
      .map((scholarship: Scholarship) => {
        const scholarshipStudents = filteredStudents
          .filter(
            (student: ScholarshipStudent) =>
              student.scholarshipId === scholarship.scholarshipId
          )
          .map((scholarshipStudent: ScholarshipStudent) => {
            const student = students.find(
              (s: Student) => s.studentId === scholarshipStudent.studentId
            );
            return {
              studentId: scholarshipStudent.studentId,
              name: student?.name || "Unknown Student",
            };
          });
        return {
          scholarship,
          students: scholarshipStudents,
        };
      })
      .sort((a, b) => b.students.length - a.students.length); // Sort in descending order by number of students
  }, [scholarships, filteredStudents, students]);

  const studentDetails = useMemo(
    () =>
      filteredStudents
        .map((scholarshipStudent: ScholarshipStudent) =>
          students.find(
            (student: Student) =>
              student.studentId === scholarshipStudent.studentId
          )
        )
        .filter(
          (student: Student): student is Student => student !== undefined
        ),
    [filteredStudents, students]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Scholarship Reports
          </h1>
          <p className="text-gray-600">
            Comprehensive overview of scholarship programs and student
            participation
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Students
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {students.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              With Scholarships
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {filteredStudents.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Scholarship Programs
            </h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {scholarships.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Active Sponsors
            </h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {alumList?.filter((alum) =>
                scholarshipStudents.some(
                  (student) => student.alumId === alum.alumniId
                )
              ).length || 0}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Student Scholarship Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
              Student Scholarship Distribution
            </h2>
            <div className="flex justify-center">
              <DonutChart
                labels={["With Scholarship", "Without Scholarship"]}
                data={[
                  studentDetails.length,
                  students.length - studentDetails.length,
                ]}
              />
            </div>
          </div>

          {/* Top Scholarships by Student Count */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
              Top Scholarships by Student Count
            </h2>
            <BarGraph
              type="Number of scholars"
              data={scholarshipDetails.map(
                (scholarship) => scholarship.students.length
              )}
              labels={scholarshipDetails.map(
                (scholarship) => scholarship.scholarship.title
              )}
            />
          </div>
        </div>

        {/* Scholarship Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
            Scholarship Program Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarshipDetails.map(
              (
                scholarship: {
                  scholarship: Scholarship;
                  students: { studentId: string; name: string }[];
                },
                index: number
              ) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg truncate pr-2">
                      {scholarship.scholarship.title}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {scholarship.students.length} scholar
                      {scholarship.students.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {scholarship.students.map(
                      (student, studentIndex: number) => (
                        <div
                          key={studentIndex}
                          className="text-sm text-gray-600 bg-white px-3 py-2 rounded border"
                        >
                          {student.name}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Students with Scholarships List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
            Students with Scholarships
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {studentDetails.map((student: Student, index: number) => (
              <div
                key={index}
                className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-medium text-green-800"
              >
                {student.name}
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Scholarships by Sponsors */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
              Top Scholarships by Sponsor Count
            </h2>
            <BarGraph
              type="Number of sponsors"
              data={scholarships
                .map((scholarship: Scholarship) => scholarship.alumList.length)
                .sort((a, b) => b - a)
                .slice(0, 5)}
              labels={scholarships
                .map((scholarship: Scholarship) => scholarship.title)
                .sort((a, b) => a.localeCompare(b))
                .slice(0, 5)}
            />
          </div>

          {/* Top Sponsors by Scholar Count */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              Top Sponsors by Scholar Count
            </h2>
            <BarGraph
              type="Number of scholars"
              data={
                alumList
                  ?.map((alum) => {
                    const scholarships = scholarshipStudents.filter(
                      (student) =>
                        student.alumId === alum.alumniId &&
                        student.status === "approved"
                    );
                    return scholarships.length;
                  })
                  .sort((a, b) => b - a)
                  .slice(0, 5) || []
              }
              labels={
                alumList
                  ?.map((alum) => {
                    const scholarships = scholarshipStudents.filter(
                      (student) =>
                        student.alumId === alum.alumniId &&
                        student.status === "approved"
                    );
                    return `${alum.firstName} ${alum.lastName}`;
                  })
                  .sort((a, b) => {
                    const countA = scholarshipStudents.filter(
                      (student) =>
                        student.alumId ===
                        alumList.find(
                          (alum) => `${alum.firstName} ${alum.lastName}` === a
                        )?.alumniId
                    ).length;
                    const countB = scholarshipStudents.filter(
                      (student) =>
                        student.alumId ===
                        alumList.find(
                          (alum) => `${alum.firstName} ${alum.lastName}` === b
                        )?.alumniId
                    ).length;
                    return countB - countA;
                  })
                  .slice(0, 5) || []
              }
            />
          </div>
        </div>

        {/* Report Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-4 h-4 bg-gray-700 rounded-full mr-3"></div>
            Report Summary
          </h2>
          <ReportSummaryCard
            data={`
            // Scholarship Reports
            Total Approved Scholarships: ${filteredStudents.length}
            Total Scholarship Programs: ${scholarships.length}
            Total Students: ${students.length}
            Students with Scholarships: ${filteredStudents.length}
            Students without Scholarships: ${
              students.length - filteredStudents.length
            }
            
            // Top 5 Scholarship Programs by Student Count: ${scholarships
              .map((scholarship: Scholarship) => scholarship.alumList.length)
              .sort((a, b) => b - a)
              .slice(0, 5)} Corresponding Labels: ${scholarships
              .map((scholarship: Scholarship) => scholarship.title)
              .sort((a, b) => a.localeCompare(b))
              .slice(0, 5)}
            
            // Top Sponsors
            Number of Active Sponsors: ${
              alumList?.filter((alum) =>
                scholarshipStudents.some(
                  (student) => student.alumId === alum.alumniId
                )
              ).length || 0
            }
            Top 5 Sponsors by Scholar Count: ${
              alumList
                ?.map((alum) => {
                  const scholarships = scholarshipStudents.filter(
                    (student) =>
                      student.alumId === alum.alumniId &&
                      student.status === "approved"
                  );
                  return scholarships.length;
                })
                .sort((a, b) => b - a)
                .slice(0, 5) || []
            } Corresponding Labels: ${
              alumList
                ?.map((alum) => {
                  const scholarships = scholarshipStudents.filter(
                    (student) =>
                      student.alumId === alum.alumniId &&
                      student.status === "approved"
                  );
                  return `${alum.firstName} ${alum.lastName}`;
                })
                .sort((a, b) => {
                  const countA = scholarshipStudents.filter(
                    (student) =>
                      student.alumId ===
                      alumList.find(
                        (alum) => `${alum.firstName} ${alum.lastName}` === a
                      )?.alumniId
                  ).length;
                  const countB = scholarshipStudents.filter(
                    (student) =>
                      student.alumId ===
                      alumList.find(
                        (alum) => `${alum.firstName} ${alum.lastName}` === b
                      )?.alumniId
                  ).length;
                  return countB - countA;
                })
                .slice(0, 5) || []
            }
            
            // Date Context
            Current date: ${new Date().toLocaleDateString()}
            Report generated on: ${new Date().toLocaleString()}
            `}
          />
        </div>
      </div>
    </div>
  );
};

export default ScholarshipReports;
