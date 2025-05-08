/* Card components for formatting muna, comments on where to put the data is in each part of the card n rin.
Di ko muna inalis yung buttons to each button since di pa okay routing ng navbar
*/
"use client";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import MapComponent from "./google-maps/map";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { WorkExperience } from "@/models/models";

const adminLinks = [
  { label: "Manage Users", link: "manage-users" },
  { label: "Organize Events", link: "organize-events" },
  { label: "Create Announcement", link: "create-announcements" },
  { label: "Job Postings", link: "job-postings" },
  { label: "Send Newsletters", link: "send-newsletters" },
  { label: "Create Donation Drive", link: "donation-drive" },
  { label: "Monitor Engagement Metrics", link: "engagement-metrics" },
  { label: "Site Settings", link: "site-settings" },
  { label: "Statistical Reports", link: "alum-statistical-reports" },
  { label: "Manage Scholarships", link: "scholarships/manage" },
  { label: "Add Scholarships", link: "scholarships/add" },
  { label: "View Pending Scholarships", link: "scholarships/pending" },
  { label: "Write story", link: "create-story" },
];

export default function AdminDashboard() {
  // Get work experience list from context
  const { allWorkExperience, isLoading, fetchWorkExperience } =
    useWorkExperience();
  console.log(allWorkExperience, "workexperience");

  const presentWorkExperiences = allWorkExperience.filter(
    (exp: WorkExperience) => exp.endYear === "present"
  );
  return (
    <div className="p-6 w-full">
      <Breadcrumbs
        items={[
          {
            label: "Dashboard",
          },
        ]}
      />

      {/* Page title */}
      <h1 className="text-3xl font-bold my-6">Admin Dashboard</h1>

      {/* Admin control buttons */}
      <div className="flex flex-col gap-4 mb-6">
        {adminLinks.map((item, i) => (
          <Button asChild key={i} className="text-lg h-14">
            <Link href={`/admin-dashboard/${item.link}`}>{item.label}</Link>
          </Button>
        ))}
      </div>

      {/* Information Cards*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Alumni Card */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pie chart ??? 
              Needed data:
                - Ilan ang total alumni sa system
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
            {/* Pie chart !
              Count ng alumni per industry */}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Event Proposals
        To Fix: border between the card title and the line seperator ay dapat mas malapit (chan gagawa)*/}
        <Card className="border-0 shadow-md flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Event Proposals</CardTitle>
          </CardHeader>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
          </div>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="max-h-60">
              {/* Pending event proposals data palagay here tnx po. Dapat kaya maopen yung full details (overlay not page)
              Contents:
                - Event name
                - Date
                - Event venue
              */}
            </div>
          </CardContent>

          {/* To fix: icenter yung text button (chan gagawa)*/}
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
            <div className="text-center">
              <Link
                href="/admin-dashboard/organize-events"
                className="text-black-600 hover:underline text-sm"
              >
                View all event proposals
              </Link>
            </div>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-md flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
          </div>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="max-h-60">
              {/* Lagay upcoming events data here tnx po. Dapat kaya maopen yung full details (overlay not page)
              Contents:
                - Event name
                - Date
                - Event venue
              */}
            </div>
          </CardContent>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
            <div className="text-center">
              <Link
                href="/admin-dashboard/organize-events"
                className="text-black-600 hover:underline text-sm"
              >
                View all events
              </Link>
            </div>
          </div>
        </Card>

        {/* Donations */}
        <Card className="border-0 shadow-md flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Donations</CardTitle>
          </CardHeader>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
          </div>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="max-h-60">
              {/* Recent donation received. Maybe a routing na maoopen yung page nung mismong donation idk
              Contents:
                - amount
                - Name of donator
                - name of donation drive? basta kung san siya nagdonate lmao
              */}
            </div>
          </CardContent>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
            <div className="text-center">
              <Link
                href="/admin-dashboard/donation-drive"
                className="text-black-600 hover:underline text-sm"
              >
                View all donations
              </Link>
            </div>
          </div>
        </Card>

        {/* Scholarship Grants */}
        <Card className="border-0 shadow-md flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Scholarship Grants</CardTitle>
          </CardHeader>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
          </div>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="max-h-60">
              {/* List of recent applicants sa scholarship. Dapat kaya maopen yung full details like kasama contact info nila (overlay not page)
              Contents:
                - Alumni Name
                - Scholarship title
              */}
            </div>
          </CardContent>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
            <div className="text-center">
              <Link
                href="/admin-dashboard/manage-scholarships"
                className="text-black-600 hover:underline text-sm"
              >
                View all scholarships
              </Link>
            </div>
          </div>
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
              <MapComponent workExperienceList={presentWorkExperiences} />
            </CardContent>
          </Card>
        </div>

        {/* Job Posting */}
        <div className="md:col-span-3">
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-0">
              <CardTitle>Job Posting</CardTitle>
            </CardHeader>
            <div className="px-2 pt-0">
              <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
            </div>

            <CardContent>
              {/* Pending job postings. Dapat kaya maopen yung full details (overlay not page)
              Contents:
                - Job title
                - Company
                - Employment type
              */}
            </CardContent>
            <div className="px-2 pt-0">
              <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
              <div className="text-center">
                <Link
                  href="/admin-dashboard/job-postings"
                  className="text-black hover:underline text-sm"
                >
                  View all pending job postings
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
