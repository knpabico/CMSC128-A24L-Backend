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
// import { useEffect, useState } from "react";

// this table will only render the data in the specified page
export async function UsersTable({
  page = 1,
  regStatus = undefined,
  sort = undefined,
}: {
  page?: number;
  regStatus?: RegStatus | undefined;
  sort?: string | undefined;
}) {
  console.log(sort);
  let response;
  if (regStatus) {
    // query users (alumni) data
    response = await getAlumni({
      filters: {
        regStatus,
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
              <TableHead>Registration Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* create a row in the table for each user/alumni */}
            {data.map((alumni) => {
              return (
                <TableRow key={alumni.id}>
                  <TableCell>
                    {alumni.lastName}, {alumni.firstName}
                  </TableCell>
                  <TableCell>{alumni.email}</TableCell>
                  <TableCell>{alumni.studentNumber}</TableCell>
                  <TableCell>{alumni.regStatus}</TableCell>
                  <TableCell className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Trash2Icon />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings />
                    </Button>
                    <Button variant="outline" size="sm">
                      <EyeIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          {/* pagination buttons */}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button key={i} asChild variant="outline" className="mx-1">
                    {/* put a search param in the url indicating the page, and navigate to it */}
                    <Link
                      href={`/admin-dashboard/manage-users?page=${i + 1}${
                        regStatus ? `&status=${regStatus}` : ""
                      }${sort && sort !== "d" ? `&sort=${sort}` : ""}`}
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
