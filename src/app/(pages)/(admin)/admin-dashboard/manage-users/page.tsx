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
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import Breadcrumb from "@/components/breadcrumb";

const Page = () => {
  const tableRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const { alums } = useAlums();
  const [activeTab, setActiveTab] = useState("Pending");
  const [activeStatus, setActiveStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const filterAlums = (regStatus: string, actStatus: string) => {
    let filtered = alums.filter(
      (alumni: Alumnus) => alumni.regStatus === regStatus
    );

    if (actStatus === "all") {
      return filtered;
    } else if (actStatus === "active") {
      filtered = filtered.filter(
        (alumni: Alumnus) => alumni.activeStatus === true
      );
    } else if (actStatus === "inactive") {
      filtered = filtered.filter(
        (alumni: Alumnus) => alumni.activeStatus === false
      );
    }

    return filtered;
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
            // Check if createdDate is a Firestore timestamp or a Date object
            const aTime =
              a.createdDate instanceof Date
                ? a.createdDate.getTime()
                : typeof a.createdDate === "object" &&
                  a.createdDate !== null &&
                  "seconds" in a.createdDate
                ? new Date(
                    (a.createdDate as { seconds: number }).seconds * 1000
                  ).getTime()
                : new Date(a.createdDate).getTime();
            const bTime =
              b.createdDate instanceof Date
                ? b.createdDate.getTime()
                : typeof b.createdDate === "object" &&
                  b.createdDate !== null &&
                  "seconds" in b.createdDate
                ? new Date(
                    (b.createdDate as { seconds: number }).seconds * 1000
                  ).getTime()
                : new Date(b.createdDate).getTime();
            comparison = aTime - bTime;
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
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current as HTMLElement;
      const rect = tableRect.getBoundingClientRect();

      if (rect.top <= 0 && !isSticky) {
        setIsSticky(true);
      } else if (rect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky]);

  useEffect(() => {
    const counts = {
      Pending: alums.filter((alum: Alumnus) => alum.regStatus === "pending")
        .length,
      Approved: alums.filter((alum: Alumnus) => alum.regStatus === "approved")
        .length,
      Rejected: alums.filter((alum: Alumnus) => alum.regStatus === "rejected")
        .length,
    };
    setStatusCounts(counts);
  }, [alums]);

  const breadcrumbItems = [
    { label: "Home", href: "/admin-dashboard" },
    { label: "Manage Alumni", href: "#", active: true },
  ];

  return (
    <div className="flex flex-col gap-5">
      <title>Manage Users | ICS-ARMS</title>
      <Breadcrumb items={breadcrumbItems} />
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Alumni Management</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="w-full flex gap-2">
          {["Pending", "Approved", "Rejected"].map((status) => (
            <div
              key={status}
              onClick={() => setActiveTab(status)}
              className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                activeTab === status ? "bg-[var(--primary-blue)]" : "bg-white"
              }`}
            >
              <div
                className={`w-full h-1 transition-colors ${
                  activeTab === status
                    ? "bg-[var(--primary-blue)]"
                    : "bg-transparent"
                }`}
              ></div>
              <div
                className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                  activeTab === status
                    ? "text-[var(--primary-blue)] bg-white"
                    : "text-blue-200 bg-white"
                }`}
              >
                {status}
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                    activeTab === status && status === "Pending"
                      ? "bg-amber-400"
                      : activeTab === status && status === "Approved"
                      ? "bg-green-400"
                      : activeTab === status && status === "Rejected"
                      ? "bg-red-400"
                      : activeTab !== status && status === "Pending"
                      ? "bg-amber-100"
                      : activeTab !== status && status === "Approved"
                      ? "bg-green-100"
                      : activeTab !== status && status === "Rejected"
                      ? "bg-red-100"
                      : "bg-blue-200"
                  }`}
                >
                  {statusCounts[status as keyof typeof statusCounts]}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl flex p-2.5 px-4 items-center justify-between">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="text-sm text-[var(--primary-blue)]">
                Filter by:
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="appearance-none px-4 py-2 text-[var(--primary-blue)] border-2 border-[var(--primary-blue)] rounded-full flex items-center text-sm font-medium cursor-pointer">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent className="bg-white border-none">
                  <SelectItem
                    value="name"
                    className="text-xs hover:bg-gray-100 cursor-pointer"
                  >
                    Name
                  </SelectItem>
                  <SelectItem
                    value="studentNumber"
                    className="text-xs hover:bg-gray-100 cursor-pointer"
                  >
                    Student Number
                  </SelectItem>
                  <SelectItem
                    value="dateCreated"
                    className="text-xs hover:bg-gray-100 cursor-pointer"
                  >
                    Date Created
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-[var(--primary-blue)]">
                Active Status:
              </div>
              <Select value={activeStatus} onValueChange={setActiveStatus}>
                <SelectTrigger className="appearance-none px-4 py-2 text-[var(--primary-blue)] border-2 border-[var(--primary-blue)] rounded-full flex items-center text-sm font-medium cursor-pointer">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent className="bg-white border-none">
                  <SelectItem
                    value="all"
                    className="text-xs hover:bg-gray-100 cursor-pointer"
                  >
                    All
                  </SelectItem>
                  <SelectItem
                    value="active"
                    className="text-xs hover:bg-gray-100 cursor-pointer"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    value="inactive"
                    className="text-xs hover:bg-gray-100 cursor-pointer"
                  >
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-[var(--primary-blue)]">Order:</div>
              <button
                onClick={toggleSortDirection}
                className="appearance-none px-4 py-2 text-[var(--primary-blue)] border-2 border-[var(--primary-blue)] rounded-full flex items-center text-sm font-medium cursor-pointer"
              >
                {sortDirection === "asc" ? (
                  <div>
                    <p>Ascending</p>
                  </div>
                ) : (
                  <div>
                    <p>Descending</p>
                  </div>
                )}
              </button>
            </div>
          </div>

          {activeStatus.toLowerCase() === "all" && sortedAlums.length > 1 && (
            <p className="text-sm text-gray-500">
              Showing all {sortedAlums.length} {activeTab.toLowerCase()} alumni
              records
            </p>
          )}
          {activeStatus.toLowerCase() !== "all" && sortedAlums.length > 1 && (
            <p className="text-sm text-gray-500">
              Showing {sortedAlums.length} {activeStatus.toLowerCase()} and{" "}
              {activeTab.toLowerCase()} alumni records
            </p>
          )}
          {activeStatus.toLowerCase() !== "all" && sortedAlums.length === 1 && (
            <p className="text-sm text-gray-500">
              Showing {sortedAlums.length} {activeStatus.toLowerCase()} and{" "}
              {activeTab.toLowerCase()} alumnus record
            </p>
          )}
          {activeStatus.toLowerCase() === "all" && sortedAlums.length === 1 && (
            <p className="text-sm text-gray-500">
              Showing {sortedAlums.length} {activeTab.toLowerCase()} alumnus
              record
            </p>
          )}
          {sortedAlums.length === 0 && (
            <p className="text-sm text-gray-500">
              No {activeTab.toLowerCase()} records found
            </p>
          )}
        </div>

        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          <div
            className="rounded-xl overflow-hidden border border-gray-300 relative"
            ref={tableRef}
          >
            <Table>
              <TableHeader
                // className={`bg-blue-100 text-xs z-10 shadow-sm ${isSticky ? 'fixed top-0' : ''}`}
                className="bg-blue-100 text-xs z-10 shadow-sm"
              >
                <TableRow className="border-none">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">
                    Student Number
                  </TableHead>
                  <TableHead className="font-semibold">Active Status</TableHead>
                  <TableHead className="font-semibold">Date Created</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>

              {/* {isSticky && <div style={{ height: '42px' }}></div>} */}

              <TableBody>
                {sortedAlums.map((alumni, index) => (
                  <TableRow
                    key={index}
                    className={`border-t border-gray-300 text-sm ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <TableCell>
                      {alumni.lastName}, {alumni.firstName}
                    </TableCell>
                    <TableCell>{alumni.email}</TableCell>
                    <TableCell>{alumni.studentNumber}</TableCell>
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
                    {/* <TableCell>
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
                    </TableCell> */}
                    <TableCell>{formatDate(alumni.createdDate)}</TableCell>
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
      </div>
    </div>
  );
};

export default Page;
