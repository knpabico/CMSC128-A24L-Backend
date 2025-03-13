import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { UsersTable } from "./UsersTable";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation';
import { RegStatus } from "@/types/alumni/regStatus";
import Link from "next/link";

const title = "Manage Users";

// retrieve the search params which will be used for the pagination of the table
export default async function ManageUsers({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const searchParamsValue = await searchParams;
  // get the value of the page property in the query param/string
  const page = searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1;
  const status: RegStatus | undefined = searchParamsValue?.status
    ? searchParamsValue.status
    : undefined;

  return (
    <>
      <Breadcrumbs
        items={[
          {
            href: "/admin-dashboard",
            label: "Dashboard",
          },
          {
            label: title,
          },
        ]}
      />

      <h1 className="text-4xl font-bold my-6">{title}</h1>

      {/* users table */}
      <UsersTable page={page} regStatus={status} />

      <div className="flex justify-center gap-5 mt-5">
      <a className="text-blue-500 underline" href='/admin-dashboard/manage-users?page=1'>All</a>
      <a className="text-blue-500 underline" href='/admin-dashboard/manage-users?page=1&status=pending'>pending</a>
      <a className="text-blue-500 underline" href='/admin-dashboard/manage-users?page=1&status=rejected'>rejected</a>
      <a className="text-blue-500 underline" href='/admin-dashboard/manage-users?page=1&status=approved'>approved</a>
      </div>
    </>
  );
}
