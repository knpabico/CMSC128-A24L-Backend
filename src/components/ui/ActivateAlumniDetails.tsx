// AlumniDetailsModal.tsx
import { useState } from 'react';
import { Alumnus } from '@/models/models';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { Timestamp } from 'firebase/firestore'; 
import { RegStatus } from '@/types/alumni/regStatus';
import { useAlums } from '@/context/AlumContext';


interface AlumniDetailsModalProps {
  alumnus: Alumnus | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRegStatus: (alumniId: string, regStatus: RegStatus) => void;
}

const AlumniDetailsModal = ({
  alumnus,
  isOpen,
  onClose,
  onUpdateRegStatus,
}: AlumniDetailsModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Safety check
  if (!alumnus) return null;
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateRegStatus(alumnus.alumniId, 'approved');
      onClose();
    } catch (error) {
      console.error("Error approving alumni:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateRegStatus(alumnus.alumniId, 'rejected');
      onClose();
    } catch (error) {
      console.error("Error rejecting alumni:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format dates safely
  const formatDateSafe = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      return date instanceof Date 
        ? date.toLocaleDateString() 
        : new Date(date).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Helper function to format dates safely
  const formatDateWithDay = (raw?: Timestamp): string => {
    if (!raw) return 'N/A';

    const dt = raw.toDate();
    if (isNaN(dt.getTime())) return 'Invalid Date';
  
    const m = dt.getMonth() + 1;   // months are 0–11
    const d = dt.getDate();        // day of month 1–31
    const y = dt.getFullYear();    
  
    return `${m}/${d}/${y}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {alumnus.firstName} {alumnus.middleName} {alumnus.lastName} {alumnus.suffix}
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              alumnus.regStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              alumnus.regStatus === 'approved' ? 'bg-green-100 text-green-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {alumnus.regStatus === 'pending' ? 'Pending' : 
               alumnus.regStatus === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Student Number</span>
                <span className="font-medium">{alumnus.studentNumber || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{alumnus.email || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Age</span>
                <span className="font-medium">{alumnus.age || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Birth Date</span>
                <span className="font-medium">{formatDateWithDay(alumnus.birthDate)}</span>
              </div>
            </div>
          </div>

          {/* Academic & Professional Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Academic & Professional</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Graduation Year</span>
                <span className="font-medium">{alumnus.graduationYear?.toString() || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Job Title</span>
                <span className="font-medium">{alumnus.jobTitle?.toString() || 'N/A'}</span>
              </div>
              <div className="flex flex-col col-span-2">
                <span className="text-gray-500">Fields of Interest</span>
                <span className="font-medium">
                  {alumnus.fieldOfInterest?.length > 0 
                    ? alumnus.fieldOfInterest.join(', ') 
                    : 'None specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Address & Contact</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Address</span>
                <span className="font-medium">
                  {alumnus.address?.length > 0 ? alumnus.address.join(', ') : 'No address provided'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Contact Privacy</span>
                <span className="font-medium">{alumnus.contactPrivacy ? 'Private' : 'Public'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Newsletter Subscription</span>
                <span className="font-medium">{alumnus.subscribeToNewsletter ? 'Subscribed' : 'Not Subscribed'}</span>
              </div>
            </div>
          </div>

          {/* Registration & System Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Registration & System</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Registration Status</span>
                <span className="font-medium capitalize">{alumnus.regStatus}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Approval Date</span>
                <span className="font-medium">{formatDateSafe(alumnus.approvalDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium">{formatDateSafe(alumnus.lastLogin)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Alumni ID</span>
                <span className="font-medium">{alumnus.alumniId}</span>
              </div>
            </div>
          </div>


        </div>

        <DialogFooter className="flex flex-wrap gap-2 justify-between sm:justify-end">
          {alumnus.regStatus === 'pending' && (
            <>
              <Button 
                onClick={handleApprove}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve Registration
              </Button>
              <Button 
                onClick={handleReject}
                disabled={isSubmitting}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Registration
              </Button>
            </>
          )}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlumniDetailsModal;