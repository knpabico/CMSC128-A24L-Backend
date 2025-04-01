import { RegStatus } from "@/types/alumni/regStatus";
import ManageUsersClient from "./ManageUsersClient";
import { UsersTable } from "./UsersTable";

export default async function ManageUsers({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  //query parameters
  const searchParamsValue = await searchParams;

  //filter params
  const page = searchParamsValue?.page ? parseInt(searchParamsValue?.page) : 1;
  const status: RegStatus | undefined = searchParamsValue?.status
    ? searchParamsValue.status
    : undefined;
  const aStatus = searchParamsValue?.astatus
    ? searchParamsValue?.astatus
    : undefined;

  const yearGraduated = searchParamsValue?.yg
    ? searchParamsValue?.yg
    : undefined;

  //sorting params
  const sort = searchParamsValue?.sort ? searchParamsValue?.sort : undefined;

  return (
    <ManageUsersClient>
      <UsersTable
        page={page}
        regStatus={status}
        sort={sort}
        aStatus={aStatus}
        yearGraduated={yearGraduated}
      ></UsersTable>
    </ManageUsersClient>
  );
}
