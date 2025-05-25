"use client";

// import { useState } from 'react';
import { DonationDrive, Event } from "@/models/models";
import { useRouter } from "next/navigation";
// import { DonateDialog } from '../DonateDialog';
import BookmarkButton from "@/components/ui/bookmark-button";
// import { useAuth } from "@/context/AuthContext";
import { useDonationDrives } from "@/context/DonationDriveContext";
// import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Clock, Users } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useNewsLetters } from "@/context/NewsLetterContext";

interface DonationDriveCardProps {
  drive: DonationDrive;
  event?: Event;
  showBookmark?: boolean;
}

const DonationDriveCard = ({
  drive,
  event
}: DonationDriveCardProps) => {
  const router = useRouter();
  // const { user, alumInfo } = useAuth();
  const { deleteNewsLetter } = useNewsLetters();
  const {
    handleEdit,
  } = useDonationDrives();

  // Format timestamp to readable date
  // const formatDate = (timestamp: Timestamp | string | number | Date | null | undefined): string => {
  //   try {
  //     if (!timestamp) return 'N/A';
  
  //     let date: Date;
  
  //     if (timestamp instanceof Timestamp) {
  //     date = timestamp.toDate();
  //     } else {
  //     date = new Date(timestamp);
  //     }
  
  //     return isNaN(date.getTime())
  //     ? 'Invalid Date'
  //     : date.toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric',
  //       });
  //   } catch (err) {
  //     console.error('Date formatting error:', err);
  //     return 'Invalid Date';
  //   }
  // };

  //Calculate Days Remaining
  const getRemainingDays = (endDate: Date) => {
    try {
      const today = new Date(); // Current date
      const end = (typeof endDate === 'string')? new Date(endDate) : endDate; // Firestore Timestamp to JS Date
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return "Expired";
      else if (diffDays === 1) return "1 day left";
      else return `${diffDays} days left`;
    } catch (err) {
      return "Invalid Date";
    }
  };

  function getDaysRemaining(endDate: Date) {
    try {
      const now = new Date();

      const todayOnly = new Date(); // Current date
      const endDateOnly = new Date(endDate); // Firestore Timestamp to JS Date

      // Calculate difference in days
      const differenceInTime = endDateOnly.getTime() - todayOnly.getTime();
      const differenceInDays = Math.ceil(
        differenceInTime / (1000 * 60 * 60 * 24)
      );
      return differenceInDays;
      // Return 0 if ended or negative
    } catch (err) {
      console.error("Not Available");
      return 0;
    }
  }
  useEffect(() => {
    const checkAndUpdateExpiredDrive = async () => {
      try {
        if (!drive) return;

        const endDate = drive.endDate as Date;

        const isExpired = getDaysRemaining(endDate);

        if (isExpired <= 0 && drive.status !== "completed") {
          await handleEdit(drive.donationDriveId, { status: "completed" });
          console.log(
            `Drive ${drive.campaignName} marked as completed due to expiration`
          );
          await deleteNewsLetter(drive.donationDriveId);
        }
      } catch (err) {
        console.error("Error checking drive expiration:", err);
      }
    };
    
    checkAndUpdateExpiredDrive();
  }, [drive]);

  useEffect(() => {
    const checkAndUpdateCompletedDrive = async () => {
      try {
        if (!drive) return;

        const target = drive.targetAmount;

        const current = drive.currentAmount;

        if (target <= current && drive.status !== "completed") {
          await handleEdit(drive.donationDriveId, { status: "completed" });
          console.log(
            `Drive ${drive.campaignName} marked as completed due to target amount acquired`
          );
          await deleteNewsLetter(drive.donationDriveId);
        }
      } catch (err) {
        console.error("Error checking drive completion:", err);
      }
    };

    checkAndUpdateCompletedDrive();
  }, [drive]);

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  // Handle view details click
  const handleViewDetails = (donationDriveId: string) => {
    router.push(`/donationdrive-list/details?id=${donationDriveId}`);
  };

  // Donation Card
  return (
    <div>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleViewDetails(drive.donationDriveId)}
      >
        {/* Image */}
        {event?.image || drive.image ? (
          <div className="relative">
            {drive.isEvent && event ? (
              <Image
                sizes="100vw"
                width={0}
                height={0}
                priority
                src={event.image}
                alt={event.title}
                className="bg-cover bg-center rounded-t-[10px] h-[230px] w-full object-cover"
              />
            ) : (
              <Image
                sizes="100vw"
                width={0}
                height={0}
                priority
                src={drive.image}
                alt={drive.campaignName}
                className="bg-cover bg-center rounded-t-[10px] h-[230px] w-full object-cover"
              />
            )}
            {/* Status badge - always shown in bottom right */}
            <span
              className={`absolute bottom-2 right-2 px-2 py-1 text-sm rounded-full font-bold ${
                drive.status === "active"
                  ? "bg-green-100 text-green-800"
                  : drive.status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : drive.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {drive.status === "completed"
                ? "Closed"
                : drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
            </span>
          </div>
        ) : (
          <div className="relative flex items-center justify-center bg-blue-100 bg-cover bg-center rounded-t-[10px] h-[230px]">
            <Image
              width={0}
              height={0}
              sizes="100vw"
              src="/default-image.jpg"
              alt="Default"
              className="w-full h-full object-cover"
            />
            {/* Status badge - always shown in bottom right */}
            <span
              className={`absolute bottom-2 right-2 px-2 py-1 text-sm rounded-full font-bold ${
                drive.status === "active"
                  ? "bg-green-100 text-green-800"
                  : drive.status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : drive.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {drive.status === "completed"
                ? "Closed"
                : drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
            </span>
          </div>
        )}
        {/* Content */}
        <div className="px-6 pt-3 pb-6">
          {/* Campaign Name */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold truncate">
              {drive.isEvent && event ? event.title : drive.campaignName}
            </h2>
            <BookmarkButton
              entryId={drive.donationDriveId}
              type="donation_drive"
              size="md"
            />
          </div>
          {/* Description */}
          {drive.isEvent && event ? (
            <div className="mb-5 text-sm h-10 overflow-hidden text-clip">
              <p className="text-start whitespace-pre-wrap">
                {event.description.length > 100
                  ? event.description.slice(0, 100) + "..."
                  : event.description}
              </p>
            </div>
          ) : (
            <div className="mb-5 text-sm h-19 overflow-hidden text-clip ">
              <p className="text-start whitespace-pre-wrap">
                {drive.description.length > 200
                  ? drive.description.slice(0, 200) + "..."
                  : drive.description}
              </p>
            </div>
          )}
          {/* Details */}
					<div className="mt-5 text-xs text-start">
						<p>
							Donation Type:{" "}
							{drive.isEvent ? " Event-related Campaign" : " General Campaign"}{" "}
						</p>
					</div>
          {/* Progress Bar */}
          <div className="my-5">
            {/* Patrons and Percentage */}
            <div className="flex justify-between my-1">
              <div className="flex gap-2">
                <Users className="size-[20px] text-[#616161]" />
                <span className="text-sm text-gray-500">
                  {" "}
                  {drive.donorList.length} patrons
                </span>
              </div>
              <div className="flex gap-2">
                <Clock className="size-[17px] text-[#616161]" />
                <span className="text-sm text-gray-500">
                  {getRemainingDays(drive.endDate)}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${calculateProgress(
                    drive.currentAmount,
                    drive.targetAmount
                  )}%`,
                }}
              ></div>
            </div>
            {/* Current and Target amount */}
            <div className="flex justify-between my-1 text-sm">
              <span className="font-medium">
                ₱{drive.currentAmount?.toLocaleString() || "0"}
              </span>
              <span className="text-gray-500">
                of ₱{drive.targetAmount?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDriveCard;
