"use client";
import BarGraph from "@/components/charts/BarGraph";
import { useAlums } from "@/context/AlumContext";
import { useDonationContext } from "@/context/DonationContext";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { Alumnus, Donation, DonationDrive } from "@/models/models";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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
    <div className="p-6">
      <Typography variant="h4" className="mb-4">
        Donation Statistical Report
      </Typography>

      <div className="mb-4 w-64">
        <Dropdown
          options={driveOptions}
          value={driveType}
          onChange={(value: string | number) => setDriveType(value.toString())}
          label="Filter Donation Drives"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between gap-6">
          <div className="flex-1 bg-white shadow-md rounded-lg p-4 pb-7">
            <Typography variant="h6" className="font-semibold mb-2 text-center">
              Donation Charts
            </Typography>
            <div className="flex items-center justify-around flex-wrap md:flex-nowrap">
              <div className="flex-1 flex flex-col items-center mb-4 md:mb-0">
                <Typography variant="subtitle2" className="text-center mb-2">
                  Users with the Highest Total Donated Amount
                </Typography>
                <div>
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
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <Typography variant="subtitle2" className="text-center mb-2">
                  {driveType === "active" ? "Active" : "Completed"} Donation
                  Drives with Highest Donations
                </Typography>
                <div>
                  <BarGraph
                    type="Total amount donated (in Php)"
                    labels={drivesData
                      .map((drive: DonationDrive) => drive.campaignName)
                      .slice(0, 5)}
                    data={drivesData
                      .map((drive: DonationDrive) => drive.currentAmount)
                      .slice(0, 5)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Top Donors
          </Typography>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Typography className="text-blue-600 mb-2">
              Total Donors: {sortedAlumniDonations.length}
            </Typography>
          )}
          <ul className="list-disc list-inside mt-2">
            {sortedAlumniDonations
              .slice(0, 10)
              .map(
                (
                  donation: { name: string; totalDonated: number },
                  index: number
                ) => (
                  <li key={index} className="text-gray-700">
                    {donation.name} - ₱{donation.totalDonated.toLocaleString()}
                  </li>
                )
              )}
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            {driveType === "active" ? "Active" : "Completed"} Donation Drives
          </Typography>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Typography className="text-blue-600 mb-2">
              Total: {currentDrives.length}
            </Typography>
          )}
          <ul className="list-disc list-inside mt-2">
            {currentDrives.map((drive: DonationDrive, index: number) => {
              const driveDonations = userDonations.filter(
                (donation) => donation.donationDriveId === drive.donationDriveId
              );
              const totalDonated = driveDonations.reduce(
                (sum, donation) => sum + donation.amount,
                0
              );

              return (
                <li key={index} className="text-gray-700">
                  {drive.campaignName} - ₱{totalDonated.toLocaleString()}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DonationReportPage;
