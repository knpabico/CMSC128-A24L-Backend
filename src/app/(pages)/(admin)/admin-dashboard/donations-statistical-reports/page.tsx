"use client";
import BarGraph from "@/components/charts/BarGraph";
import LineGraph from "@/components/charts/LineGraph";
import { useAlums } from "@/context/AlumContext";
import { useDonationContext } from "@/context/DonationContext";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { Alumnus, Donation, DonationDrive } from "@/models/models";
import { useEffect, useMemo, useState } from "react";
import { BarChart, ChevronDown, ChevronRight, HeartHandshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Dropdown from "@/components/ui/dropdown";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import GroupedBarGraph from "@/components/charts/GroupedBarGraph";

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

  // Calculate donations by year based on selected drive type
  const donationsByYear = useMemo(() => {
    const yearlyTotals: Record<string, number> = {};

    // Get relevant drive IDs based on selected type
    const relevantDriveIds = new Set(
      (driveType === "active"
        ? activeDonationDrives
        : completedDonationDrives
      ).map((drive: DonationDrive) => drive.donationDriveId)
    );

    // Filter donations by drive type before calculating yearly totals
    userDonations
      .filter((donation: Donation) =>
        relevantDriveIds.has(donation.donationDriveId)
      )
      .forEach((donation: Donation) => {
        // Extract year from donation date
        const donationYear = new Date(donation.date).getFullYear();
        yearlyTotals[donationYear] =
          (yearlyTotals[donationYear] || 0) + donation.amount;
      });

    // Sort years in descending order
    const sortedYears = Object.keys(yearlyTotals).sort(
      (a, b) => Number(b) - Number(a)
    );

    return sortedYears.map((year) => ({
      year,
      totalAmount: yearlyTotals[year],
    }));
  }, [userDonations, driveType, activeDonationDrives, completedDonationDrives]);

  const overallTotal = useMemo(() => {
    return donationsByYear.reduce(
      (sum, donation) => sum + donation.totalAmount,
      0
    );
  }, [donationsByYear]);

  // Prepare data for the 5-year line graph based on selected drive type
  const fiveYearDonationData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4; // 5 years including current year

    // Initialize years with zero values
    const years: Record<number, number> = {};
    for (let year = startYear; year <= currentYear; year++) {
      years[year] = 0;
    }

    // Get relevant drive IDs based on selected type
    const relevantDriveIds = new Set(
      (driveType === "active"
        ? activeDonationDrives
        : completedDonationDrives
      ).map((drive: DonationDrive) => drive.donationDriveId)
    );

    // Filter donations by drive type before calculating yearly totals
    userDonations
      .filter((donation: Donation) =>
        relevantDriveIds.has(donation.donationDriveId)
      )
      .forEach((donation: Donation) => {
        const donationYear = new Date(donation.date).getFullYear();
        if (donationYear >= startYear && donationYear <= currentYear) {
          years[donationYear] = (years[donationYear] || 0) + donation.amount;
        }
      });

    // Convert to array format for the graph
    return Object.entries(years).map(([year, amount]) => ({
      year,
      amount,
    }));
  }, [userDonations, driveType, activeDonationDrives, completedDonationDrives]);

  const groupedBarData = useMemo(() => {
    const driveLabels = currentDrives.map((drive: DonationDrive) =>
      drive.campaignName.length > 15
        ? drive.campaignName.substring(0, 15) + "..."
        : drive.campaignName
    );
    const currentAmounts = currentDrives.map(
      (drive: DonationDrive) => drive.currentAmount
    );
    const targetAmounts = currentDrives.map(
      (drive: DonationDrive) => drive.targetAmount
    );
    const originalNames = currentDrives.map(
      (drive: DonationDrive) => drive.campaignName
    );

    return {
      labels: driveLabels,
      currentAmounts,
      targetAmounts,
      campaignNames: originalNames,
    };
  }, [currentDrives]);

  // Dropdown options
  const driveOptions = [
    { value: "active", label: "Active Donation Drives" },
    { value: "completed", label: "Completed Donation Drives" },
  ];

  const prompt = useMemo(
    () =>
      driveType === "active"
        ? `
            Total Number of ${driveType} Donation Drives: ${
            currentDrives.length
          } \n
            ${driveType} Donation Drives Current-Target Amount Ratio: ${drivesData
            .map(
              (drive: DonationDrive) =>
                `${drive.campaignName} - Php${drive.currentAmount} (Current) - Php${drive.targetAmount} (Target Amount)`
            )
            .join("\n")} \n
            Total Amount Donated for all the ${driveType} Donation Drives: Php${overallTotal} \n
            `
        : `
            Total Number of ${driveType} Donation Drives: ${
            currentDrives.length
          } \n
            ${driveType} Donation Drives with the highest amount: ${drivesData
            .map(
              (drive: DonationDrive) =>
                `${drive.campaignName} - Php${drive.currentAmount}`
            )
            .join("\n")} \n
            Total Amount Donated for all the ${driveType} Donation Drives: Php${overallTotal} \n
            Donation Trend for the Last 5 years: ${fiveYearDonationData
              .map((item) => `${item.year} - Php${item.amount}`)
              .join("\n")}
            `,
    [
      driveType,
      currentDrives.length,
      drivesData,
      fiveYearDonationData,
      overallTotal,
    ]
  );

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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-8 h-8 text-[#0856BA]" />
              <h1 className="font-bold text-3xl text-gray-800">Donation Statistical Reports</h1>
            </div>
            <div className="text-sm bg-[#0856BA] text-white px-4 py-2 rounded-full font-medium">
              {!isLoading && `Total Donors: ${sortedAlumniDonations.length}`}
            </div>
          </div>
        </div>
    
        {/* Filter Section */}
        <div className="bg-white px-4 py-3 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Filter by:</span>
            <div className="relative">
                <select
                value={driveType}
                onChange={(e) => setDriveType(e.target.value)}
                className="bg-white border-0 text-gray-800 py-1 px-3 pr-8 rounded-md appearance-none focus:outline-none hover:bg-gray-300"
                >
                {driveOptions.map((option) => (
                  <option
                  key={option.value}
                  value={option.value}
                  className="bg-white text-gray-800"
                  >
                  {option.label}
                  </option>
                ))}
                </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
    
        {/* Main Content */}
        {driveType === "completed" ? (
          // COMPLETED DONATION DRIVES LAYOUT
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Users with the Highest Total Donated Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0 h-[220px]">
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
    
            <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Top Completed Drives with Highest Donations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0 h-[220px]">
                <BarGraph
                  type="Total amount donated (in Php)"
                  labels={drivesData.map((drive: DonationDrive) => drive.campaignName).slice(0, 5)}
                  data={drivesData.map((drive: DonationDrive) => drive.currentAmount).slice(0, 5)}
                />
              </CardContent>
            </Card>
    
            {/* Report Summary */}
            <Card className="col-span-4 row-span-2 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100">
              <CardHeader className="pb-1 border-b border-gray-100">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                  Report Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto h-200">
                <div className="p-2 rounded-lg">
                  <ReportSummaryCard data={prompt} />
                </div>
              </CardContent>
            </Card>
    
            {/* Middle Row - Donation Trends */}
            <Card className="col-span-8 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Completed Donation Trends (Last 5 Years)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0 h-full">
                <LineGraph
                  labels={fiveYearDonationData.map((item) => item.year)}
                  data={fiveYearDonationData.map((item) => item.amount)}
                  type="Total donations per year (in Php)"
                />
              </CardContent>
            </Card>
    
            {/* Bottom Row */}
            <div className="col-span-12 grid grid-cols-12 gap-4">
              <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                        Completed Donations by Year
                        </CardTitle>
                      {!isLoading && (
                        <div className="text-[#0856BA] font-medium text-sm mt-1">Total Years: {donationsByYear.length}</div>
                      )}
                    </div>
                    <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                      {donationsByYear.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 h-[180px] overflow-y-auto">
                  {isLoading ? (
                    <p className="text-gray-500 py-3">Loading...</p>
                  ) : (
                    <>
                      <ul className="divide-y divide-gray-100">
                        {donationsByYear.map((yearData, index) => (
                          <li key={index} className="py-2 text-gray-700 flex items-center">
                            <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2"></span>
                            <span className="font-medium">{yearData.year}</span>
                            <span className="ml-auto text-[#0856BA] font-semibold">
                              ₱{yearData.totalAmount.toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {overallTotal > 0 && (
                        <div className="mt-4 pt-2 border-t border-gray-100 text-gray-800 font-medium">
                          Amount Donated in Total:{" "}
                          <span className="text-[#0856BA] font-semibold">₱{overallTotal.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                      Top Donors
                      </CardTitle>
                      {!isLoading && (
                        <div className="text-[#0856BA] font-medium text-sm mt-1">
                          Total Donors: {sortedAlumniDonations.length}
                        </div>
                      )}
                    </div>
                    <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                      {sortedAlumniDonations.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 h-[180px] overflow-y-auto">
                  {isLoading ? (
                    <p className="text-gray-500 py-3">Loading...</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {sortedAlumniDonations
                        .slice(0, 10)
                        .map((donation: { name: string; totalDonated: number }, index: number) => (
                          <li
                            key={index}
                            className="py-2 text-gray-700 flex items-center hover:bg-gray-50 transition-colors rounded-md"
                          >
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

              <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                    Completed Donation Drives
                    </CardTitle>
                      {!isLoading && (
                        <div className="text-[#0856BA] font-medium text-sm mt-1">
                          Total Donation Drives: {currentDrives.length}
                        </div>
                      )}
                    </div>
                    <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                      {currentDrives.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 h-[180px] overflow-y-auto">
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
                          <li
                            key={index}
                            className="py-2 text-gray-700 flex items-center hover:bg-gray-50 transition-colors rounded-md"
                          >
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
        ) : (
          // ACTIVE DONATION DRIVES LAYOUT
          <div className="grid grid-cols-12 gap-4">
            {/* Top Row */}
            <Card className="col-span-8 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Users with the Highest Total Donated Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0 h-full">
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
    
            {/* Report Summary */}
            <Card className="col-span-4 row-span-2 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100">
              <CardHeader className="pb-1 border-b border-gray-100">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                  Report Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto h-200">
                <div className="p-2 rounded-lg">
                  <ReportSummaryCard data={prompt} />
                </div>
              </CardContent>
            </Card>
    
            {/* Middle Row */}
            <Card className="col-span-8 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Active Donation Drives' Current-Target Amount Ratio
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center h-full">
                <GroupedBarGraph
                  labels={groupedBarData.labels}
                  currentAmounts={groupedBarData.currentAmounts}
                  targetAmounts={groupedBarData.targetAmounts}
                  campaignNames={groupedBarData.campaignNames}
                />
              </CardContent>
            </Card>
    
            {/* Bottom Row */}
            <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                      Active Donations per Year
                    </CardTitle>
                    {!isLoading && (
                      <div className="text-[#0856BA] font-medium text-sm mt-1">Total Years: {donationsByYear.length}</div>
                    )}
                  </div>
                  <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                    {donationsByYear.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[180px] overflow-y-auto">
                {isLoading ? (
                  <p className="text-gray-500 py-3">Loading...</p>
                ) : (
                  <>
                    <ul className="divide-y divide-gray-100">
                      {donationsByYear.map((yearData, index) => (
                        <li key={index} className="py-2 text-gray-700 flex items-center">
                          <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2"></span>
                          <span className="font-medium">{yearData.year}</span>
                          <span className="ml-auto text-[#0856BA] font-semibold">
                            ₱{yearData.totalAmount.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {overallTotal > 0 && (
                      <div className="mt-4 pt-2 border-t border-gray-100 text-gray-800 font-medium">
                        Amount Donated in Total:{" "}
                        <span className="text-[#0856BA] font-semibold">₱{overallTotal.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
    
            <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                  Top Donors
                  </CardTitle>
                    {!isLoading && (
                      <div className="text-[#0856BA] font-medium text-sm mt-1">
                        Total Donors: {sortedAlumniDonations.length}
                      </div>
                    )}
                  </div>
                  <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                    {sortedAlumniDonations.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[180px] overflow-y-auto">
                {isLoading ? (
                  <p className="text-gray-500 py-3">Loading...</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {sortedAlumniDonations
                      .slice(0, 10)
                      .map((donation: { name: string; totalDonated: number }, index: number) => (
                        <li
                          key={index}
                          className="py-2 text-gray-700 flex items-center hover:bg-gray-50 transition-colors rounded-md"
                        >
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
    
            <Card className="col-span-4 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                  Active Donation Drives
                  </CardTitle>
                    {!isLoading && (
                      <div className="text-[#0856BA] font-medium text-sm mt-1">
                        Total Donation Drives: {currentDrives.length}
                      </div>
                    )}
                  </div>
                  <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                    {currentDrives.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[180px] overflow-y-auto">
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
                        <li
                          key={index}
                          className="py-2 text-gray-700 flex items-center hover:bg-gray-50 transition-colors rounded-md"
                        >
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
        )}
      </div>
    );
  };

export default DonationReportPage;
