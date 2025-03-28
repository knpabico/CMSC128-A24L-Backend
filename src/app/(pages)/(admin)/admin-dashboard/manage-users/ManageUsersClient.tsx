"use client";

import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { redirect, useRouter, useSearchParams } from "next/navigation";

const title = "Manage Users";

const sortTypes = [
  "DEFAULT",
  "SURNAME (ASC)",
  "SURNAME (DESC)",
  "APPROVED - REJECTED",
  "REJECTED - APPROVED",
];
const sortValues = ["d", "sa", "sd", "ar", "ra"];
// retrieve the search params which will be used for the pagination of the table
export default function ManageUsersClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page"); //get current page param
  const status = searchParams.get("status"); //get current status param
  const sort = searchParams.get("sort"); //get current sort param
  const router = useRouter();

  //function for handling change on sort type
  function handleChange(sortType: string) {
    let sorting = sortType && sortType !== "d" ? `&sort=${sortType}` : "";

    //will push the parameters to the url
    router.push(
      `${page ? `?page=${page}` : "?page=1"}${
        status ? `&status=${status}` : ""
      }${sorting}`
    );
  }

  //function for getting the defaultValue for the sort by dropdown using the current query
  function getDefaultSort(): string {
    let defaultSort = "d";
    for (let i = 0; i < sortValues.length; i++) {
      if (sortValues[i] === sort) {
        defaultSort = sortValues[i]; //find its index in the sortValues array
        break;
      }
    }

    //return default value
    return defaultSort;
  }

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

      {/*sorting dropdown*/}
      <div>
        <div className="flex">
          <h1>Sort by:</h1>
          <div>
            <select
              id="surname-sort"
              className="outline rounded-xs ml-2"
              defaultValue={getDefaultSort()}
              onChange={(e) => {
                handleChange(e.target.value);
              }}
            >
              {sortTypes.map((sortType, index) => (
                <option key={index} value={sortValues[index]}>
                  {sortType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/*UsersTable*/}
      {children}

      <div className="flex justify-center gap-5 mt-5">
        <a
          className="text-blue-500 underline"
          href={`/admin-dashboard/manage-users?page=1${
            sort && sort !== "d" ? `&sort=${sort}` : ""
          }`}
        >
          All
        </a>
        <a
          className="text-blue-500 underline"
          href={`/admin-dashboard/manage-users?page=1&status=pending${
            sort && sort !== "d" ? `&sort=${sort}` : ""
          }`}
        >
          pending
        </a>
        <a
          className="text-blue-500 underline"
          href={`/admin-dashboard/manage-users?page=1&status=rejected${
            sort && sort !== "d" ? `&sort=${sort}` : ""
          }`}
        >
          rejected
        </a>
        <a
          className="text-blue-500 underline"
          href={`/admin-dashboard/manage-users?page=1&status=approved${
            sort && sort !== "d" ? `&sort=${sort}` : ""
          }`}
        >
          approved
        </a>
      </div>
    </>
  );
}
