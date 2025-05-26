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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, BarChart } from "lucide-react";

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
    <div className="flex flex-col gap-5">
      <title>Scholarship Statistical Reports | ICS-ARMS</title>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <div className="hover:text-[#0856BA] cursor-pointer transition-colors">
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-medium text-[#0856BA]">
          Scholarship Statistical Reports
        </div>
      </div>

      {/* Page Title */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart className="w-8 h-8 text-[#0856BA]" />
            <h1 className="font-bold text-3xl text-gray-800">
              Scholarship Statistical Reports
            </h1>
          </div>
          <div className="text-sm bg-[#0856BA] text-white px-4 py-2 rounded-full font-medium">
            Total Approved Scholarships: {filteredStudents.length}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-xl shadow-sm p-10 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 flex items-center">
          <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
          Scholarship Overview
        </h2>
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-semibold text-gray-700">
                Student Scholarship Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0 h-[300px]">
              <DonutChart
                labels={["With Scholarship", "Without Scholarship"]}
                data={[
                  studentDetails.length,
                  students.length - studentDetails.length,
                ]}
              />
            </CardContent>
          </Card>

          <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-semibold text-gray-700">
                Top Scholarships by Student Count
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0 h-[300px]">
              <BarGraph
                type="Number of scholars"
                data={scholarshipDetails.map(
                  (scholarship) => scholarship.students.length
                )}
                labels={scholarshipDetails.map(
                  (scholarship) => scholarship.scholarship.title
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Section - Cards Grid and Report Summary */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Scholarship Grid */}
        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                    Scholarship Programs
                  </CardTitle>
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Total: {scholarships.length}
                  </div>
                </div>
                <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                  {scholarships.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 h-[300px] overflow-y-auto">
              {scholarshipDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p>No scholarship programs found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {scholarshipDetails.map((item, index: number) => (
                    <li
                      key={index}
                      className="py-3 px-2 text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-md"
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                        <span className="font-medium">
                          {item.scholarship.title}
                        </span>
                      </div>
                      <span className="text-white bg-[#0856BA] px-3 py-1 rounded-full text-xs font-bold">
                        {item.students.length} scholar
                        {item.students.length !== 1 ? "s" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                    Students with Scholarships
                  </CardTitle>
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Total: {studentDetails.length}
                  </div>
                </div>
                <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                  {studentDetails.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 h-[300px] overflow-y-auto">
              {studentDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p>No students with scholarships found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {studentDetails.map((student: Student, index: number) => (
                    <li
                      key={index}
                      className="py-3 px-2 text-gray-700 flex items-center hover:bg-gray-50 transition-colors rounded-md"
                    >
                      <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                      <span className="font-medium">{student.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                    Top Sponsors by Scholar Count
                  </CardTitle>
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Active Sponsors:{" "}
                    {alumList?.filter((alum) =>
                      scholarshipStudents.some(
                        (student) => student.alumId === alum.alumniId
                      )
                    ).length || 0}
                  </div>
                </div>
                <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                  {alumList?.filter((alum) =>
                    scholarshipStudents.some(
                      (student) => student.alumId === alum.alumniId
                    )
                  ).length || 0}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 h-[300px] overflow-y-auto">
              {!alumList || alumList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p>No sponsors found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {alumList
                    ?.map((alum) => {
                      const scholarCount = scholarshipStudents.filter(
                        (student) =>
                          student.alumId === alum.alumniId &&
                          student.status === "approved"
                      ).length;
                      return { alum, scholarCount };
                    })
                    .filter((item) => item.scholarCount > 0)
                    .sort((a, b) => b.scholarCount - a.scholarCount)
                    .slice(0, 10)
                    .map((item, index: number) => (
                      <li
                        key={index}
                        className="py-3 px-2 text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                          <span className="font-medium">
                            {item.alum.firstName} {item.alum.lastName}
                          </span>
                        </div>
                        <span className="text-white bg-[#0856BA] px-3 py-1 rounded-full text-xs font-bold">
                          {item.scholarCount} scholar
                          {item.scholarCount !== 1 ? "s" : ""}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                    Top Scholarships by Sponsor Count
                  </CardTitle>
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Total: {scholarships.length}
                  </div>
                </div>
                <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                  {scholarships.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 h-[300px] overflow-y-auto">
              {scholarships.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <p>No scholarships found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {scholarships
                    .sort((a, b) => b.alumList.length - a.alumList.length)
                    .map((scholarship: Scholarship, index: number) => (
                      <li
                        key={index}
                        className="py-3 px-2 text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                          <span className="font-medium">
                            {scholarship.title}
                          </span>
                        </div>
                        <span className="text-white bg-[#0856BA] px-3 py-1 rounded-full text-xs font-bold">
                          {scholarship.alumList.length} sponsor
                          {scholarship.alumList.length !== 1 ? "s" : ""}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Summary - Right Side */}
        <div className="lg:w-1/3 lg:min-w-[320px]">
          <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-1 border-b border-gray-100">
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto h-195">
              <div className="p-2 rounded-lg">
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
                    .map(
                      (scholarship: Scholarship) => scholarship.alumList.length
                    )
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
                              (alum) =>
                                `${alum.firstName} ${alum.lastName}` === a
                            )?.alumniId
                        ).length;
                        const countB = scholarshipStudents.filter(
                          (student) =>
                            student.alumId ===
                            alumList.find(
                              (alum) =>
                                `${alum.firstName} ${alum.lastName}` === b
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Charts Section - Full Width at Bottom */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Top Scholarships by Sponsor Count
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>

        <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Top Sponsors by Scholar Count
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScholarshipReports;
