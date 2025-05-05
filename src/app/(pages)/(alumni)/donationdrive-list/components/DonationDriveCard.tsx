"use client";

// import { useState } from 'react';
import { useRouter } from "next/navigation";
import { DonationDrive, Event } from "@/models/models";
// import { DonateDialog } from '../DonateDialog';
import BookmarkButton from "@/components/ui/bookmark-button";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { useAuth } from "@/context/AuthContext";
import { Users, Clock, MapPin, Calendar, ImageOff } from "lucide-react";
import { useEffect } from "react";
import { Timestamp } from "firebase-admin/firestore";

interface DonationDriveCardProps {
  drive: DonationDrive;
  event?: Event;
  showBookmark?: boolean;
}

const DonationDriveCard = ({
  drive,
  event,
  showBookmark = false,
}: DonationDriveCardProps) => {
  const router = useRouter();
  const { user, alumInfo } = useAuth();
  const {
    showForm,
    setShowForm,
    handleBenefiaryChange,
    handleAddBeneficiary,
    handleRemoveBeneficiary,
    handleSave,
    handleEdit,
    campaignName,
    setCampaignName,
    description,
    setDescription,
    oneBeneficiary,
    setOneBeneficiary,
    beneficiary,
    setBeneficiary,
    targetAmount,
    setTargetAmount,
    endDate,
    setEndDate,
  } = useDonationDrives();

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return "N/A";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  //Calculate Days Remaining
  const getRemainingDays = (endDate: any) => {
    try {
      const today = new Date(); // Current date
      const end = endDate.toDate(); // Firestore Timestamp to JS Date
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return "Expired";
      else if (diffDays === 1) return "1 day left";
      else return `${diffDays} days left`;
    } catch (err) {
      return "Invalid Date";
    }
  };

  function getDaysRemaining(endDate: any) {
    try {
      const now = new Date();

      const todayOnly = new Date(); // Current date
      const endDateOnly = endDate.toDate(); // Firestore Timestamp to JS Date

      // Calculate difference in days
      const differenceInTime = endDateOnly.getTime() - todayOnly.getTime();
      const differenceInDays = Math.ceil(
        differenceInTime / (1000 * 60 * 60 * 24)
      );
      return differenceInDays;
      // Return 0 if ended or negative
    } catch (err) {
      return "Not Available";
    }
  }
  useEffect(() => {
    const checkAndUpdateExpiredDrive = async () => {
      try {
        if (!drive) return;

        const endDate = drive.endDate as Date;

        const isExpired = getDaysRemaining(endDate);

        if (isExpired && drive.status !== "completed") {
          await handleEdit(drive.donationDriveId, { status: "completed" });
          console.log(
            `Drive ${drive.campaignName} marked as completed due to expiration`
          );
        }
      } catch (err) {
        console.error("Error checking drive expiration:", err);
      }
    };

    checkAndUpdateExpiredDrive();
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
						<img src={event.image} alt={event.title} className="bg-cover bg-center rounded-t-[10px] h-[230px] w-full object-cover" />
					) : (
						<img src={drive.image} alt={drive.campaignName} className="bg-cover bg-center rounded-t-[10px] h-[230px] w-full object-cover" />
					)}
					{!drive.isEvent && (
						<span className={`absolute top-2 right-2 px-3 py-1 text-sm rounded-full ${
							drive.status === 'active' ? 'bg-green-100 text-green-800' :
							drive.status === 'completed' ? 'bg-blue-100 text-blue-800' :
							drive.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
							'bg-gray-100 text-gray-800'
						}`}>
							{drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
						</span>
					)}
					 <span
            className={`absolute bottom-2 right-2 px-3 py- text-sm rounded-full ${
              drive.status === "active"
                ? "bg-green-100 text-green-800 px-2 py-1 font-bold"
                : drive.status === "completed"
                ? "bg-blue-100 text-blue-800 px-2 py-1 font-bold"
                : drive.status === "pending"
                ? "bg-yellow-100 text-yellow-800 px-2 py-1 font-bold"
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
					{!drive.isEvent && (
						<span className={`absolute top-2 right-2 px-3 py-1 text-sm rounded-full ${
							drive.status === 'active' ? 'bg-green-100 text-green-800' :
							drive.status === 'completed' ? 'bg-blue-100 text-blue-800' :
							drive.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
							'bg-gray-100 text-gray-800'
						}`}>
							{drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
						</span>
					)}
					<span className="text-blue-500 font-medium">
						<ImageOff className="size-[50px]" />
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
								<p className="text-start">
									{event.description.length > 100
											? event.description.slice(0, 100) + "..."
											: event.description
									}
								</p>
							</div>
						) : (
							<div className="mb-5 text-sm h-19 overflow-hidden text-clip">
								<p className="text-start">
									{drive.description.length > 200
											? drive.description.slice(0, 200) + "..."
											: drive.description
									}
								</p>
							</div>
						)}
          {/* Details */}
          {drive.isEvent && event ? (
            <div className="mt-5">
              <div className="mt-5 flex justify-between items-center gap-4">
                <div className="flex gap-1 items-center w-1/3 justify-center">
                  <Calendar className="size-[16px]" />
                  <p className="text-xs">{formatDate(event.datePosted)}</p>
                </div>
                <div className="flex gap-1 items-center w-1/3 justify-center">
                  <Clock className="size-[16px]" />
                  <p className="text-xs">{event.time}</p>
                </div>
                <div className="flex gap-1 items-center w-1/3 justify-center">
                  <MapPin className="size-[16px]" />
                  <p className="text-xs">{event.location}</p>
                </div>
              </div>
              <div className="mt-5 text-xs text-start">
                <p>
                  Donation Type:{" "}
                  {drive.isEvent && event
                    ? "Event-related Campaign"
                    : "General Campaign"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 text-xs text-start">
              <p>
                Donation Type:{" "}
                {drive.isEvent && event
                  ? " Event-related Campaign"
                  : " General Campaign"}{" "}
              </p>
            </div>
          )}
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
      {/* Floating Action Button (FAB) */}
      {/* <button className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full shadow-md hover:bg-blue-600 transition" onClick={() => setShowForm(true)}>
				+
			</button> */}
      {/* Suggest Donation Drive Modal */}
      {/* {showForm && (
				<div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
					<form
					onSubmit={handleSave}
					className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-30"
					>
					<h2 className="text-xl bold mb-4">Suggest Donation Drive</h2>
					<input
						type="text"
						placeholder="Campaign Name"
						value={campaignName}
						onChange={(e) => setCampaignName(e.target.value)}
						className="w-full mb-4 p-2 border rounded"
						required
					/>
					<textarea
						placeholder="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full mb-4 p-2 border rounded"
						required
					/>
					{beneficiary.map( (beneficiaries: string, index: number) => (
						<div key = {index} className="flex justify-between my-1">
							<input
								type="text"
								placeholder="Beneficiary"
								value={beneficiaries}
								onChange={(e) => handleBenefiaryChange(e,index)}
								className="w-full mb-4 p-2 border rounded"
								required
							/>
							{beneficiary.length > 1 && (
								<button 
									type="button" 
									className='px-4 py-2 bg-red-500 text-white rounded-md'
									onClick={() => handleRemoveBeneficiary(index)}>
									Remove
								</button>
                    		)}
                		</div>						
						))}
						<button 
							type="button" 
							className='px-4 py-2 bg-green-500 text-white rounded-md'
							onClick={handleAddBeneficiary}>
                			Add Beneficiary
            			</button>
					<input
						type="number"
						placeholder="Target Amount"
						value={targetAmount}
						onChange={(e) => setTargetAmount(e.target.value)}
						className="w-full mb-4 p-2 border rounded"
						required
					/>
					<label htmlFor="">End Date</label>
					<input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="w-full mb-4 p-2 border rounded"
						required
						min={
						new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
							.toISOString()
							.split("T")[0]
						}
					/>
					<div className="flex justify-between">
						<button
						type="button"
						onClick={() => setShowForm(false)}
						className="text-gray-500"
						>
						Cancel
						</button>
						<div className="flex gap-2">
						<button
							type="submit"
							className="bg-[#0856BA] text-white p-2 rounded-[22px]"
						>
							Suggest
						</button>
						</div>
					</div>
					</form>
				</div>
				)} */}
    </div>
  );
};

export default DonationDriveCard;
