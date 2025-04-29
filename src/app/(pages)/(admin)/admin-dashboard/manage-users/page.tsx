"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActionButtons } from "@/components/UserActionButtons";
import { useAlums } from "@/context/AlumContext";
import { Alumnus } from "@/models/models";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown, X, Loader2 } from "lucide-react";

const Page = () => {
  const { alums, isLoading } = useAlums();
  const [activeTab, setActiveTab] = useState("Pending");
  const [activeStatus, setActiveStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const filterAlums = (regStatus: string, actStatus: string) => {
    let filtered = alums.filter(
      (alumni: Alumnus) => alumni.regStatus === regStatus
    );

    // Apply active status filter if one is selected
    if (actStatus === "Active") {
      filtered = filtered.filter(
        (alumni: Alumnus) => alumni.activeStatus === true
      );
    } else if (actStatus === "Inactive") {
      filtered = filtered.filter(
        (alumni: Alumnus) => alumni.activeStatus === false
      );
    }

    return filtered;
  };

  const clearActiveStatusFilter = () => {
    setActiveStatus("");
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const sortAlums = (filteredAlums: Alumnus[]) => {
    return [...filteredAlums].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          const aFullName = `${a.lastName}, ${a.firstName}`.toLowerCase();
          const bFullName = `${b.lastName}, ${b.firstName}`.toLowerCase();
          comparison = aFullName.localeCompare(bFullName);
          break;
        case "studentNumber":
          comparison = a.studentNumber.localeCompare(b.studentNumber);
          break;
        case "dateCreated":
          if (a.createdDate && b.createdDate) {
            comparison =
              a.createdDate.toDate().getTime() -
              b.createdDate.toDate().getTime();
          }
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const filteredAlums = filterAlums(activeTab.toLowerCase(), activeStatus);
  const sortedAlums = sortAlums(filteredAlums);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Alumni Management</h1>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <div className="mr-4">
            <p className="text-sm text-gray-600 mb-1">Registration Status</p>
            <div className="flex gap-2">
              {["Pending", "Approved", "Rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Active Status</p>
            <div className="flex gap-2 items-center">
              {["Active", "Inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setActiveStatus(status === activeStatus ? "" : status)
                  }
                  className={`px-4 py-2 rounded-md ${
                    activeStatus === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
              {activeStatus && (
                <button
                  onClick={clearActiveStatusFilter}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  title="Clear filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="studentNumber">Student Number</SelectItem>
              <SelectItem value="dateCreated">Date Created</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={toggleSortDirection}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            {sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Display active filters */}
      <div className="mb-4">
        {activeStatus && (
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mr-2">
            {activeStatus}
            <button onClick={clearActiveStatusFilter} className="ml-1">
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      {sortedAlums.length === 0 ? (
        isLoading ? (
          <div className=" justify-center py-12 rounded-md bg-gray-50">
            <div className="text-center py-12 rounded-md">
              <p className="text-gray-500">
                <Loader2 className="animate-spin w-6 h-6 mx-auto" />
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-md">
            <p className="text-gray-500">
              No {activeStatus ? activeStatus.toLowerCase() + " " : ""}
              {activeTab.toLowerCase()} alumni records found.
            </p>
          </div>
        )
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Showing {sortedAlums.length}{" "}
            {activeStatus ? activeStatus.toLowerCase() + " " : ""}
            {activeTab.toLowerCase()} alumni records
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student Number</TableHead>
                  <TableHead>Graduation Year</TableHead>
                  <TableHead>Active Status</TableHead>
                  <TableHead>Registration Status</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAlums.map((alumni: Alumnus, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      {alumni.lastName}, {alumni.firstName}
                    </TableCell>
                    <TableCell>{alumni.email}</TableCell>
                    <TableCell>{alumni.studentNumber}</TableCell>
                    <TableCell>{alumni.graduationYear}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          alumni.activeStatus
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {alumni.activeStatus ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          alumni.regStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : alumni.regStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {alumni.regStatus.charAt(0).toUpperCase() +
                          alumni.regStatus.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {alumni.createdDate
                        ? alumni.createdDate
                            .toDate()
                            .toISOString()
                            .slice(0, 10)
                            .replaceAll("-", "/")
                        : ""}
                    </TableCell>
                    <TableCell>
                      <UserActionButtons
                        alumniEmail={alumni.email}
                        alumniId={alumni.alumniId}
                        alumniName={`${alumni.firstName} ${alumni.lastName}`}
                        regStatus={alumni.regStatus}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
