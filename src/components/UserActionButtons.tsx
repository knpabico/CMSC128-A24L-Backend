"use client";

import { Button } from "@/components/ui/button";
import { useAlums } from "@/context/AlumContext";
import { Check, EyeIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserActionButtonsProps {
  alumniId: string;
  alumniEmail: string;
  alumniName: string;
  regStatus: string;
}

export function UserActionButtons({
  alumniId,
  alumniEmail,
  alumniName,
  regStatus,
}: UserActionButtonsProps) {
  const { updateAlumnus } = useAlums();
  const router = useRouter();
  const handleApprove = async () => {
    try {
      const data = await updateAlumnus(
        alumniId,
        alumniEmail,
        "approved",
        alumniName
      );
      console.log("Approved alumni with ID:", alumniId, data);
    } catch (error) {
      console.error("Error approving alumni:", error);
    }
  };

  const handleReject = async () => {
    try {
      const data = await updateAlumnus(
        alumniId,
        alumniEmail,
        "rejected",
        alumniName
      );
      console.log("Rejected alumni with ID:", alumniId, data);
    } catch (error) {
      console.error("Error approving alumni:", error);
    }
  };

  const handleView = () => {
    // Add your view logic here
    router.push(`/admin-dashboard/manage-users/${alumniId}`); // Example: navigate to the alumni details page
    console.log("Viewing alumni with ID:", alumniId);
  };

  return (
    <div className="flex gap-3">
      {regStatus !== "approved" && (
        <Button onClick={handleApprove} variant="outline" size="sm">
          <Check />
        </Button>
      )}
      {regStatus === "pending" && (
        <Button onClick={handleReject} variant="outline" size="sm">
          <X />
        </Button>
      )}
      <Button onClick={handleView} variant="outline" size="sm">
        <EyeIcon />
      </Button>
    </div>
  );
}
