import { Button } from "@/components/ui/button";
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

// Update the schema to include the new fields
export const donationFormSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Minimum amount is PHP 1 in order to donate."),
  paymentMethod: z.enum(["gcash", "maya", "debit card"]),
  isAnonymous: z.boolean().default(false),
  imageProof: z.string().optional(),
});

export function DonateDialog({ drive }: { drive: DonationDrive }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Import the refresh function from context
  // const { refreshDonationDrives } = useDonationDrives();

  // grab the details about the current user
  const { user, alumInfo } = useAuth();

  const handleSubmit = async (data: z.infer<typeof donationFormSchema>) => {
    setIsLoading(true);
    const token = await user?.getIdToken();
    if (!token) {
      toastError("Authentication required");
      setIsLoading(false);
      return;
    }

    // Handle image upload if provided
    let imageProofUrl = "";
    if (imageFile) {
      try {
        // You'll need to implement an image upload function that returns the URL
        // imageProofUrl = await uploadImage(imageFile); 
        // For now, let's just set it to a placeholder
        imageProofUrl = "image_url_placeholder";
      } catch (error) {
        toastError("Failed to upload image proof");
        setIsLoading(false);
        return;
      }
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
      imageProof: imageProofUrl,
    };

    try {
      // Call the server action to create the donation
      await createDonation(donationData);
      
      // if there is no error, then display a success toast message
      toastSuccess(`You have donated ₱${data.amount} to ${drive.campaignName}.`);
      
      // Refresh the donation drives to get the updated data from the server
      // refreshDonationDrives();
      
      // clear the input fields
      form.reset();
      setImageFile(null);
      
      // close the dialog box
      setIsDialogOpen(false);
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
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
          form.reset(); // Reset any state when closing
          setImageFile(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" disabled={drive.status === 'pending' || drive.status === 'completed'}>Donate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>
            Donate to {drive.campaignName} donation drive
          </DialogTitle>
          <DialogDescription>
            Please input donation amount and method.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <fieldset disabled={form.formState.isSubmitting}>
                {/* amount form field */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₱)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* payment method form field */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gcash">GCash</SelectItem>
                            <SelectItem value="maya">Maya</SelectItem>
                            <SelectItem value="debit card">
                              Debit Card
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Anonymous donation checkbox */}
                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make donation anonymous</FormLabel>
                        <FormDescription>
                          Your name will not be displayed publicly
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Image proof upload */}
                <FormItem className="mt-4">
                  <FormLabel>Payment Proof (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a screenshot of your payment receipt
                  </FormDescription>
                </FormItem>

              </fieldset>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Donate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}