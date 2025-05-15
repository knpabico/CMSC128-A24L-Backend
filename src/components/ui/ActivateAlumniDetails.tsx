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
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, MapPin, BookOpen, Briefcase, Activity } from 'lucide-react';

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

  // Helper function to format dates from Timestamp
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
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header with profile image and basic info */}
        <div className="relative bg-gradient-to-r from-[#0856BA] to-[#064392] p-6 text-white rounded-t-lg">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              {alumnus.image ? (
                <img 
                  src={alumnus.image} 
                  alt={`${alumnus.firstName} ${alumnus.lastName}`}
                  className="aspect-square object-cover" 
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-800 text-xl font-semibold">
                  {alumnus.firstName?.[0]}{alumnus.lastName?.[0]}
                </div>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {alumnus.firstName} {alumnus.middleName} {alumnus.lastName} {alumnus.suffix}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`font-medium border ${statusStyles[alumnus.regStatus]}`}>
                  {alumnus.regStatus.charAt(0).toUpperCase() + alumnus.regStatus.slice(1)}
                </Badge>
                {alumnus.jobTitle && (
                  <span className="text-sm opacity-90 flex items-center">
                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                    {alumnus.jobTitle}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content scrollable area */}
        <div className="overflow-auto flex-1 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{alumnus.email || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Birth Date</div>
                    <div className="font-medium">{formatDateWithDay(alumnus.birthDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Student Number</div>
                    <div className="font-medium">{alumnus.studentNumber || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium">
                      {alumnus.address?.length > 0 
                        ? alumnus.address.join(', ') 
                        : 'No address provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Academic & Professional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic & Professional</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Graduation Year</div>
                    <div className="font-medium">{alumnus.graduationYear?.toString() || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-500">Job Title</div>
                    <div className="font-medium">{alumnus.jobTitle || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Activity className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Fields of Interest</div>
                    <div className="font-medium">
                      {alumnus.fieldOfInterest?.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alumnus.fieldOfInterest.map(field => (
                            <Badge key={field} variant="outline" className="bg-blue-50">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        'None specified'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact & Privacy */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact & Privacy</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 p-2 rounded-md">
                    <div className="text-sm font-medium">Contact Privacy</div>
                    <Badge variant={alumnus.contactPrivacy ? "secondary" : "outline"} className="mt-1">
                      {alumnus.contactPrivacy ? 'Private' : 'Public'}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-100 p-2 rounded-md">
                    <div className="text-sm font-medium">Newsletter</div>
                    <Badge variant={alumnus.subscribeToNewsletter ? "secondary" : "outline"} className="mt-1">
                      {alumnus.subscribeToNewsletter ? 'Subscribed' : 'Not Subscribed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* System Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">System Information</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-100 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Registration Status</div>
                  <div className="font-medium capitalize">{alumnus.regStatus}</div>
                </div>
                
                <div className="bg-gray-100 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Approval Date</div>
                  <div className="font-medium">{formatDateSafe(alumnus.approvalDate)}</div>
                </div>
                
                <div className="bg-gray-100 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Last Login</div>
                  <div className="font-medium">{formatDateSafe(alumnus.lastLogin)}</div>
                </div>
                
                <div className="bg-gray-100 p-2 rounded-md">
                  <div className="text-xs text-gray-500">Age</div>
                  <div className="font-medium">{alumnus.age || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="w-full flex justify-between">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            
            {alumnus.regStatus === 'pending' && (
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

export default AlumniDetailsModal;