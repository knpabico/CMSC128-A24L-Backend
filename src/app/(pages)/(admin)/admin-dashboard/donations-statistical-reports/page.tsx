"use client";
import BarGraph from "@/components/charts/BarGraph";
import { useAlums } from "@/context/AlumContext";
import { useDonationContext } from "@/context/DonationContext";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { Alumnus, Donation, DonationDrive } from "@/models/models";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Dropdown from "@/components/ui/dropdown";
const DonationReportPage = () => {
  const { alums } = useAlums();
  const { getAllDonations } = useDonationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const { donationDrives } = useDonationDrives();
  const [driveType, setDriveType] = useState<string>("active");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        const donations = await getAllDonations();
        setUserDonations(donations);
      } catch (error) {
        console.error("Failed to fetch donations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const activeDonationDrives = useMemo(() => {
    return donationDrives.filter(
      (drive: DonationDrive) => drive.status === "active"
    );
  }, [donationDrives]);

  const completedDonationDrives = useMemo(() => {
    return donationDrives.filter(
      (drive: DonationDrive) => drive.status === "completed"
    );
  }, [donationDrives]);

  const alumniDonations = useMemo(() => {
    const donationMap: Record<string, number> = {};
    let completedDriveIds;
    if (driveType === "active") {
      completedDriveIds = new Set(
        activeDonationDrives.map(
          (drive: DonationDrive) => drive.donationDriveId
        )
      );
    } else {
      completedDriveIds = new Set(
        completedDonationDrives.map(
          (drive: DonationDrive) => drive.donationDriveId
        )
      );
    }

    userDonations
      ?.filter((donation: Donation) =>
        completedDriveIds.has(donation.donationDriveId)
      )
      .forEach((donation) => {
        const id = donation.alumniId;
        donationMap[id] = (donationMap[id] || 0) + donation.amount;
      });

    return alums
      .filter((alum: Alumnus) => donationMap[alum.alumniId])
      .map((alum: Alumnus) => ({
        name: `${alum.firstName} ${alum.lastName}`,
        totalDonated: donationMap[alum.alumniId],
      }));
  }, [
    alums,
    userDonations,
    completedDonationDrives,
    driveType,
    activeDonationDrives,
  ]);

  const sortedAlumniDonations = useMemo(() => {
    return [...alumniDonations].sort((a, b) => b.totalDonated - a.totalDonated);
  }, [alumniDonations]);

  // Prepare data for donation drives graph
  const currentDrives =
    driveType === "active" ? activeDonationDrives : completedDonationDrives;

  const drivesData = useMemo(() => {
    return currentDrives.sort(
      (a: DonationDrive, b: DonationDrive) => b.currentAmount - a.currentAmount
    );
  }, [currentDrives]);

  // Dropdown options
  const driveOptions = [
    { value: "active", label: "Active Donation Drives" },
    { value: "completed", label: "Completed Donation Drives" },
  ];

  return (
    <div className="flex flex-col gap-5">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2">
            <div className="hover:text-[#0856BA] cursor-pointer transition-colors">Home</div>
            <div>
              <ChevronRight size={15} />
            </div>
            <div className="font-medium text-[#0856BA]">Donation Statistical Reports</div>
          </div>

      {/* Page Title */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl text-gray-800">Donation Statistical Reports</div>
          <div className="text-sm bg-[#0856BA] text-white px-4 py-2 rounded-full font-medium">
            {!isLoading && `Total Donors: ${sortedAlumniDonations.length}`}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="w-full max-w-xs">
        <Dropdown
          options={driveOptions}
          value={driveType}
          onChange={(value: string | number) => setDriveType(value.toString())}
          label="Filter Donation Drives"
        />
      </div>

      {/* Charts Section */}
      <div className="mb-6 space-y-8 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 border-gray-100">Donation Charts</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-semibold text-gray-700">
                Users with the Highest Total Donated Amount
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0">
              <BarGraph
                labels={[...alumniDonations]
                  .sort((a, b) => b.totalDonated - a.totalDonated)
                  .map((user) => user.name)
                  .slice(0, 5)}
                data={[...alumniDonations]
                  .sort((a, b) => b.totalDonated - a.totalDonated)
                  .map((donor) => donor.totalDonated)
                  .slice(0, 5)}
                type="Total amount donated (in Php)"
              />
            </CardContent>
          </Card>

          <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-semibold text-gray-700">
                {driveType === "active" ? "Active" : "Completed"} Donation Drives with Highest Donations
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0">
              <BarGraph
                type="Total amount donated (in Php)"
                labels={drivesData.map((drive: DonationDrive) => drive.campaignName).slice(0, 5)}
                data={drivesData.map((drive: DonationDrive) => drive.currentAmount).slice(0, 5)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800">Top Donors</CardTitle>
            {!isLoading && (
              <div className="text-[#0856BA] font-medium text-sm">Total Donors: {sortedAlumniDonations.length}</div>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="text-gray-500 py-3">Loading...</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {sortedAlumniDonations
                  .slice(0, 10)
                  .map((donation: { name: string; totalDonated: number }, index: number) => (
                    <li key={index} className="py-2 text-gray-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2"></span>
                      <span className="font-medium">{donation.name}</span>
                      <span className="ml-auto text-[#0856BA] font-semibold">
                        ₱{donation.totalDonated.toLocaleString()}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800">
              {driveType === "active" ? "Active" : "Completed"} Donation Drives
            </CardTitle>
            {!isLoading && <div className="text-[#0856BA] font-medium text-sm">Total: {currentDrives.length}</div>}
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="text-gray-500 py-3">Loading...</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {currentDrives.map((drive: DonationDrive, index: number) => {
                  const driveDonations = userDonations.filter(
                    (donation) => donation.donationDriveId === drive.donationDriveId,
                  )
                  const totalDonated = driveDonations.reduce((sum, donation) => sum + donation.amount, 0)

                  return (
                    <li key={index} className="py-2 text-gray-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2"></span>
                      <span className="font-medium">{drive.campaignName}</span>
                      <span className="ml-auto text-[#0856BA] font-semibold">₱{totalDonated.toLocaleString()}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default DonationReportPage;
