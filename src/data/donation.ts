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
export const createDonation = async (donationData: {
  donationDriveId: string;
  alumniId: string;
  paymentMethod: string;
  amount: number;
  isAnonymous: boolean;
  imageProof?: string;
}) => {
  try {
    // Validate input using Zod
    const parsedData = donationDataSchema.parse(donationData);
    const donationRef = serverFirestoreDB.collection("donation").doc();
    const donationId = donationRef.id;

    const completeData = {
      ...parsedData,
      donationId,
      date: new Date(),
    };

    // Write the document
    await donationRef.set(completeData)

    const donationDriveRef = serverFirestoreDB.collection("donation_drive").doc(parsedData.donationDriveId);

    // Fetch current data
    const donationDriveSnap = await donationDriveRef.get();
    const donationDriveData = donationDriveSnap.data();

    if (!donationDriveData) throw new Error("Donation drive not found");

    const newAmount = (donationDriveData.currentAmount || 0) + parsedData.amount;

    let updateData: Record<string, any> = {
      currentAmount: newAmount,
    };

    // if (!parsedData.isAnonymous) {
    //   const existingDonors = donationDriveData.donorList || [];
    //   const newDonorList = [...new Set([...existingDonors, parsedData.alumniId])];

    //   updateData.donorList = newDonorList;
    // }

      const existingDonors = donationDriveData.donorList || [];
      existingDonors.push(parsedData.alumniId); // allow duplicates
      updateData.donorList = existingDonors;
    

await donationDriveRef.update(updateData);

    return donationId;
  } catch (error) {
    console.error("Error creating donation:", error);
    throw error;
  }
};