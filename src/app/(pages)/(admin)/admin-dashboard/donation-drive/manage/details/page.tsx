"use client";

import { ProofOfPaymentDialog } from "@/app/(pages)/(alumni)/donationdrive-list/donations/ProofOfPaymentDialog";
import { toastSuccess } from "@/components/ui/sonner";
import { useDonationContext } from "@/context/DonationContext";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { db } from "@/lib/firebase";
import { Donation, DonationDrive } from "@/models/models";
import { doc, getDoc } from "firebase/firestore";
import { Asterisk, Calendar, ChevronRight, CirclePlus, Clock, MapPin, Pencil, Trash2, Upload, Users2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AddDonationDrive() {
		const {
			donationDrives,
			events,
			isLoading,
			addDonationDrive,
			showForm,
			setShowForm,
			handleGcashChange,
			handlePaymayaChange,
			handleImageChange,
			handleBenefiaryChange,
			handleAddBeneficiary,
			handleRemoveBeneficiary,
			handleSave,
			handleEdit,
			handleDelete,
			campaignName,
			setCampaignName,
			description,
			setDescription,
			creatorId,
			setCreatorId,
			image,
			setImage,
			fileName,
			setFileName,
			preview,
			setPreview,
			previewGcash,
			previewPaymaya,
			targetAmount,
			setTargetAmount,
			isEvent,
			setIsEvent,
			eventId,
			setEventId,
			endDate,
			setEndDate,
			status,
			setStatus,
			oneBeneficiary, 
			setOneBeneficiary,
			beneficiary,
			setBeneficiary,
			getDonationDriveById,
			getEventById,
			fetchAlumnusById,
		} = useDonationDrives();
	const router = useRouter();
  const buttonsContainerRef = useRef(null);
  const placeholderRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const donationDriveId = searchParams.get('id');
  const { getDonationsByDonationDrive } = useDonationContext();
  const [donationDrive, setDonationDrive] = useState<DonationDrive>();
  const [event, setEvent] = useState<Event | null>(null);
  const [donations, setDonations] = useState<(Donation & { displayName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null); 
  const [isInformationOpen, setIsInformationOpen] = useState(true);
  const [mainPhoto, setMainPhoto] = useState("");
  const [qrGcash, setQrGcash] = useState("");
  const [qrPaymaya, setQrPaymaya] = useState("");
  
  // Format date function with improved type safety
  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate?.() || new Date(timestamp);
      return isNaN(date.getTime()) 
        ? 'Invalid Date' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid Date';
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: any) => {
    try {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      }
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } catch (err) {
      return '';
    }
  };

//Calculate Days Remaining
  const getRemainingDays = (endDate: any) => {
    try {
      const today = new Date(); // Current date
      const end = new Date(endDate); // Firestore Timestamp to JS Date
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return "Expired";
      else if (diffDays === 1) return "1 day left";
      else return `${diffDays} days left`;
    } catch (err) {
      return "Invalid Date";
    }
  };

  // Calculate progress percentage 
  const calculateProgress = (current: number, target: number): string => {
    if (target <= 0 || isNaN(target) || isNaN(current)) return '0';
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  useEffect(() => {
		if (!donationDriveId) {
			setError('No donation drive ID provided');
			setLoading(false);
			return;
		}
	
		const fetchDonationDrive = async () => {
			try {
				setLoading(true);
				setError(null);
	
				const data = await getDonationDriveById(donationDriveId);
				if (!data) {
					throw new Error('Donation drive not found');
				}
				
				let formattedEndDate = null;
				try {
					if (data.endDate) {
						// If it's a Firestore timestamp
						if (typeof data.endDate.toDate === 'function') {
							formattedEndDate = data.endDate.toDate();
						} 
						// If it's already a Date object
						else if (data.endDate instanceof Date) {
							formattedEndDate = data.endDate;
						} 
						// If it's a string or number
						else {
							formattedEndDate = new Date(data.endDate);
							// Validate the date is valid
							if (isNaN(formattedEndDate.getTime())) {
								console.warn("Invalid endDate format:", data.endDate);
								formattedEndDate = null;
							}
						}
					}
				} catch (dateError) {
					console.error("Error parsing endDate:", dateError);
					formattedEndDate = null;
				}
				
				// Set all state variables
				setDonationDrive(data);
				setCampaignName(data.campaignName || '');
				setImage(data.image || '');
				// Handle beneficiary based on its expected type
				if (Array.isArray(data.beneficiary)) {
					setBeneficiary(data.beneficiary);
				} else if (data.beneficiary) {
					// If it's a string, convert to array
					setBeneficiary([data.beneficiary]);
				} else {
					// Default empty array
					setBeneficiary(['']);
				}
				setDescription(data.description || '');
				setTargetAmount(data.targetAmount || 0);
				setEndDate(formattedEndDate); 
				setShowForm(true);
				setMainPhoto(data.image || null);
				setQrGcash(data.qrGcash || null);
				setQrPaymaya(data.qrPaymaya || null);
				
				if (data.isEvent && data.eventId) {
					await fetchEventDetails(data.eventId);
				}
			} catch (err) {
				console.error('Error fetching donation drive:', err);
				setError(err instanceof Error ? err.message : 'Failed to load donation drive details');
			} finally {
				setLoading(false);
			}
		};
	
		fetchDonationDrive();
	}, [donationDriveId]);
  
    // Fetch event details if this donation drive is related to an event
    const fetchEventDetails = async (eventId: string) => {
      try {
        setEventLoading(true);
        const eventRef = doc(db, "event", eventId);
        const eventSnap = await getDoc(eventRef);
  
        if (eventSnap.exists()) {
          const eventData = eventSnap.data() as Event;
          // setEvent({ ...eventData, eventId });
        } else {
          console.warn('Event not found for ID:', eventId);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setEventLoading(false);
      }
    };
  
    useEffect(() => {
      const fetchDonations = async () => {
        if (!donationDriveId) return;
  
        try {
          setDonationsLoading(true); // Set loading to true at the start
  
          // Use the updated function with donationDriveId parameter
          const donationsData = await getDonationsByDonationDrive(donationDriveId);
  
          // Fetch donor details for non-anonymous donations
          const enhancedDonations = await Promise.all(
            donationsData.map(async (donation) => {
              // Skip fetching details for anonymous donations
              if (donation.isAnonymous) {
                return { ...donation, displayName: 'Anonymous' };
              }
  
              try {
                // Directly fetch donor details from Firestore using the alumniId from the donation
                const donorRef = doc(db, "alumni", donation.alumniId);
                const donorSnap = await getDoc(donorRef);
  
                if (donorSnap.exists()) {
                  const donorData = donorSnap.data();
                  return { 
                    ...donation, 
                    displayName: `${donorData.firstName || ''} ${donorData.lastName || ''}`.trim() || 'Unknown'
                  };
                } else {
                  return { ...donation, displayName: 'Unknown' };
                }
              } catch (error) {
                console.error(`Error fetching donor info for ${donation.alumniId}:`, error);
                return { ...donation, displayName: 'Unknown' };
              }
            })
          );
  
          setDonations(enhancedDonations);
          setDonationsLoading(false);
        } catch (err) {
          console.error('Error fetching donations:', err);
        } finally {
          setDonationsLoading(false); // Make sure loading is set to false whether successful or not
        }
      };
  
      fetchDonations();
    }, [donationDriveId, getDonationsByDonationDrive]);
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      );
    }

  const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setIsSubmitting(true);
			setIsError(false);
			setMessage("");
			await handleEdit(donationDriveId, {
				campaignName,
				description,
				beneficiary,
				targetAmount,
				endDate,
		});
			toastSuccess("Donation drive successfully edited");
			setIsEditing(false);
		} catch (error) {
			console.error("Error saving donation drive:", error);
			setMessage("Failed to edit donation drive.");
			setIsError(true);
		} finally {
      setIsSubmitting(false);
    }
	};
	const manage = () => {
    router.push("/admin-dashboard/donation-drive/manage");
  };

	const home = () => {
    router.push("/admin-dashboard");
  };
	

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="hover:text-blue-600 cursor-pointer" onClick={home}>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="hover:text-blue-600 cursor-pointer" onClick={manage}>
          Manage Donation Drive
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">
          {donationDrive?.campaignName}
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            {campaignName}
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300" onClick={() => setIsEditing(true)}>
              <Pencil size={18} /> Edit Donation Drive
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Not editable details */}
				<div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
					<div className="space-y-2 flex items-center justify-between px-2">
						<label htmlFor="name" className="text-md font-medium">
							Donation Drive Informations
						</label>
						<button onClick={() => setIsInformationOpen(!isInformationOpen)} className="text-sm text-blue-600 hover:underline" >
								{isInformationOpen ? 'Hide Details' : 'Show Details'}
						</button>
					</div>
					{isInformationOpen && (
						<>
							{/* Progress bar */}
							<div className="py-2 px-6">
								<div className="flex justify-between mb-1">
									<div className='flex gap-2'>
											<Users2 className='size-[20px] text-[#616161]'/>
											<span className="text-sm text-gray-500"> {donationDrive?.donorList.length ?? '0'} Patrons</span>
									</div>
									<div className='flex gap-2'>
											<Clock className='size-[17px] text-[#616161]'/>
											<span className="text-sm text-gray-500">{getRemainingDays(donationDrive?.endDate)}</span>
									</div>
								</div>
								<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
									<div className="h-full bg-blue-500 rounded-full" style={{ width: `${calculateProgress(donationDrive.currentAmount, donationDrive.targetAmount)}%` }}></div>
								</div>
								<div className="flex justify-between my-1 text-sm">
									<span className="font-medium">₱ {donationDrive.currentAmount.toLocaleString()}</span>
									<span className="text-gray-500"> ₱ {donationDrive.targetAmount.toLocaleString()}</span>
								</div>
							</div>
							<div className="rounded-lg py-1 px-6">
								{donationsLoading ? (
									<div className="flex justify-center py-4">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
									</div>
								) : donations.length > 0 ? (
									<div className="overflow-x-auto">
										<label htmlFor="name" className="text-md font-medium flex items-center">
											List of Donations
										</label>
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-100">
												<tr>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Donor
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Amount
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Payment Method
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
															Date
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Anonymous
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Proof
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{donations.map((donation) => (
													<tr key={donation.donationId} className="hover:bg-gray-50">
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
																{donation.displayName}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
															₱{donation.amount?.toLocaleString() || '0'}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
																{donation.paymentMethod.toUpperCase()}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
																{formatDate(donation.date)}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
																{donation.isAnonymous ? "Anonymous" : "Not Anonymous"}
														</td>
														<td>
															<button onClick={() => { setSelectedDonationId(donation.donationId); setSelectedImage(donation.imageProof); }} // Adjust with the correct image path
																className="text-blue-500 hover:underline text-sm">
																View Proof
															</button>
																{selectedDonationId === donation.donationId && selectedImage && (
																	<ProofOfPaymentDialog
																		selectedImage={selectedImage}
																		setSelectedImage={setSelectedImage}
																	/>
																)}
															</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
										<p className="text-gray-500 py-4 text-center">No donations have been made for this sponsorship yet.</p>
								)}
							</div>
							{donationDrive?.isEvent && event && (
								<div className="space-y-2">
									<div className=' flex justify-between items-center gap-4'>
										<div className='flex gap-1 items-center justify-center'>
											<Calendar className='size-[20px]' />
											<p className='text-sm'>{formatDate(event.datePosted)}</p>
										</div>
										<div className='flex gap-1 items-center justify-center'>
											<Clock className='size-[20px]' />
											<p className='text-sm'>{event.time}</p>
										</div>
										<div className='flex gap-1 items-center justify-center'>
											<MapPin className='size-[20px]' />
											<p className='text-sm'>{event.location}</p>
										</div>
										<div className='flex gap-1 items-center justify-center'>
											<Users2 className='size-[20px]' />
											<p className='text-sm'>{event.numofAttendees || 0} attendees</p>
										</div>
									</div>
								</div>
							)}
							<div className="py-1 px-6">
								<p className="text-sm font-medium flex items-center">
									<span className="font-medium">Start: </span> 
									{formatDate(donationDrive?.startDate)}
								</p>
								<p className="text-sm font-medium flex items-center">
									<span className="font-medium">End:</span> 
									{formatDate(donationDrive?.endDate)}
								</p>
								<p className="text-sm font-medium flex items-center">
									<span className="font-medium">Date Posted: </span> 
									{formatDate(donationDrive?.datePosted)} 
									<span className="text-gray-400 text-sm ml-2">({formatTimeAgo(donationDrive?.datePosted)})</span>
								</p>
							</div>
						</>
					)}
					
        </div>
        {/* Editable Details */}
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{/* Campaign Name */}
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/>Campaign Name
              </label>
							<input type="text" placeholder="Campaign Name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required disabled={!isEditing}/>
						</div>
						{/* Description */}
						<div className="space-y-2">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Description
              </label>
							<textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required disabled={!isEditing}/>
						</div>
						{/* Beneficiary */}
						<div className="space-y-2">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Beneficiary
              </label>
							{beneficiary.map((beneficiaries: string, index: number) => (
								<div key={index} className="flex justify-between my-1">
										<input type="text" placeholder="Beneficiary" value={beneficiaries} onChange={(e) => handleBenefiaryChange(e, index)}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required disabled={!isEditing}/>
										{beneficiary.length > 1 && (
											<button type="button" className="px-4 py-2 text-gray-700 rounded-md hover:cursor-pointer" onClick={() => handleRemoveBeneficiary(index)} ><Trash2 /></button>)}
								</div>
							))}
							{isEditing && (
                <button type="button" className="px-1 my-3 text-blue-500 rounded-md flex gap-3 hover:cursor-pointer w-fit" onClick={handleAddBeneficiary}>
                  <CirclePlus />
                  Add Beneficiary
							  </button>
              )}
						</div>
						{/* Target Amount */}
						<div className="space-y-1">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Target Amount
              </label>
							<input type="number" placeholder="Target Amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required disabled={!isEditing}/>
						</div>
						{/* End Date */}
						<div className="space-y-1">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> End Date
              </label>
							<input 
								type="date" 
								value={
									endDate instanceof Date && !isNaN(endDate.getTime())
										? endDate.toISOString().split("T")[0]
										: endDate
								} 
								onChange={(e) => {
									setEndDate(e.target.value)
								}} 
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" 
								required 
								min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} 
								disabled={!isEditing}
							/>
						</div>
						{/* Photo Uploads */}
						<div className="space-y-1 flex justify-around my-1">
							{/* Main Photo */}
							<div className="text-start flex flex-col gap-3">
								{(preview || mainPhoto) && (
									<div className="space-y-1">
										<p className="text-sm font-medium flex items-center justify-center gap-3 py-2">Background Photo Preview:</p>
										<img src={preview ? preview : mainPhoto} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }}/>
									</div>
								)}
								{isEditing && (
									<>
										<label htmlFor="image-upload" className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3 py-2">
										<Upload className="size-5"/>
										Change Photo
										</label>
									</>
								)}
								<input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={!isEditing}/>
							</div>
							{/* GCASH */}
							<div className="text-start flex flex-col gap-3">
								{(previewGcash || qrGcash) && (
									<div className="space-y-1">
										<p className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3 py-2">Gcash QR Code Preview:</p>
										<img src={previewGcash ? previewGcash : qrGcash} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }}/>
									</div>
								)}
								{isEditing && (
									<>
										<label htmlFor="gcash-upload" className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3 py-2">
											<Upload className="size-5"/>
											Change Gcash QR Code
										</label>
									</>
								)}
								<input id="gcash-upload" type="file" accept="image/*" onChange={handleGcashChange} className="hidden" disabled={!isEditing} />
							</div>
							{/* PayMaya */}
							<div className="text-start flex flex-col gap-3">
								{(previewPaymaya || qrPaymaya) && (
									<div className="space-y-1">
										<p className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3 py-2">Paymaya QR Code Preview:</p>
										<img src={previewPaymaya ? previewPaymaya : qrPaymaya} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }}/>
									</div>
								)}
								{isEditing && (
									<>
										<label htmlFor="paymaya-upload" className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3 py-2">
											<Upload className="size-5"/>
											Change PayMaya QR Code
										</label>
									</>
								)}
								<input id="paymaya-upload" type="file" accept="image/*" onChange={handlePaymayaChange} className="hidden" disabled={!isEditing}/>
							</div>
						</div>
						{message && (
								<p className={`w-full text-center ${isError ? "text-red-600" : "text-green-600"}`}>
									{message}
								</p>
							)}
						{/* Buttons */}
						{isEditing && (
							<div ref={placeholderRef} className="bg-white rounded-2xl p-4 flex justify-end gap-2">
								<button type="button" className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300" onClick={() => setIsEditing(false)}>
								Cancel
								</button>
								<button type="submit" className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]">
									{isSubmitting ? "Processing…" : "Save Changes"}
								</button>
							</div>
						)}
					</form>
        </div>
      </div>
    </div>
  );
}