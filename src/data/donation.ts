// this file contains helper functions for doing CRUD operations on Donation collection
"use server";

import { serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { z } from "zod";
import { donationDataSchema } from "@/validation/donation/donationSchemas";
import { Donation } from "@/models/models";
import { addDoc, arrayUnion, collection, doc, increment, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  return userDonations;
};

// function for inserting a donation document to the Donation collection in firestore
// Function to create a new donation
export const createDonation = async (donationData: { isAnonymous: any; donationDriveId: string; alumniId: any; amount: number; }) => {
  try {
    // Create a donation document reference with a generated ID
    const donationRef = doc(collection(db, "donation"));
    const donationId = donationRef.id;

    // Add the donationId to the data
    const completeData = {
      ...donationData,
      donationId,
      date: new Date() // Set the current date if not provided
    };

    // Create the donation document
    await setDoc(donationRef, completeData);

    // If not anonymous, update the donorList in the donation drive
    if (!donationData.isAnonymous) {
      const donationDriveRef = doc(db, "donation_drive", donationData.donationDriveId);

      // Update the donorList and currentAmount
      await updateDoc(donationDriveRef, {
        donorList: arrayUnion(donationData.alumniId),
        currentAmount: increment(donationData.amount)
      });
    } else {
      // Just update the currentAmount if anonymous
      const donationDriveRef = doc(db, "donation_drive", donationData.donationDriveId);
      await updateDoc(donationDriveRef, {
        currentAmount: increment(donationData.amount)
      });
    }

    return donationId;
  } catch (error) {
    console.error("Error creating donation:", error);
    throw error;
  }
};