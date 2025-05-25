import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { DonationDrive } from "@/models/models";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { createDonation } from "@/data/donation";
import { useState } from "react";
import { useDonationDrives } from '@/context/DonationDriveContext';
import { DonationContextProvider, useDonationContext } from "@/context/DonationContext";

// Update the schema to include the new fields
export const donationFormSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Minimum amount is PHP 1 in order to donate."),
  paymentMethod: z.enum(["gcash", "maya", "debit card"]),
  isAnonymous: z.boolean().default(false),
  imageProof: z.string().optional(),
});

export function DonateDialog({ drive, onDonationSuccess }: {drive: DonationDrive; onDonationSuccess: () => void; }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
	const [image, setImage] = useState(null);
	const { updateDonationImageProof } = useDonationContext();
  
  // Import the refresh function from context
  // const { refreshDonationDrives } = useDonationDrives();

  // grab the details about the current user
  const { user, alumInfo } = useAuth();

	//Calculate Days Remaining
	const getRemainingDays = (endDate: Date) => {
		try {
			const today = new Date(); // Current date
			const end = new Date(endDate); // Firestore Timestamp to JS Date
			const diffTime = end.getTime() - today.getTime();
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays;
		} catch (err) {
			return -1;
		}
	};

  const handleSubmit = async (data: z.infer<typeof donationFormSchema>) => {
    setIsLoading(true);
    const token = await user?.getIdToken();
    if (!token) {
      toastError("Authentication required");
      setIsLoading(false);
      return;
    }
		if(!imageFile || imageFile == null){
			toastError("Image Proof Required");
			return;
		}
    // Optimistically update the UI - only for amount
    // This will show the progress bar updating immediately
    const currentAmount = drive.currentAmount || 0;
    drive.currentAmount = currentAmount + data.amount;

    // add the ID of the donation drive and the ID of the user to the donation data
    const donationData = {
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      isAnonymous: data.isAnonymous,
      donationDriveId: drive.donationDriveId,
      alumniId: alumInfo?.alumniId!,
      imageProof: "",
	  verified: false,
    };

    try {
      // Call the server action to create the donation
      const donationId = await createDonation(donationData);
      let imageProofUrl = "";
      try {
				if (!donationId) {
					throw new Error("No donation ID returned from server");
				}
				const uploadResult = await uploadImage(imageFile, `donation/${donationId}`);
				imageProofUrl = uploadResult.url;
				if (imageProofUrl && donationId) {
					await updateDonationImageProof(donationId, imageProofUrl);
				}
			} catch (error) {
				toastError("Failed to upload image proof");
				console.error("Image upload error:", error);
			}
      // if there is no error, then display a success toast message
      toastSuccess(`You have donated ₱${data.amount} to ${drive.campaignName}.`);
	  	setIsThankYouOpen(true);
      
      // Refresh the donation drives to get the updated data from the server
      // refreshDonationDrives();
      
      // clear the input fields
      form.reset();
      setImageFile(null);
      // close the dialog box
      setIsDialogOpen(false);
	  	onDonationSuccess();
    } catch (error) {
      console.error("Error creating donation:", error);
      toastError("Failed to process donation. Please try again.");
      
      // Revert the optimistic update
      drive.currentAmount = currentAmount;
      
      // Refresh to ensure UI is in sync with server
      // refreshDonationDrives();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // react hook form
  const form = useForm<z.infer<typeof donationFormSchema>>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "gcash",
      isAnonymous: false,
      imageProof: ""
    },
  });

