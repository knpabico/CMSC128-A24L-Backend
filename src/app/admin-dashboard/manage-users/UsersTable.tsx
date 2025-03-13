import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAlumni } from "@/data/alumni";
import { DeleteIcon, EyeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";

// this table will only render the data in the specified page
export async function UsersTable({ page = 1 }: { page?: number }) {
  // query users (alumni) data
  const {data, totalPages} = await getAlumni({
    pagination: {
      page,
      pageSize: 3,
    }
  });

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
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* create a row in the table for each user/alumni */}
            {data.map(alumni => {
              return (
                <TableRow key={alumni.id}>
                  <TableCell>{alumni.name}</TableCell>
                  <TableCell>{alumni.email}</TableCell>
                  <TableCell>{alumni.studentNumber}</TableCell>
                  <TableCell>{alumni.regStatus}</TableCell>
                  <TableCell>
                    <Button asChild variant='outline' size='sm'>
                        <DeleteIcon />
                    </Button> /
                    <Button asChild variant='outline' size='sm'>
                        <EyeIcon />
                    </Button> / 
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
                    <Link href={`/admin-dashboard/manage-users?page=${i + 1}`}>{i + 1}</Link>
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
