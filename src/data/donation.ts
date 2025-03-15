// this file contains helper functions for doing CRUD operations on Donation collection
"use server";

import { serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { z } from "zod";
import { donationDataSchema } from "@/validation/donation/donationSchemas";
import { Donation } from "@/models/models";

// function for querying donation that belongs to a specific user
export const getUserDonations = async (alumniId: string) => {
  // query the user's donations
  const userDonationsSnapshot = await serverFirestoreDB
    .collection("donation")
    .where("alumniId", "==", alumniId)
    .orderBy("date", "desc")
    .get();

  // create an array of userDonation objects
  const userDonations = userDonationsSnapshot.docs.map(
    (doc) =>
      ({
        donationId: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate().toISOString(),
      } as Donation)
  );

  // console.log({userDonations});

  return userDonations;
};

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
    date: new Date(),
  });

  // return an object containing the id of the donation document
  return {
    donationID: donationDocument.id,
  };
};
