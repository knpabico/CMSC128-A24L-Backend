import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const links = [
  { label: " Manage Users", link: "manage-users" },
  { label: "Organize Events", link: "organize-events" },
  { label: "Send Newsletters", link: "send-newsletters" },
  { label: "Monitor Engagement Metrics", link: "engagement-metrics" },
  { label: "Site Settings", link: "site-settings" },
];

export default async function AdminDashboard() {
  return (
    <>
      <Breadcrumbs
        items={[
          {
            label: "Dashboard",
          },
        ]}
      />  

      {/* page title */}
      <h1 className="text-4xl font-bold my-6">Admin Dashboard</h1>

      {/* temporary buttons */}
      {/* create a button for each admin-control link */}
      <div className="flex flex-col gap-4">

      {links.map((item, i) => (
        <Button asChild key={i} className="text-lg h-14">
          <Link href={`/admin-dashboard/${item.link}`}>{item.label}</Link>
        </Button>
      ))}
      </div>
    </>
  );
}
