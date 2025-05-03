import { useState, useEffect, FC, ChangeEvent } from "react";
import { Loader2, X } from "lucide-react";
import { sendVerificationCode } from "@/lib/emailTemplate";
import { toastError } from "@/components/ui/sonner";

interface VerificationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerify: () => void;
  isLoadingModal: boolean;
  isCodeSent: boolean;
  onCodeSent: () => void; // Callback to update parent component state
}

export const VerificationCodeModal: FC<VerificationCodeModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerify,
  isLoadingModal,
  isCodeSent,
  onCodeSent,
}) => {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number>(300); // 5 minutes in seconds
  const [isResending, setIsResending] = useState<boolean>(false);
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);

  // Generate random verification code only when needed
  useEffect(() => {
    if (isOpen && !isCodeSent) {
      generateVerificationCode();
      setUserInput("");
      setErrorMessage("");
      // Set expiry timestamp 5 minutes from now
      const expiry = Date.now() + 300 * 1000;
      setExpiryTimestamp(expiry);
      onCodeSent(); // Let parent know code was sent
    } else if (isOpen) {
      // Just reset UI state on reopen
      setUserInput("");
      setErrorMessage("");
    }
  }, [isOpen, isCodeSent]);

  // Persistent countdown timer that works even when modal is closed
  useEffect(() => {
    // Don't set up timer if no expiry timestamp
    if (!expiryTimestamp) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.floor((expiryTimestamp - now) / 1000);

      if (secondsLeft <= 0) {
        setRemainingTime(0);
        clearInterval(timer);
        if (isOpen) {
          setErrorMessage("Code has expired. Please request a new code.");
        }
      } else {
        setRemainingTime(secondsLeft);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [expiryTimestamp, isOpen]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Generate a random 6-digit verification code
  const generateVerificationCode = (): void => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    console.log("Generated verification code (hidden from user):", code);
    sendVerificationCode(code, email);
  };

  const handleResendCode = (): void => {
    setIsResending(true);
    generateVerificationCode();

    // Reset expiry time 5 minutes from now
    const expiry = Date.now() + 300 * 1000;
    setExpiryTimestamp(expiry);
    setErrorMessage("");

    // Simulate email sending delay
    setTimeout(() => {
      setIsResending(false);
    }, 2000);
  };

  const handleVerify = (): void => {
    if (!userInput) {
      toastError("Please enter the verification code");
      return;
    }
    if (remainingTime === 0) {
      toastError("Code has expired. Please request a new code.");
      return;
    }
    if (userInput === verificationCode) {
      onVerify();
    } else {
      toastError("Invalid verification code. Please try again.");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, "");
    setUserInput(value);
    setErrorMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/10">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Email Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            We&apos;ve sent a verification code to:
          </p>
          <p className="font-medium text-gray-800 mb-4">{email}</p>
          <p className="text-gray-600 mb-2">
            Please enter the 6-digit code to verify your email address.
          </p>
          <p className="text-sm text-gray-500">
            Code expires in:{" "}
            <span className="font-medium">{formatTime(remainingTime)}</span>
          </p>
        </div>
        <div className="mb-6">
          <label
            htmlFor="verificationCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Verification Code
          </label>
          <input
            id="verificationCode"
            type="text"
            maxLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 6-digit code"
            value={userInput}
            onChange={handleInputChange}
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex justify-center items-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleVerify}
          >
            {isLoadingModal ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Verify"
            )}
          </button>

          <button
            className="flex-1 text-blue-600 py-2 px-4 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            onClick={handleResendCode}
            disabled={isResending || remainingTime > 240} // Prevent spam resending (allow resend after 1 min)
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Didn&apos;t receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};
