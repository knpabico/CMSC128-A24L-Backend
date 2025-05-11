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
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {isSubmitted
              ? "Application Submitted"
              : showConfirmation
              ? "Confirm Application"
              : "Apply for Position"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center text-center">
              <CheckCircle size={48} className="text-green-500 mb-4" />
              <h4 className="text-xl font-medium mb-2">
                Application Submitted!
              </h4>
              <p className="text-gray-600 mb-4">
                Your application for {jobTitle} at {companyName} has been sent
                to the hiring manager.
              </p>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-md text-left w-full">
                <p className="text-blue-800 text-sm">
                  <span className="font-medium">What's next?</span>
                </p>
                <ul className="list-disc text-sm text-blue-800 pl-5 mt-2">
                  <li>
                    The hiring manager will be notified of your application
                  </li>
                  <li>Your application status will be updated to "Pending"</li>
                  <li>
                    You may receive an email if your application is successful
                  </li>
                  <li>
                    No need to follow up - the employer will contact you if
                    interested
                  </li>
                </ul>
              </div>
              <button
                onClick={handleClose}
                className="mt-6 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 w-full"
              >
                Close
              </button>
            </div>
          ) : showConfirmation ? (
            <div>
              <div className="flex items-start mb-4">
                <AlertCircle
                  size={24}
                  className="text-amber-500 mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4 className="font-medium mb-2">
                    Please confirm your application
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    By proceeding, your application will be sent directly to the
                    hiring manager at {companyName}.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md mb-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Important:</span> Your
                      application will be notified to the hiring team. Please
                      wait for a possible email if your application is
                      successful. Your status will be updated to "Pending",
                      "Viewed", or "Rejected" as the hiring team reviews it.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    We recommend not sending follow-up emails until at least one
                    week has passed.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApply}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center"
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
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                You're about to apply for the {jobTitle} position at{" "}
                {companyName}.
              </p>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mb-6">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  Before you apply:
                </p>
                <ul className="list-disc text-sm text-blue-800 pl-5">
                  <li>
                    Your application will be sent directly to the hiring manager
                  </li>
                  <li>
                    You'll receive status updates (Pending, Viewed, or Rejected)
                  </li>
                  <li>The employer will contact you by email if interested</li>
                </ul>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
