import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alumnus } from "@/models/models";
import { RegStatus } from "@/types/alumni/regStatus";
import {
  DeleteIcon,
  EyeIcon,
  PencilIcon,
  Settings,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { getAlumni } from "@/data/alumni";
import { UserActionButtons } from "@/components/UserActionButtons";
// import { useEffect, useState } from "react";

// this table will only render the data in the specified page
export async function UsersTable({
  page = 1,
  regStatus = undefined,
  aStatus = undefined,
  yearGraduated = undefined,
  studentNumber = undefined,
  sort = undefined,
}: {
  page?: number;
  regStatus?: RegStatus | undefined;
  aStatus?: string | undefined;
  yearGraduated?: string | undefined;
  studentNumber?: string | undefined;
  sort?: string | undefined;
}) {
  let response;
  if (regStatus || aStatus || yearGraduated || studentNumber) {
    // query users (alumni) data
    response = await getAlumni({
      filters: {
        regStatus,
        aStatus,
        yearGraduated,
        studentNumber,
      },
      pagination: {
        page,
        pageSize: 3,
      },
      sorting: {
        sort,
      },
    });
  } else {
    response = await getAlumni({
      pagination: {
        page,
        pageSize: 3,
      },
      sorting: {
        sort,
      },
    });
  }

  const { data, totalPages } = response;

  return (
    <>
      {!data ? (
        // if there is no data, then display a message
        <h1 className="text-center text-zinc-400 py-20 font-bold text-3xl">
          No alumni data in database
        </h1>
      ) : (
        // else, show the properties table
        <Table className="mt-5">
          <TableHeader>
            <TableRow>
              {/* table headers */}
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Student Number</TableHead>
              <TableHead>Graduation Year</TableHead>
              <TableHead>Active Status</TableHead>
              <TableHead>Registration Status</TableHead>
              <TableHead>Approval Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* create a row in the table for each user/alumni */}
            {data.map((alumni) => {
              return (
                <TableRow key={alumni.alumniId}>
                  <TableCell>
                    {alumni.lastName}, {alumni.firstName}
                  </TableCell>
                  <TableCell>{alumni.email}</TableCell>
                  <TableCell>{alumni.studentNumber}</TableCell>
                  <TableCell>{alumni.graduationYear}</TableCell>
                  <TableCell>
                    {alumni.activeStatus ? "active" : "inactive"}
                  </TableCell>
                  <TableCell>{alumni.regStatus}</TableCell>
                  <TableCell>
                    {alumni.approvalDate
                      ? alumni.approvalDate
                          .toDate()
                          .toISOString()
                          .slice(0, 10)
                          .replaceAll("-", "/")
                      : ""}
                  </TableCell>
                  <TableCell className="flex gap-3">
                    <UserActionButtons
                      alumniEmail={alumni.email}
                      alumniId={alumni.alumniId}
                      alumniName={`${alumni.firstName} ${alumni.lastName}`}
                    ></UserActionButtons>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          {/* pagination buttons */}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button key={i} asChild variant="outline" className="mx-1">
                    {/* put a search param in the url indicating the page, and navigate to it */}
                    <Link
                      href={`/admin-dashboard/manage-users?page=${i + 1}${
                        regStatus ? `&status=${regStatus}` : ""
                      }${aStatus ? `&astatus=${aStatus}` : ""}${
                        yearGraduated ? `&yg=${yearGraduated}` : ""
                      }${studentNumber ? `&sn=${studentNumber}` : ""}${
                        sort && sort !== "d" ? `&sort=${sort}` : ""
                      }`}
                    >
                      {i + 1}
                    </Link>
                  </Button>
                ))}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </>
  );
}
