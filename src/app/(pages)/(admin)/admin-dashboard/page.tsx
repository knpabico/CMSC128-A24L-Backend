"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import MapComponent from "./google-maps/map";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience,Event, DonationDrive, Scholarship, JobOffering } from "@/models/models";
import { useEvents } from "@/context/EventContext";
import DonutChart from "@/components/charts/DonutChart";
import React, {useState,useMemo} from "react";
import AlumniDetailsModal from '@/components/ui/ActivateAlumniDetails';
import { useDonationDrives } from "@/context/DonationDriveContext";
import { useScholarship } from "@/context/ScholarshipContext";
import { useJobOffer } from "@/context/JobOfferContext";
import { CheckCircle, XCircle, Activity, Users, Briefcase, Calendar, Award, MapPin, CreditCard, Filter } from 'lucide-react';
import { useDonationContext } from "@/context/DonationContext";

import { RegStatus } from "@/types/alumni/regStatus";
import ProEventDetailsModal from "@/components/ui/pro-event-modal"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";


export default function AdminDashboard() {
  // Get work experience list from context
  const { allWorkExperience, isLoading, fetchWorkExperience } = useWorkExperience();
  const {totalAlums,alums, getActiveAlums, getInactiveAlums, updateAlumnusActiveStatus, getPendingAlums, updateAlumnusRegStatus,onUpdateRegStatus} = useAlums();
  const {donationDrives} = useDonationDrives();
  const {getCampaignName} = useDonationContext();
  const { events, getEventProposals, getUpcomingEvents, onUpdateEventStat } = useEvents(); 
  const {scholarships} = useScholarship();
  const {jobOffers, handleAccept, handleReject, handlePending} = useJobOffer();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedJob, setSelectedJob] = useState<JobOffering | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  // const { allDonations } = useDonationContext();
  
  const inactiveAlums = useMemo(() => {
    return alums.filter(
      (alum: Alumnus) =>
        alum.activeStatus === false && alum.regStatus === "approved"
    );
  }, [alums]);

  const updateJobStatus = (jobId:string, newStatus:string) => {
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
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
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


  //for modals
  //Activate Alum 
  // Add these new states for the modal
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventProposal, setSelectedEventProposal] = useState<Event | null>(null);
  const [isModalEventProOpen, setIsModalEventProOpen] = useState(false);
  const [isCampaignName, setIsCampaignName] = useState("None");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [isSchoModalOpen, setIsSchoModalOpen] = useState(false);
  
    
  
  // Function to handle opening the modal
  const handleOpenModal = (alumnus: Alumnus) => {
    setSelectedAlumnus(alumnus);
    setIsModalOpen(true);
  };
  
  const handleOpenModalEventProposal = (event: Event) => {
    setSelectedEventProposal(event);
    const campaignName=getCampaignName(selectedEventProposal?.donationDriveId)
    setIsCampaignName(campaignName)
    setIsModalEventProOpen(true);
  };
  
  
  const handleSchoOpenModal = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setIsSchoModalOpen(true);
  };

  const handleSchoCloseModal = () => {
    setSelectedScholarship(null);
    setIsSchoModalOpen(false);
  };

  //function to handle the job posting modal
  const handleOpenJobModal = (job: JobOffering) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
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
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };
    
  // Function to toggle active status
  const handleTogglePendingStatus = (alumniId: string, newStatus: RegStatus) => {
    // Call your context function to update the status
    updateAlumnusRegStatus(alumniId, newStatus);
    
    // Update the local state if needed
    if (selectedAlumnus && selectedAlumnus.alumniId === alumniId) {
      setSelectedAlumnus({
        ...selectedAlumnus,
        regStatus: newStatus
      });
    }
  };
  
  const sortedEntries = Object.entries(fieldCounts).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    
    return (
      <div className="p-2 md:p-6 w-full bg-gray-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="text-sm text-gray-500 mt-2 md:mt-0">
          Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center">
            <div className="bg-blue-500 rounded-full p-3 mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Alumni</p>
              <p className="text-2xl font-bold">{totalAlums}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-600">Active: {getActiveAlums(alums).length}</span>
                <span className="text-xs text-gray-400 mx-1">|</span>
                <span className="text-xs text-yellow-600">Pending: {getPendingAlums(alums).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center">
            <div className="bg-purple-500 rounded-full p-3 mr-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Events</p>
              <p className="text-2xl font-bold">{getUpcomingEvents(events).length}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-yellow-600">Proposals: {getEventProposals(events).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center">
            <div className="bg-green-500 rounded-full p-3 mr-4">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Donations</p>
              <p className="text-2xl font-bold">{donationDrives.length}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-600">
                  {donationDrives.reduce((sum, drive) => sum + drive.currentAmount, 0).toLocaleString()} PHP raised
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center">
            <div className="bg-amber-500 rounded-full p-3 mr-4">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Job Postings</p>
              <p className="text-2xl font-bold">{jobOffers.length}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-yellow-600">Pending: {jobOffers.filter(job => job.status === 'Pending').length}</span>
                <span className="text-xs text-gray-400 mx-1">|</span>
                <span className="text-xs text-green-600">Active: {jobOffers.filter(job => job.status === 'Accepted').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Alumni and Industry Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Alumni Card */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="flex items-center text-xl font-bold">
              <Users className="h-5 w-5 mr-2 text-blue-600" /> Alumni Status
            </CardTitle>
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
                    backgroundColor={["#4361EE", "#F72585"]}
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
                <div className="rounded-lg shadow-md p-4 text-center bg-gradient-to-r from-blue-50 to-blue-100 w-full">
                  <div className="text-sm text-gray-500 mb-1">Total</div>
                  <div className="text-2xl font-bold text-blue-700">{totalAlums}</div>
                </div>
                <div className="rounded-lg shadow-md p-4 text-center bg-gradient-to-r from-green-50 to-green-100 w-full">
                  <div className="text-sm text-gray-500 mb-1">Active</div>
                  <div className="text-2xl font-bold text-green-700">{getActiveAlums(alums).length}</div>
                </div>
                <div className="rounded-lg shadow-md p-4 text-center bg-gradient-to-r from-red-50 to-red-100 w-full">
                  <div className="text-sm text-gray-500 mb-1">Inactive</div>
                  <div className="text-2xl font-bold text-red-700">{inactiveAlums.length}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4 w-full">
              {/* Pending section */}
              <div className="border-0 rounded-lg shadow-md p-4 bg-white w-full">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-medium flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-yellow-500" />
                    <span>Pending Registration</span>
                  </div>
                  <div className="text-xl font-bold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    {getPendingAlums(alums).length}
                  </div>
                </div>

                {/* List */}
                <div className="mt-2 max-h-60 overflow-y-auto w-full">
                  {getPendingAlums(alums).length > 0 ? (
                    getPendingAlums(alums).map((alum: Alumnus) => (
                      <div
                        key={alum.alumniId}
                        onClick={() => handleOpenModal(alum)}
                        className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center mb-2 w-full transition-all duration-200 transform hover:translate-x-1"
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
                          className="px-2 py-0.5 text-xs rounded-full flex-shrink-0 ml-2 bg-yellow-100 text-yellow-800"
                        >
                          Pending
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No pending registrations</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Modal */}
          <AlumniDetailsModal
            alumnus={selectedAlumnus}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdateRegStatus={onUpdateRegStatus}
          />
        </Card>

        {/* Industries Card */}
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="flex items-center text-xl font-bold">
              <Briefcase className="h-5 w-5 mr-2 text-purple-600" /> Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* inner chart card */}
            <div className="w-full flex flex-col lg:flex-row justify-center mt-2">
              <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 items-center">
                {/* Donut Chart */}
                <div className="w-48 h-48 md:w-64 md:h-64">
                  <DonutChart
                    labels={sortedEntries.slice(0, 8).map(([field]) => field)}
                    data={sortedEntries.slice(0, 8).map(([_, count]) => count)}
                    backgroundColor={sortedEntries.slice(0, 8).map(([field], i) => getColorForField(field, i))}
                    options={{
                      cutout: '65%',
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>

                {/* Labels Legend - Limited to top 8 for cleaner display */}
                <div className="space-y-2 max-h-64 overflow-y-auto w-full lg:w-1/2">
                  {sortedEntries.slice(0, 8).map(([field, count], idx) => (
                    <div key={field} className="flex items-center space-x-2 text-sm p-2 hover:bg-gray-50 rounded-md">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: getColorForField(field, idx) }}
                      />
                      <span className="flex-1">{field}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {sortedEntries.length > 8 && (
                    <div className="text-center text-sm text-blue-600 cursor-pointer hover:underline mt-2">
                      +{sortedEntries.length - 8} more fields
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top industries compact view */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold flex items-center">
                  <Filter className="h-4 w-4 mr-1 text-gray-500" /> Top Industries
                </h3>
                <span className="text-xs text-gray-500">Based on alumni interests</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {sortedEntries.slice(0, 6).map(([field, count], idx) => (
                  <div
                    key={field}
                    className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 flex items-center justify-between transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getColorForField(field, idx) }}
                      />
                      <span className="font-medium text-sm">{field}</span>
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
                <div className="text-2xl font-bold">{inactiveAlums.length}</div>
              </div>
            </div>
          </div>

            <div className="flex flex-col space-y-4 w-full">
              {/* Pending section */}
              <div className="border-0 rounded-md shadow-md p-4 bg-white w-full">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">Pending Registration Alumnis</div>
                  <div className="text-xl font-bold">{getPendingAlums(alums).length}</div>
                </div>

                {/* List */}
                <div className="mt-2 max-h-50 overflow-y-auto w-full">
                  {getPendingAlums(alums).map((alum: Alumnus) => (
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
                        className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ml-2 
                            bg-yellow-500 text-yellow-800
                      `}
                      >
                        {alum.regStatus == "pending" ? "Pending" : 'Approved'}
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
            onClose={() => setIsModalOpen(false)}
            onUpdateRegStatus={onUpdateRegStatus}
          />

        </Card>

          {/* Industries Card */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle>Industries</CardTitle>
          </CardHeader>
          <CardContent>
            {/* inner chart card */}
            <div className="w-full flex justify-center">
              <div className="flex space-x-6 items-center">
                {/* Donut Chart */}
                <div className="w-50 h-50">
                  <DonutChart
                    labels={sortedEntries.map(([field]) => field)}
                    data={sortedEntries.map(([_, count]) => count)}
                    backgroundColor={sortedEntries.map(([field], i) => getColorForField(field, i))}
                    options={false}

                  />
                </div>

                {/* Labels Legend */}
                <div className="space-y-2">
                  {sortedEntries.map(([field, count], idx) => (
                    <div key={field} className="flex items-center space-x-2 text-sm">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: getColorForField(field, idx) }}
                      />
                      <span>{field} ({count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* list of industries like Alumni List */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Industry Breakdown</h3>
              <div className="space-y-2 max-h-70 overflow-y-auto">
                {Object.entries(fieldCounts)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1]) // Sort descending by count
                  .map(([field, count], idx) => (
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
            <div className="pt-1">
              <hr className="border-t border-black opacity-40 mx-auto" />
            </div>
          </CardHeader>
          
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
                    <div  key={event.eventId} className="space-y-2 max-h-96 overflow-y-auto">
                    
                      <div 
                        
                        onClick={() => handleOpenModalEventProposal(event)}
                        className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{event.title}</span>
                          <p className="text-sm text-black-500">Date: {event.date}</p>
                          <p className="text-sm text-black-500">Place: {event.location}</p>
                          <p className="text-sm text-black-500">Status: {event.status}</p>
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
              <ProEventDetailsModal
                proEvent={selectedEventProposal}
                isEventProOpen={isModalEventProOpen}
                onProEventClose={() => setIsModalEventProOpen(false)}
                onUpdateEventStat={onUpdateEventStat}
                getCampaignName= {isCampaignName}
              />
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-md flex flex-col bg-white">
          <CardHeader className="pb-0">
            <CardTitle>Upcoming Events</CardTitle>
            <div className="pt-1">
              <hr className="border-t border-black opacity-40 mx-auto" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="max-h-60">
             {getUpcomingEvents(events).map((event:Event, index:number)=>{
              return (
                <div key={event.eventId} className="space-y-2 max-h-96 overflow-y-auto">
                    
                <div 
                  
                  onClick={() => handleOpenModalEventProposal(event)}
                  className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{event.title}</span>
                    <p className="text-sm text-black-500">Date: {formatter.format(new Date(event.date))}</p>
                    
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
            <div className="pt-1">
              <hr className="border-t border-black opacity-40 mx-auto" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-60 space-y-2">
              {donationDrives.map((donationDrive: DonationDrive, index: number) => (
                <div key={donationDrive.donationDriveId} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer">
                  {/* {donationDrive.image ? (
                    <img
                      src={donationDrive.image}
                      alt={donationDrive.campaignName}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ) : null} */}
                  <div className="mb-1">
                    <span className="font-medium text-base">{donationDrive.campaignName}</span>
                    <p className="text-sm text-gray-600">Beneficiary: {donationDrive.beneficiary.join(', ')}</p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${(donationDrive.currentAmount / donationDrive.targetAmount) * 100}%` }}
                    />
                  </div>
                  {/* para sa progress bar */}
                  <p className="text-xs text-gray-700 mt-1">
                    ₱{donationDrive.currentAmount.toLocaleString()} raised of ₱{donationDrive.targetAmount.toLocaleString()}
                  </p>
                </div>
              ))}
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
            <div className="pt-1">
              <hr className="border-t border-black opacity-40 mx-auto" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="max-h-60">
              {/* List of recent applicants sa scholarship. Dapat kaya maopen yung full details like kasama contact info nila (overlay not page)
              Contents:
                - Alumni Name
                - Scholarship title
              */}
              {scholarships.map((scholarship:Scholarship, index:number)=>{
              return (
                <div className="space-y-2 max-h-96 overflow-y-auto" key={scholarship.scholarshipId} onClick={() => handleSchoOpenModal(scholarship)}>
                                    
                <div className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <div>
                    <span className="font-medium">{scholarship.title}</span>
                    <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        scholarship.status
                          ? 
                          'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {scholarship.status
                        ? 'Open'
                        : 'Closed'}
                    </span>
                          
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
      <Card className="border-0 shadow-md flex flex-col h-full bg-white">
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
            <div className="pt-1">
              <hr className="border-t border-black opacity-40 mx-auto" />
            </div>
        </CardHeader>

        {/* CardContent as a flex column */}
        <CardContent className="flex-1 overflow-y-auto">
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
                  onClick={() => handleOpenJobModal(jobOffer)}
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
      {isJobModalOpen && selectedJob && (
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
              {selectedJob.image &&
              <img
                src={selectedJob.image}
                alt={selectedJob.position}
                className="w-full h-40 object-cover rounded-md"
              />
              }
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

      {selectedScholarship && (
        <Dialog open={isSchoModalOpen} onOpenChange={handleSchoCloseModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedScholarship.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedScholarship && 
              <img
                src={selectedScholarship.image}
                alt={selectedScholarship.title}
                className="w-full h-40 object-cover rounded-md"
              />
              }
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Description:</strong> {selectedScholarship.description}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Status:</strong> {selectedScholarship.status}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Date Posted:</strong> {new Date(selectedScholarship.datePosted).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Applicants:</strong> {selectedScholarship.alumList.length}
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <button className="px-4 py-2 border rounded hover:bg-gray-100">Close</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>

      </div>
    </div>
  );
}