return (
    <>
		<Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) { form.reset(); setImageFile(null);}}}>
			<DialogTrigger asChild>
				<button className={`text-sm w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 ${drive.status === 'pending' || drive.status === 'completed' || getRemainingDays(drive.endDate) < 0 ? 'bg-gray-400 text-white cursor-not-allowed border-gray-400 border-2' : 'bg-[#0856BA] text-white hover:bg-[#0855baa2] cursor-pointer'}`} disabled={drive.status === 'pending' || drive.status === 'completed' || getRemainingDays(drive.endDate) < 0}>Donate</button>
			</DialogTrigger>
			<DialogContent className="w-fit p-8">
				<DialogHeader className="text-center flex items-center">
					<DialogTitle className="text-2xl">{drive.campaignName}</DialogTitle>
					<DialogDescription className="text-xs italic" >Enter your donation amount and select your preferred payment method.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<div className="flex gap-3">
							<fieldset disabled={form.formState.isSubmitting} className="flex flex-col gap-3 mt-3">
								<FormField control={form.control} name="amount" render={({ field }) => (
									<FormItem className="flex flex-col gap-2">
										<FormLabel className="w-full">Amount (₱):</FormLabel>
										<div className="flex flex-col gap-3 px-7 mt-2">
											<div className="flex gap-2 justify-between w-full">
												{[500, 1000, 1500, 2000].map((amount) => (
													<button key={amount} type="button" className="px-3 py-1.5 w-full bg-[#fffff] border-blue-400 text-blue-900 border-1 hover:bg-blue-200 rounded text-sm" onClick={() => field.onChange(amount)} >
														₱{amount}
													</button>
												))}
											</div>
											<FormControl className="w-full">
												<Input {...field} type="number" min="1" className="border-blue-400  text-blue-900" />
											</FormControl>
											<FormMessage className="text-red-600 text-sm text-center"/>
										</div>
									</FormItem>
								)} />
								<FormField control={form.control} name="paymentMethod" render={({ field }) => (
									<FormItem className="flex flex-col gap-2">
										<FormLabel className="w-full">Payment Method:</FormLabel>
										<div className="flex flex-col gap-3 px-7 mt-2">
											<FormControl className="w-full">
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-blue-400 w-full  text-blue-900">
														<SelectValue />
													</SelectTrigger>
												<SelectContent className="bg-[#ffff] border-0">
													<SelectItem value="gcash">GCash</SelectItem>
													<SelectItem value="maya">Maya</SelectItem>
												</SelectContent></Select>
											</FormControl>
											<FormMessage />
										</div>
									</FormItem>
								)} />
								<FormItem className="flex flex-col gap-2 mt-1">
									<FormLabel>Payment Proof: </FormLabel>
									<div className="flex flex-col px-7 ">
										<FormControl>
											<Input type="file" required accept="image/*" onChange={handleImageChange} className="border-blue-600 text-blue-900 text-sm" />
										</FormControl>
										<FormDescription className="text-xs p-1 italic">Upload a screenshot of your payment receipt</FormDescription>
									</div>
								</FormItem>
								<FormField control={form.control} name="isAnonymous" render={({ field }) => (
									<FormItem className="flex flex-row items-center">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-blue-600 border-2"/>
										</FormControl>
										<div className="leading-none">
											<FormLabel className="text-sm">Make donation anonymous</FormLabel>
											<FormDescription className="text-[10px] italic">Your name will not be displayed publicly</FormDescription>
										</div>
									</FormItem>
								)} />
							</fieldset>
							{/* Will change depending on the chosen payment method */}
							<div className="mt-3 w-auto h-96">
								{form.watch("paymentMethod") == "gcash" ? (
									<>
										<p className="text-center">GCASH QR CODE </p>
										<img src={drive.qrGcash} alt="Payment Proof" className="w-auto h-80 rounded-2xl" />
									</>
								) : (
									<>
										<p className="text-center">PAYMAYA QR CODE </p>
										<img src={drive.qrPaymaya} alt="Payment Proof" className="w-auto h-80 rounded-2xl" />
									</>
								)}
							</div>
						</div>
						<DialogFooter className="mx-30">
							<button type="submit" className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] w-full px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]" disabled={isLoading}>
								{isLoading ? "Processing…" : "Donate"}
							</button>
							{/* <Button className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 bg-[#0856BA]" type="submit" disabled={isLoading}> {isLoading ? "Processing..." : "Donate"}</Button> */}
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	</>
);
}