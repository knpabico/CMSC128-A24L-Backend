"use client";

import { toastError, toastSuccess } from "@/components/ui/sonner";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { Asterisk, ChevronRight, CirclePlus, Pencil, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AddDonationDrive() {
	const router = useRouter();
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
		qrGcash, 
        setQrGcash, 
        fileGcashName, 
        setFileGcashName, 
        previewGcash, 
        setPreviewGcash, 
        qrPaymaya, 
        setQrPaymaya, 
        filePaymayaName, 
        setFilePaymayaName, 
        previewPaymaya, 
        setPreviewPaymaya,
        image,
        setImage,
        fileName,
        setFileName,
        preview,
        setPreview,
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
	const [isSticky, setIsSticky] = useState(false);
	const buttonsContainerRef = useRef(null);
	const placeholderRef = useRef(null);
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();	
		if (!preview || !previewGcash || !previewPaymaya) {
			if (!preview) toastError("No image selected for backgorund photo")
			if (!previewGcash) toastError("No image selected for GCASH QR")
			if (!previewPaymaya) toastError("No image selected for PayMaya QR")
			return;
		}

		try {
			setIsSubmitting(true);
			await handleSave(e);
			toastSuccess("Donation drive successfully created");
		} catch (error) {
			console.error("Error saving donation drive:", error);
			toastError("Failed to create donation drive.");
		} finally {
		setIsSubmitting(false);
		}
	};
	useEffect(() => {
		const setReset = () => {
			setCampaignName("");
			setDescription("");
			setBeneficiary([]);
			setTargetAmount(0);
			setStatus("active");
        	setQrGcash(null);  
			setFileGcashName("");
			setPreviewGcash(null); 
			setQrPaymaya(null); 
			setFilePaymayaName(""); 
			setPreviewPaymaya(null); 
			setImage(null); 
			setFileName("");
			setPreview(null); 
		}
	
		setReset();
	}, []);

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
        <div>
          Add Donation Drive
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Add Donation Drive
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{/* Campaign Name */}
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/>Campaign Name
              </label>
							<input type="text" placeholder="Campaign Name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
						</div>
						{/* Description */}
						<div className="space-y-2">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Description
              </label>
							<textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
						</div>
						{/* Beneficiary */}
						<div className="space-y-2">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Beneficiary
              </label>
							{beneficiary.map((beneficiaries: string, index: number) => (
								<div key={index} className="flex justify-between my-1">
										<input type="text" placeholder="Beneficiary" value={beneficiaries} onChange={(e) => handleBenefiaryChange(e, index)}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
										{beneficiary.length > 1 && (
											<button type="button" className="px-4 py-2 text-gray-700 rounded-md hover:cursor-pointer" onClick={() => handleRemoveBeneficiary(index)}><Trash2 /></button>)}
								</div>
							))}
							<button type="button" className="px-1 my-3 text-blue-500 rounded-md flex gap-3 hover:cursor-pointer w-fit" onClick={handleAddBeneficiary}>
								<CirclePlus />
								Add Beneficiary
							</button>
						</div>
						{/* Target Amount */}
						<div className="space-y-1">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> Target Amount
              </label>
							<input type="number" placeholder="Target Amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
						</div>
						{/* End Date */}
						<div className="space-y-1">
							<label htmlFor="bio" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600"/> End Date
              </label>
							<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} />
						</div>
						{/* Photo Uploads */}
						<div className="space-y-1 flex justify-around my-1">
							{/* Main Photo */}
							<div className="text-start flex flex-col gap-3">
								{preview && (
									<div className="space-y-1">
										<p>Preview:</p>
										<img src={preview} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }}/>
									</div>
								)}
								<label htmlFor="image-upload" className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3  py-2">
									<Asterisk size={16} className="text-red-600"/>
									<Upload className="size-5"/>
									Upload Backgournd Photo
								</label>
								<input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
							</div>
							{/* GCASH */}
							<div className="text-start flex flex-col gap-3">
								{previewGcash && (
									<div className="space-y-1">
										<p>Preview:</p>
										<img src={previewGcash} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }}/>
									</div>
								)}
								<label htmlFor="gcash-upload" className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3 py-2">
									<Asterisk size={16} className="text-red-600"/>
									<Upload className="size-5"/>
									Upload Gcash QR Code
								</label>
								<input id="gcash-upload" type="file" accept="image/*" onChange={handleGcashChange} className="hidden"  />
							</div>
							{/* PayMaya */}
							<div className="text-start flex flex-col gap-3">
								{previewPaymaya && (
									<div className="space-y-1">
										<p>Preview:</p>
										<img src={previewPaymaya} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }}/>
									</div>
								)}
								<label htmlFor="paymaya-upload" className="text-sm font-medium flex items-center cursor-pointer justify-center gap-3 py-2">
									<Asterisk size={16} className="text-red-600"/>
									<Upload className="size-5"/>
									Upload PayMaya QR Code
								</label>
								<input id="paymaya-upload" type="file" accept="image/*" onChange={handlePaymayaChange} className="hidden" />
							</div>
						</div>
						{/* Buttons */}
						<div ref={placeholderRef} className="bg-white rounded-2xl p-4 flex justify-end gap-2">
            	<button type="button" className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300">
              Cancel
            	</button>
							<button type="submit" className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]">
								{isSubmitting ? "Processing…" : "Create Drive"}
							</button>
        		</div>
					</form>
        </div>
      </div>
    </div>
  );
}