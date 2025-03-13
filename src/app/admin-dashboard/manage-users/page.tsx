import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { UsersTable } from "./UsersTable";

const title = 'Manage Users';

export default function ManageUsers() {

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

      {/* page title */}
      <h1 className="text-4xl font-bold my-6">{title}</h1>

      {/* users table */}
      <UsersTable />
    </>
  );
}
