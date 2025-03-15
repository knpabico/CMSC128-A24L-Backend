import {z} from 'zod';

// donation data schema
// this will be used to validate the data again in the server side
// before the donation data gets inserted to Firestore
export const donationDataSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Minimum amount is PHP 1 in order to donate."),
  paymentMethod: z.enum(["gcash", "maya", "debit card"]),
  postId: z.string(),
  alumniId: z.string(),
});