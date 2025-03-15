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
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { Donation, DonationDrive } from "@/models/models";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { createDonation } from "@/data/donation";
import { donationDataSchema } from "@/validation/donation/donationSchemas";
import { useState } from "react";

export const donationFormSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Minimum amount is PHP 1 in order to donate."),
  paymentMethod: z.enum(["gcash", "maya", "debit card"]),
});

export function DonateDialog({ drive }: { drive: DonationDrive }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // grab the details about the current user
  const { user, alumInfo } = useAuth();

  const handleSubmit = async (data: z.infer<typeof donationFormSchema>) => {
    const token = await user?.getIdToken();
    if (!token) return;

    // add the ID of the donation event and the ID of the user to the
    // donation data
    const donationData: z.infer<typeof donationDataSchema> = {
      ...data,
      postId: drive.donationDriveId,
      alumniId: alumInfo?.alumniId!,
    };

    const response = await createDonation(donationData);

    // if there is an error, then display error toast
    if (response.error) {
      toastError(response.message);
      return;
    }

    // if there is no error, then display a success toast message
    toastSuccess(`You have donated ₱${data.amount} to ${drive.campaignName}.`);

    // clear the input fields
    form.reset();

    // close the dialog box
    setIsDialogOpen(false);
  };

  // react hook form
  const form = useForm<z.infer<typeof donationFormSchema>>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "gcash",
    },
  });

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
          form.reset(); // Reset any state when closing
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Donate</Button>
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

        {/* use shadcn form component, which uses zod and react hook form for data validation */}
        {/* Example form with validation for a single input field - https://ui.shadcn.com/docs/components/form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* use grid layout */}
            <div className="grid gap-4 py-4">
              {/* amount form field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₱)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                          <SelectItem value="Maya">Maya</SelectItem>
                          <SelectItem value="debit card">Debit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* end of grid layout div */}
            </div>

            <DialogFooter>
              <Button type="submit">Donate</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
