"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import MapComponent from "./google-maps/map";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience,Event, DonationDrive, Scholarship, JobOffering } from "@/models/models";
import { useEvents } from "@/context/EventContext";
import DonutChart from "@/components/charts/DonutChart";
import React, {useState} from "react";
import AlumniDetailsModal from '@/components/ui/ActivateAlumniDetails';
import { useDonationDrives } from "@/context/DonationDriveContext";
import { useScholarship } from "@/context/ScholarshipContext";
import { useJobOffer } from "@/context/JobOfferContext";
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  // Get work experience list from context
  const { allWorkExperience, isLoading, fetchWorkExperience } = useWorkExperience();
  const {totalAlums,alums, getActiveAlums, getInactiveAlums, updateAlumnusActiveStatus} = useAlums();
  const {donationDrives} = useDonationDrives();
  const { events, getEventProposals, getUpcomingEvents } = useEvents(); 
  const {scholarships} = useScholarship();
  const {jobOffers, handleAccept, handleReject, handlePending} = useJobOffer();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedJob, setSelectedJob] = useState<JobOffering | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  // const { allDonations } = useDonationContext();

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };
  
  const updateJobStatus = (jobId, newStatus) => {
    // In a real application, this would make an API call to update the job status
    console.log(`Updating job ${jobId} to status: ${newStatus}`);
    if (newStatus === "Active") {
      handleAccept(jobId); // or just handleAccept() depending on your function signature
    }else if (newStatus === "Pending"){
      handlePending(jobId);
    }else{
      handleReject(jobId);
    }
  
     
    closeModal();
    // Here you would typically update your state or refetch data
  };


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
    const [selectedEventProposal, setSelectedEventProposal] = useState<Event | null>(null);
    const [isModalEventProOpen, setIsModalEventProOpen] = useState(false);


  
    // Function to handle opening the modal
    const handleOpenModal = (alumnus: Alumnus) => {
      setSelectedAlumnus(alumnus);
      setIsModalOpen(true);
    };

    const handleOpenModalEventProposal = (event: Event) => {
      setSelectedEventProposal(event);
      setIsModalEventProOpen(true);
    };
        // Function to handle closing the modal
    const handleCloseEventProposalModal = () => {
      setIsModalEventProOpen(false);
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
    <div className="p-2 w-full">
      {/* Page title */}
      <h1 className="text-3xl font-bold my-6">Admin Dashboard</h1>

      {/* Information Cards*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Alumni Card */}
        <Card className="border-0 shadow-md bg-white w-full">
          <CardHeader>
            <CardTitle>Alumni</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 w-full px-4 py-6">
          {/* Alumni Stats*/}
          <div className="w-full flex flex-col md:flex-row gap-6 items-start">
            
            {/* Chart */}
            <div className="w-full md:w-2/3 flex justify-center items-center">
              <div className="w-60 h-60">
                <DonutChart
                  labels={["Active", "Inactive"]}
                  data={[getActiveAlums(alums).length, getInactiveAlums(alums).length]}
                  backgroundColor={["#87CEEB", "#B0E0E6"]}
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Stats Column */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="rounded-md shadow-md p-4 text-center bg-white w-full">
                <div className="text-sm text-gray-500 mb-1">Total</div>
                <div className="text-2xl font-bold">{totalAlums}</div>
              </div>
              <div className="rounded-md shadow-md p-4 text-center bg-white w-full">
                <div className="text-sm text-gray-500 mb-1">Active</div>
                <div className="text-2xl font-bold">{getActiveAlums(alums).length}</div>
              </div>
              <div className="rounded-md shadow-md p-4 text-center bg-white w-full">
                <div className="text-sm text-gray-500 mb-1">Inactive</div>
                <div className="text-2xl font-bold">{getInactiveAlums(alums).length}</div>
              </div>
            </div>
          </div>

            <div className="flex flex-col space-y-4 w-full">
              {/* Pending section */}
              <div className="border-0 rounded-md shadow-md p-4 bg-white w-full">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">Pending</div>
                  <div className="text-xl font-bold">{getInactiveAlums(alums).length}</div>
                </div>

                {/* List */}
                <div className="mt-2 max-h-70 overflow-y-auto w-full">
                  {alums.map((alum: Alumnus) => (
                    <div
                      key={alum.alumniId}
                      onClick={() => handleOpenModal(alum)}
                      className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center mb-2 w-full"
                    >
                      <div className="overflow-hidden">
                        <span className="font-medium text-sm truncate block">
                          {alum.lastName}, {alum.firstName} {alum.middleName || ''}
                        </span>
                        <p className="text-xs text-gray-500 truncate">
                          {alum.studentNumber || 'No Student ID'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ml-2 ${
                          alum.activeStatus
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {alum.activeStatus ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Modal */}
          <AlumniDetailsModal
            alumnus={selectedAlumnus}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onToggleActiveStatus={handleToggleActiveStatus}
          />
        </Card>

        {/* Industries Card */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle>Industries</CardTitle>
          </CardHeader>
          <CardContent>
            {/* summary stats, just like Alumni
            <p>Total Fields: {Object.keys(fieldCounts).length}</p>
            <p>Total Alumni Counted: {Object.entries(fieldCounts).reduce((sum, [, c]) => sum + c, 0)}</p>
            <p>Distinct Industries: {Object.keys(fieldCounts).filter(f => fieldCounts[f] > 0).length}</p> */}

            {/* inner chart card */}
            <div className="w-full flex justify-center">
              <div className="w-50 h-50">
                <DonutChart
                    labels={Object.entries(fieldCounts).map(([field]) => field)}
                    data={Object.entries(fieldCounts).map(([_, count]) => count)}
                    backgroundColor={Object.entries(fieldCounts).map(
                      ([field], i) => getColorForField(field, i)
                    )}
                  />
              </div>
            </div>

            {/* list of industries like Alumni List */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Industry Breakdown</h3>
              <div className="space-y-2 max-h-70 overflow-y-auto">
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
        <Card className="border-0 shadow-md flex flex-col bg-white">
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getEventProposals(events).map((event:Event, index:number)=>{
                  return (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                    
                      <div 
                        key={event.eventId}
                        onClick={() => handleOpenModalEventProposal(event)}
                        className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">Event: {event.title}</span>
                          <p className="text-sm text-black-500">Date: {event.date}</p>
                          <p className="text-sm text-black-500">Place: {event.location}</p>
                          
                        </div>
                      </div>
                  </div>
                  )
                })}

              </div>
            </div>
          </CardContent>

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
        <Card className="border-0 shadow-md flex flex-col bg-white">
          <CardHeader className="pb-0">
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <div className="px-2 pt-0">
            <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
          </div>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="max-h-60">
             {getUpcomingEvents(events).map((event:Event, index:number)=>{
              return (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    
                <div 
                  key={event.eventId}
                  onClick={() => handleOpenModalEventProposal(event)}
                  className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">Event: {event.title}</span>
                    <p className="text-sm text-black-500">Date: {event.status}</p>
                    
                  </div>
                </div>
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
        <Card className="border-0 shadow-md flex flex-col bg-white">
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
             {donationDrives.map((donationDrive:DonationDrive, index:number)=>{
              return (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    
                <div 
                  key={donationDrive.eventId}

                  className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">Donation Drive: {donationDrive.campaignName}</span>
                    <p className="text-sm text-black-500">Beneficiary: {donationDrive.beneficiary}</p>
                    
                  </div>
                </div>
                </div>
              )
            })}                
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
        <Card className="border-0 shadow-md flex flex-col bg-white">
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
              {scholarships.map((scholarship:Scholarship, index:number)=>{
              return (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    
                <div 
                  key={scholarship.scholarshipId}

                  className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">Scholarships: {scholarship.title}</span>
                    <p className="text-sm text-black-500">Status: {scholarship.status}</p>
                    
                  </div>
                </div>
                </div>
              )
            })}  
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
          <Card className="border-0 shadow-md h-full bg-white">
            <CardHeader>
              <CardTitle>Map of Current Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <MapComponent workExperienceList={presentWorkExperiences}/>
            </CardContent>
          </Card>
        </div>

      {/* Job Posting */}
    <div className="md:col-span-3">
      <Card className="border-0 shadow-md flex flex-col h-full">
        <CardHeader className="pb-0">
          <CardTitle>Job Posting</CardTitle>
          
          {/* Tabs */}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'active'
                  ? 'bg-gray-100 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'pending'
                  ? 'bg-gray-100 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
            </button>
          </div>
        </CardHeader>

        {/* divider */}
        <div className="px-2 pt-0">
          <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
        </div>

        {/* CardContent as a flex column */}
        <CardContent className="flex flex-col flex-1 px-2">
          <div className="max-h-96 overflow-y-auto space-y-2">
            {jobOffers
              .filter((jobOffer:JobOffering) => 
                activeTab === 'active' 
                  ? jobOffer.status === 'Accepted' 
                  : jobOffer.status === 'Pending'
              )
              .map((jobOffer:JobOffering) => (
                <div
                  key={jobOffer.jobId}
                  className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => openModal(jobOffer)}
                >
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{jobOffer.position}</span>
                      <span className="text-sm text-gray-500">{jobOffer.jobType}</span>
                    </div>
                    <p className="text-sm text-gray-500">{jobOffer.company}</p>
                    <p className="text-sm text-blue-500">Status: {jobOffer.status}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>

        <div className="px-2 pt-0">
          <hr className="border-t border-black opacity-40 w-11/12 mx-auto" />
          <div className="text-center py-2">
            <Link
              href={`/admin-dashboard/job-postings${activeTab === 'active' ? '/active' : ''}`}
              className="text-black hover:underline text-sm"
            >
              View all {activeTab} job postings
            </Link>
          </div>
        </div>
      </Card>
      
      {/* Modal for job details */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedJob.position}</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-lg font-semibold">{selectedJob.company}</p>
                  <p className="text-gray-600">{selectedJob.location}</p>
                  <p className="text-gray-600">{selectedJob.employmentType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Salary Range: {selectedJob.salaryRange}</p>
                  <p className="text-gray-600">Experience: {selectedJob.experienceLevel}</p>
                  {/* <p className="text-gray-600">Posted: {selectedJob.datePosted.toLocaleDateString()}</p> */}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <p className="text-gray-700">{selectedJob.jobDescription}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkill.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-3">Status Management</h3>
                <p className="mb-3">Current Status: <span className={`font-semibold ${selectedJob.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedJob.status}</span></p>
                
                <div className="flex gap-3">
                  {selectedJob.status === 'Pending' ? (
                    <button
                      onClick={() => updateJobStatus(selectedJob.jobId, 'Active')}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => updateJobStatus(selectedJob.jobId, 'Pending')}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      <CheckCircle size={18} /> Mark as Pending
                    </button>
                  )}
                  
                  <button
                    onClick={() => updateJobStatus(selectedJob.jobId, 'Rejected')}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      </div>
    </div>
  );
}
