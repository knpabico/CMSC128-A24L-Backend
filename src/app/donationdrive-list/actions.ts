"use server";

import { serverFirestoreDB, auth } from "@/lib/firebase/serverSDK";
import { donationFormSchema } from "./DonateDialog";
import { z } from "zod";
import { donationDataSchema } from "@/validation/donation/donationSchemas";

// function for inserting a donation document to the Donation collection in firestore
export const createDonation = async (
  data: z.infer<typeof donationDataSchema>
) => {
  console.log({ donationData: data });

  // validate the data again
  const validation = donationDataSchema.safeParse(data);

  // if data validation fail
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "An error occurred",
    };
  }

  // save donation data to the firestore database
  // add that donation data as a new document to the donation collection
  const donationDocument = await serverFirestoreDB.collection("donation").add({
    ...data,
    // also add a date property
    created: new Date(),
  });

  // return an object containing the id of the donation document
  return {
    donationID: donationDocument.id,
  };
};
