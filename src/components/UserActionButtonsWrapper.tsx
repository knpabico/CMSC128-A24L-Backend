"use client";
import { UserActionButtons as OriginalUserActionButtons } from "@/components/UserActionButtons";

// This is a wrapper component that handles the event locally and then calls back to the parent
export function UserActionButtons({
  alumniEmail,
  alumniId,
  alumniName,
  alumniStatus,
  onRemoveId,
  onRemoveCallback,
}: {
  alumniEmail: string;
  alumniId: string;
  alumniName: string;
  alumniStatus: string;
  onRemoveId: string;
  onRemoveCallback: (id: string) => void;
}) {
  // Handle the removal locally, then call the parent callback
  const handleRemove = () => {
    onRemoveCallback(onRemoveId);
  };

  return (
    <OriginalUserActionButtons
      alumniEmail={alumniEmail}
      alumniId={alumniId}
      alumniName={alumniName}
      alumniStatus={alumniStatus}
      onRemove={handleRemove}
    />
  );
}
