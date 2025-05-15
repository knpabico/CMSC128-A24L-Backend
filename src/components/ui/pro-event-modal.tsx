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
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Gift, User } from 'lucide-react';

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
  
  const handleReject = () => {
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

  // Status badge style mapper
  const statusStyles = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Rejected: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Dialog open={isEventProOpen} onOpenChange={onProEventClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header with event title and status */}
        <div className="relative bg-gradient-to-r from-[#0856BA] to-[#064392] p-6 text-white rounded-t-lg">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{proEvent.title}</h2>
              <Badge className={`font-medium border ${statusStyles[proEvent.status]}`}>
                {proEvent.status}
              </Badge>
            </div>
            <div className="flex items-center mt-2">
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm opacity-90">Proposed by: {proEvent.creatorName || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Event image banner */}
        <div className="w-full h-56 overflow-hidden">
          {proEvent.image ? (
            <img
              src={proEvent.image}
              alt={proEvent.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        {/* Main content scrollable area */}
        <div className="overflow-auto flex-1 p-6">
          <div className="space-y-6">
            {/* Event Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Event Details</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-[#0856BA] mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium">{proEvent.time || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#0856BA] mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{proEvent.location || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-[#0856BA] mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Number of Attendees</div>
                    <div className="font-medium">{proEvent.numofAttendees || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Gift className="h-5 w-5 text-[#0856BA] mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Donation Drive</div>
                    <div className="font-medium">{getCampaignName || 'None'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description section - if your Event model has a description */}
            {proEvent.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Description</h3>
                <p className="text-gray-700">{proEvent.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with action buttons */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="w-full flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            
            {proEvent.status === 'Pending' && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleReject}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProEventDetailsModal;