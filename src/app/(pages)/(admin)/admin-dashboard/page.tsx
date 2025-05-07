/* Card components for formatting muna, comments on where to put the data is in each part of the card n rin.
Di ko muna inalis yung buttons to each button since di pa okay routing ng navbar
*/
"use client"
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import MapComponent from "./google-maps/map";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience,Event, Donation } from "@/models/models";
import { useEvents } from "@/context/EventContext";
import { useDonationContext } from "@/context/DonationContext";
import DonutChart from "@/components/charts/DonutChart";
import React, {useState} from "react";
import AlumniDetailsModal from '@/components/ui/ActivateAlumniDetails';


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
  { label: "Write story", link: "create-story" },
];

export default function AdminDashboard() {
  // Get work experience list from context
  const { allWorkExperience, isLoading, fetchWorkExperience } = useWorkExperience();
  const {totalAlums,alums, getActiveAlums, getInactiveAlums, updateAlumnusActiveStatus} = useAlums();
  const { events, getEventProposals, getUpcomingEvents } = useEvents(); 
  // const { allDonations } = useDonationContext();


  const fields = [
    "Artificial Intelligence (AI)",
    "Machine Learning (ML)",
    "Data Science",
    "Cybersecurity",
    "Software Engineering",
    "Computer Networks",
    "Computer Graphics and Visualization",
    "Human-Computer Interaction (HCI)",
    "Theoretical Computer Science",
    "Operating Systems",
    "Databases",
    "Web Development",
    "Mobile Development",
    "Cloud Computing",
    "Embedded Systems",
    "Robotics",
    "Game Development",
    "Quantum Computing",
    "DevOps and System Administration",
    "Information Systems",
    "Others"
  ];
  
  //Colors 
  const colorPalette = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
    "#FF9F40", "#B4FF9F", "#D4A5A5", "#6D9DC5", "#E57F84",
    "#7C83FD", "#00C49F", "#FFBB28", "#FF8042", "#8DD1E1",
    "#8884D8", "#A28CFF", "#FF7F50", "#87CEEB", "#FFA07A", "#B0E0E6"
  ];

  const getColorForField = (field: string, index: number): string => {
    return colorPalette[index % colorPalette.length];
  };

  const getFieldInterestCounts = (alums: Alumnus[]) => {
    const counts: Record<string, number> = {}; //rereturn ito like this 
                                              // [<field> count]
    
    
    fields.forEach(field => {
      counts[field] = 0;
    });
  
    // Count occurrences
    alums.forEach(alum => {
      alum.fieldOfInterest?.forEach(field => {
        if (counts.hasOwnProperty(field)) {
          counts[field]++;
        } else {
          counts["Others"]++; 
        }
      });
    });
    
    return counts;
  };
  
  const fieldCounts = getFieldInterestCounts(alums);
  console.log(alums, "alumnis", getActiveAlums(alums));

  const presentWorkExperiences = allWorkExperience.filter(
    (exp:WorkExperience) => exp.endYear === "present"
  );

  //Activate Alum 
    // Add these new states for the modal
    const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    // Function to handle opening the modal
    const handleOpenModal = (alumnus: Alumnus) => {
      setSelectedAlumnus(alumnus);
      setIsModalOpen(true);
    };
  
    // Function to handle closing the modal
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };
  
    // Function to toggle active status
    const handleToggleActiveStatus = (alumniId: string, newStatus: boolean) => {
      // Call your context function to update the status
      updateAlumnusActiveStatus(alumniId, newStatus);
      
      // Update the local state if needed
      if (selectedAlumnus && selectedAlumnus.alumniId === alumniId) {
        setSelectedAlumnus({
          ...selectedAlumnus,
          activeStatus: newStatus
        });
      }
    };
  
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
          <p>Total Alums: {totalAlums}</p>
          <p>Active Alums: {getActiveAlums(alums).length}</p>
          <p>Inactive Alums: {getInactiveAlums(alums).length}</p>
          
          <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-semibold text-gray-700">
                Active vs Pending Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0">
              <DonutChart
                labels={["Active", "Pending"]}
                data={[
                  getActiveAlums(alums).length,
                  getInactiveAlums(alums).length,
                ]}
              />
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Alumni List</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alums.map((alum: Alumnus) => (
                <div 
                  key={alum.alumniId}
                  onClick={() => handleOpenModal(alum)}
                  className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{alum.lastName}, {alum.firstName} {alum.middleName}</span>
                    <p className="text-sm text-gray-500">{alum.studentNumber || 'No Student ID'}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${alum.activeStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {alum.activeStatus ? 'Active' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Add the modal component */}
          <AlumniDetailsModal
            alumnus={selectedAlumnus}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onToggleActiveStatus={handleToggleActiveStatus}
          />
          
        </CardContent>
      </Card>
 {/* Industries Card */}
<Card className="border-0 shadow-md">
  <CardHeader>
    <CardTitle>Industries</CardTitle>
  </CardHeader>
  <CardContent>
    {/* summary stats, just like Alumni */}
    <p>Total Fields: {Object.keys(fieldCounts).length}</p>
    <p>Total Alumni Counted: {Object.entries(fieldCounts).reduce((sum, [, c]) => sum + c, 0)}</p>
    <p>Distinct Industries: {Object.keys(fieldCounts).filter(f => fieldCounts[f] > 0).length}</p>

    {/* inner chart card */}
    <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all my-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg font-semibold text-gray-700">
          Distribution by Industry
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pt-0">
        <DonutChart
          labels={Object.entries(fieldCounts).map(([field]) => field)}
          data={Object.entries(fieldCounts).map(([_, count]) => count)}
          backgroundColor={Object.entries(fieldCounts).map(
            ([field], i) => getColorForField(field, i)
          )}
        />
      </CardContent>
    </Card>

    {/* list of industries like Alumni List */}
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Industry Breakdown</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {Object.entries(fieldCounts).map(([field, count], idx) => (
          <div
            key={field}
            className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-default flex items-center justify-between"
          >
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getColorForField(field, idx) }}
              />
              <span className="font-medium">{field}</span>
            </div>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
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
            {getEventProposals(events).map((event:Event, index:number)=>{
              return (
                <div key={event.eventId}>
                <div>
                  <span>Event: {event.title}</span>
                </div>
                <span>Status: {event.status}</span>
                </div>
              )
            })}
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
             {getUpcomingEvents(events).map((event:Event, index:number)=>{
              return (
                <div key={event.eventId}>
                <div>
                  <span>Event: {event.title}</span>
                </div>
                <span>Status: {event.status}</span>
                </div>
              )
            })}             
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
             {/* {allDonations.map((donation:Donation, index:number)=>{
              return (
                <div key={donation.donationId}>
                <div>
                  <span>Event: {donation.amount}</span>
                </div>
                <span>Status: {event.status}</span>
                </div>
              )
            })}                */}
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
              <MapComponent workExperienceList={presentWorkExperiences}/>
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
