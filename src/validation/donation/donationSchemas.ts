import {z} from 'zod';

// donation data schema
// this will be used to validate the data again in the server side
// before the donation data gets inserted to Firestore
export const donationDataSchema = z.object({
  amount: z.coerce.number().min(1, "Minimum amount is PHP 1 in order to donate."),
  paymentMethod: z.enum(["gcash", "maya", "debit card"]),
  donationDriveId: z.string(), // Changed from postId
  alumniId: z.string(),
  isAnonymous: z.boolean().default(false),
  imageProof: z.string().optional(),
  date: z.date().optional() 
});