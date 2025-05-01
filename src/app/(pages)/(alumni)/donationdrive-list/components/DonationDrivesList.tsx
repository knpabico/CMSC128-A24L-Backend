"use client";

import { DonationDrive, Event } from "@/models/models";
import DonationDriveCard from "./DonationDriveCard";

interface DonationDrivesListProps {
  drives: DonationDrive[];
  events: Record<string, Event>;
  isLoading?: boolean;
  emptyMessage?: string;
}

const DonationDrivesList = ({ 
  drives, 
  events,
  isLoading = false, 
  emptyMessage = "No donation drives found." 
}: DonationDrivesListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-3"></div>
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (drives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full ">
      {drives.map((drive) => (
        <DonationDriveCard 
          key={drive.donationDriveId} 
          drive={drive} 
          event={drive.isEvent && drive.eventId ? events[drive.eventId] : undefined}
        />
      ))}
    </div>
  );
};

export default DonationDrivesList;