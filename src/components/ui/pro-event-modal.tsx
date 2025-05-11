'use client';
import { useState } from 'react';
import { Event } from '@/models/models';
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
import { useEvents } from '@/context/EventContext';


interface ProEventDetailsModalProps {
  proEvent: Event | null;
  isEventProOpen: boolean;
  onProEventClose: () => void;
  onUpdateEventStat: (alumniId: string, status: string) => void;
  getCampaignName: string;
}

const ProEventDetailsModal = ({
  proEvent,
  isEventProOpen,
  onProEventClose,
  onUpdateEventStat,
  getCampaignName
}: ProEventDetailsModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Safety check
  if (!proEvent) return null;
  
  const handleApprove = () => {
    setIsSubmitting(true);
    try {
      onUpdateEventStat(proEvent.eventId, 'Accepted');
      onProEventClose();
    } catch (error) {
      console.error("Error approving alumni:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject =() => {
    setIsSubmitting(true);
    try {
      onUpdateEventStat(proEvent.eventId, 'Rejected');
      onProEventClose();
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
    <Dialog open={isEventProOpen} onOpenChange={onProEventClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {proEvent.title}
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              proEvent.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
              proEvent.status === 'Approved' ? 'bg-green-100 text-green-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {proEvent.status === 'pending' ? 'Pending' : 
               proEvent.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Proposal Event Information</h3>
            <img
                src={proEvent.image}
                alt={proEvent.title}
                className="w-full h-40 object-cover rounded-md"
              />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Proposed By: </span>
                <span className="font-medium">{proEvent.creatorName || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Time:</span>
                <span className="font-medium">{proEvent.time || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">location</span>
                <span className="font-medium">{proEvent.location || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Number of Attendees:</span>
                <span className="font-medium">{proEvent.numofAttendees || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Donation Drive:</span>
                <span className="font-medium">{getCampaignName}</span>

              </div>
            </div>
          </div>


        </div>

        <DialogFooter className="flex flex-wrap gap-2 justify-between sm:justify-end">
          {proEvent.status === 'Pending' && (
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

export default ProEventDetailsModal;