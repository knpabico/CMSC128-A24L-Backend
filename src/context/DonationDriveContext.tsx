"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { DonationDrive } from "@/models/models";
import { FirebaseError } from "firebase/app";

const DonationDriveContext = createContext<any>(null);

export function DonationDriveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [donationDrives, setDonationDrives] = useState<DonationDrive[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);

  // donation drive form fields
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [isEvent, setIsEvent] = useState(false);
  const [eventId, setEventId] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [status, setStatus] = useState("");
  const [beneficiary, setBeneficiary] = useState<string[]>([]);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user || isAdmin) {
      unsubscribe = subscribeToDonationDrives(); //maglilisten sa firestore
    } else {
      setDonationDrives([]); //reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user, isAdmin]);

  const subscribeToDonationDrives = () => {
    setLoading(true);
    const q = query(collection(db, "donation_drive"));

    const unsubscribeDonationDrives = onSnapshot(
      q,
      (querySnapshot: any) => {
        // const donationDriveList = querySnapshot.docs.map((doc: any) => doc.data() as DonationDrive);
        const donationDriveList = querySnapshot.docs.map((doc: any) => ({
          donationDriveId: doc.id, // ✅ Add Firestore document ID
          ...doc.data(),
        })) as DonationDrive[];
        setDonationDrives(donationDriveList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching donation drives:", error);
        setLoading(false);
      }
    );

    return unsubscribeDonationDrives;
  };

  const getDonationDriveById = async (
    donationDriveId: string
  ): Promise<DonationDrive | null> => {
    try {
      const donationDriveDoc = doc(db, "donation_drive", donationDriveId);
      const snapshot = await getDoc(donationDriveDoc);

      if (snapshot.exists()) {
        const donationDriveData = snapshot.data();
        return {
          donationDriveId: snapshot.id,
          ...donationDriveData,
        } as DonationDrive;
      } else {
        console.log(`No donation drive found with ID: ${donationDriveId}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching donation drive:", error);
      throw new Error((error as FirebaseError).message);
    }
  };

  const checkUserRole = async (userId: string) => {
    const adminRef = doc(db, "admin", userId);
    const alumniRef = doc(db, "alumni", userId);

    const [adminSnap, alumniSnap] = await Promise.all([
      getDoc(adminRef),
      getDoc(alumniRef),
    ]);

    if (adminSnap.exists()) {
      return { role: "admin", name: null };
    } else {
      const alumnusData = alumniSnap.data();
      return { role: "alumni", name: alumnusData?.name || "Unknown" };
    }
  };

  const addDonationDrive = async (driveData: DonationDrive) => {
    const { role, name } = await checkUserRole(user!.uid);
    try {
      const docRef = doc(collection(db, "donation_drive"));
      driveData.donationDriveId = docRef.id;
      driveData.creatorType = role;
      driveData.status = role === "admin" ? "active" : "pending";
      driveData.creatorId = user!.uid;

      await setDoc(doc(db, "donation_drive", docRef.id), driveData);
      return { success: true, message: "Donation drive added successfully." };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newDonoDrive: DonationDrive = {
      donationDriveId: "",
      datePosted: new Date(),
      description,
      beneficiary: [],
      campaignName,
      status: "",
      creatorId: "",
      creatorType: "",
      currentAmount: 0,
      targetAmount,
      isEvent,
      eventId,
      startDate: new Date(),
      endDate,
      donorList: [],
    };

    const response = await addDonationDrive(newDonoDrive);

    if (response.success) {
      setShowForm(false);
      setCampaignName("");
      setDescription("");
      setTargetAmount(0);
      setIsEvent(false);
      setEventId("");
      setEndDate(new Date());
      setStatus("");
    } else {
      console.error("Error adding donation drive:", response.message);
    }
  };

  const handleEdit = async (
    donationDriveId: string,
    updatedData: Partial<DonationDrive>
  ) => {
    try {
      await updateDoc(doc(db, "donation_drive", donationDriveId), updatedData);
      setDonationDrives((prev) =>
        prev.map((donationDrive) =>
          donationDrive.donationDriveId === donationDriveId
            ? { ...donationDrive, ...updatedData }
            : donationDrive
        )
      );
      return { success: true, message: "Donation drive edited successfully." };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleDelete = async (donationDriveId: string) => {
    try {
      await deleteDoc(doc(db, "donation_drive", donationDriveId));
      setDonationDrives((prev) =>
        prev.filter(
          (driveData) => driveData.donationDriveId !== donationDriveId
        )
      );
      return { success: true, message: "Donation drive deleted successfully." };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleReject = async (donationDriveId: string) => {
    try {
      const driveRef = doc(db, "donation_drive", donationDriveId);
      await updateDoc(driveRef, { status: "rejected" });
      return { success: true, message: "Donation drive successfully rejected" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleAccept = async (donationDriveId: string) => {
    try {
      const driveRef = doc(db, "donation_drive", donationDriveId);
      await updateDoc(driveRef, { status: "active" });
      return {
        success: true,
        message: "Donation drive successfully activated",
      };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  return (
    <DonationDriveContext.Provider
      value={{
        donationDrives,
        isLoading,
        addDonationDrive,
        showForm,
        setShowForm,
        handleSave,
        handleEdit,
        handleDelete,
        handleReject,
        handleAccept,
        campaignName,
        setCampaignName,
        description,
        setDescription,
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
        beneficiary,
        setBeneficiary,
        getDonationDriveById,
      }}
    >
      {children}
    </DonationDriveContext.Provider>
  );
}

export const useDonationDrives = () => useContext(DonationDriveContext);
