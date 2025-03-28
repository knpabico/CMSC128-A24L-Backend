import { RegStatus } from "@/types/alumni/regStatus";
import ManageUsersClient from "./ManageUsersClient";
import { UsersTable } from "./UsersTable";

export default async function ManageUsers({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const searchParamsValue = await searchParams;
  const page = searchParamsValue?.page ? parseInt(searchParamsValue?.page) : 1;
  const status: RegStatus | undefined = searchParamsValue?.status
    ? searchParamsValue.status
    : undefined;
  const sort = searchParamsValue?.sort ? searchParamsValue?.sort : undefined;

  return (
    <ManageUsersClient>
      <UsersTable page={page} regStatus={status} sort={sort}></UsersTable>
    </ManageUsersClient>
  );
}
