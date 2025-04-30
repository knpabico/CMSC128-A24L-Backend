/* Card components for formatting muna, comments on where to put the data is in each part of the card n rin.
Di ko muna inalis yung buttons to each button since di pa okay routing ng navbar
*/

import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";


const adminLinks = [
  { label: "Manage Users", link: "manage-users" },
  { label: "Organize Events", link: "organize-events" },
  { label: "Create Announcement", link: "create-announcements" },
  { label: "Job Postings", link: "job-postings" },
  { label: "Send Newsletters", link: "send-newsletters" },
  { label: "Create Donation Drive", link: "donation-drive" },
  { label: "Monitor Engagement Metrics", link: "engagement-metrics" },
  { label: "Site Settings", link: "site-settings" },
  { label: "Statistical Reports", link: "statistical-reports" },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 w-full">
      <Breadcrumbs
        items={[
          {
            label: "Dashboard",
          },
        ]}
      />

      {/* Page title: will be removed */}
      <h1 className="text-3xl font-bold my-6">Admin Dashboard</h1>

      {/* Admin control buttons: will be removed*/}
      <div className="flex flex-col gap-4 mb-6">
        {adminLinks.map((item, i) => (
          <Button asChild key={i} className="text-lg h-14">
            <Link href={`/admin-dashboard/${item.link}`}>{item.label}</Link>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Alumni Card */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            {/* - Ilan ang total alumni sa system
                - Active alumni count
                - Pending alumni count pati data na pwede iroute dun sa pag accept/reject
            */}
          </CardContent>
        </Card>

        {/* Industries Card */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Industries</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Count ng alumni per industry */}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Event Proposals */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Event Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pending proposals ng event */}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {/* upcoming events */}
          </CardContent>
        </Card>

        {/* Donations */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Open Donations ata here */}
          </CardContent>
        </Card>

        {/* Scholarship Grants */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Scholarship Grants</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Open Scholarships ata ilalagay na data here */}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-6 mt-6">
        <div className="md:col-span-7">
          {/* Map */}
          <Card className="border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle>Map of Current Companies</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lagay map na may pin ng lahat ng current company ng mga alumni*/}
            </CardContent>
          </Card>
        </div>
        
        {/* Job Posting */}
        <div className="md:col-span-3">
          <Card className="border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle>Job Posting</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pending job postings */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}