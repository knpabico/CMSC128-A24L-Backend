import { useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

// Modal props interface
interface JobApplicationModalProps {
  isOpen: boolean;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export default function JobApplicationModal({
  isOpen,
  jobTitle,
  companyName,
  onClose,
  onSubmit,
}: JobApplicationModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset states when modal closes
  const handleClose = () => {
    onClose();
    // Reset confirmation and submitting states after animation
    setTimeout(() => {
      setShowConfirmation(false);
      setIsSubmitting(false);
      if (isSubmitted) setIsSubmitted(false);
    }, 300);
  };

  const handleApplyClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmApply = async () => {
    setIsSubmitting(true);

    try {
      await onSubmit();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50 border-s-0">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-2xl">
            {isSubmitted
              ? "Application Submitted"
              : showConfirmation
              ? "Confirm Application"
              : "Apply for Position"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <hr className="my-2 border-t border-gray-300" />

        <p className="text-gray-600 mb-4 mt-4">
          {isSubmitted
            ? `Your application for ${jobTitle} at ${companyName} has been sent to the hiring manager.`
            : showConfirmation
            ? `By proceeding, your application will be sent directly to the hiring manager at ${companyName}.`
            : `You're about to apply for the ${jobTitle} position at ${companyName}.`}
        </p>

        {isSubmitting ? (
          <div className="flex justify-center items-center py-10">
            <h1 className="text-xl">Loading...</h1>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="bg-white flex flex-col justify-center rounded-2xl overflow-hidden w-full p-2">
              {isSubmitted ? (
                <div className="flex flex-col items-center text-center">
                  <CheckCircle size={69} className="text-green-500 mb-4" />
                  {/* <h4 className="text-xl font-medium mb-6">
                    Application Submitted!
                  </h4> */}
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-md text-left w-full">
                    <p className="text-blue-800 text-sm">
                      <span className="font-medium">What&apos;s next?</span>
                    </p>
                    <ul className="list-disc text-sm text-blue-800 pl-5 mt-2">
                      <li>
                        The hiring manager will be notified of your application
                      </li>
                      <li>
                        Your application status will be updated to
                        &quot;Pending&quot;
                      </li>
                      <li>
                        You may receive an email if your application is successful
                      </li>
                      <li>
                        No need to follow up - the employer will contact you if
                        interested
                      </li>
                    </ul>
                  </div>
                </div>
              ) : showConfirmation ? (
                <div>
                  {/* Separate div for icon and heading */}
                  <div className="flex items-center mb-4">
                    <AlertCircle
                      size={24}
                      className="text-amber-500 mr-3 flex-shrink-0"
                    />
                    <h4 className="font-medium">
                      Please confirm your application
                    </h4>
                  </div>
                  
                  {/* Content aligned with icon start position */}
                  <div>
                    <div className="bg-gray-50 p-3 rounded-md mb-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Important:</span> Your
                        application will be notified to the hiring team. Please
                        wait for a possible email if your application is
                        successful. Your status will be updated to
                        &quot;Pending&quot;, &quot;Viewed&quot;, or
                        &quot;Rejected&quot; as the hiring team reviews it.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      We recommend not sending follow-up emails until at least one
                      week has passed.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mb-6">
                    <p className="text-blue-800 text-sm font-medium mb-2">
                      Before you apply:
                    </p>
                    <ul className="list-disc text-sm text-blue-800 pl-5">
                      <li>
                        Your application will be sent directly to the hiring manager
                      </li>
                      <li>
                        You&apos;ll receive status updates (Pending, Viewed, or
                        Rejected)
                      </li>
                      <li>The employer will contact you by email if interested</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              {isSubmitted ? (
                <button
                  onClick={handleClose}
                  className="w-full h-10 cursor-pointer rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                >
                  Close
                </button>
              ) : showConfirmation ? (
                <>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-gray-400 text-sm font-semibold text-gray-700 shadow-inner shadow-white/10 transition-all duration-300 hover:bg-red-700 hover:text-white hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApply}
                    disabled={isSubmitting}
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "I am sure, proceed"
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleClose}
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-gray-400 text-sm font-semibold text-gray-700 shadow-inner shadow-white/10 transition-all duration-300 hover:bg-red-700 hover:text-white hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyClick}
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                  >
                    Apply
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};