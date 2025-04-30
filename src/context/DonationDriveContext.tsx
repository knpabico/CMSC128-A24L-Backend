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
import { DonationDrive, Event } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { uploadImage } from "@/lib/upload";

const DonationDriveContext = createContext<any>(null);

export function DonationDriveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [donationDrives, setDonationDrives] = useState<DonationDrive[]>([]);
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);

  // donation drive form fields
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<string|null>(null);
  const [targetAmount, setTargetAmount] = useState(0);
  const [isEvent, setIsEvent] = useState(false);
  const [eventId, setEventId] = useState("");
  const [endDate, setEndDate] = useState(new Date());
  const [status, setStatus] = useState("");
  const [oneBeneficiary, setOneBeneficiary] = useState("");
  const [beneficiary, setBeneficiary] = useState<string[]>([""]);

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

  // When donationDrives change, fetch all related events
  useEffect(() => {
    const fetchEvents = async () => {
      const eventIds = donationDrives
        .filter(drive => drive.isEvent && drive.eventId)
        .map(drive => drive.eventId);

      // Remove duplicates
      const uniqueEventIds = [...new Set(eventIds)];

      if (uniqueEventIds.length === 0) return;

      const newEvents: Record<string, Event> = {};

      for (const id of uniqueEventIds) {
        try {
          const event = await getEventById(id);
          if (event) {
            newEvents[id] = event;
          }
        } catch (error) {
          console.error("Error fetching event ${id}:", error);
        }
      }

      setEvents(prevEvents => ({
        ...prevEvents,
        ...newEvents
      }));
    };

    if (donationDrives.length > 0) {
      fetchEvents();
    }
  }, [donationDrives]);

  const subscribeToDonationDrives = () => {
    setLoading(true);
    const q = query(collection(db, "donation_drive"));

    const unsubscribeDonationDrives = onSnapshot(
      q,
      (querySnapshot: any) => {
        // const donationDriveList = querySnapshot.docs.map((doc: any) => doc.data() as DonationDrive);
        const donationDriveList = querySnapshot.docs.map((doc: any) => ({
          donationDriveId: doc.id, // Add Firestore document ID
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
        console.log("No donation drive found with ID: ${donationDriveId}");
        return null;
      }
    } catch (error) {
      console.error("Error fetching donation drive:", error);
      throw new Error((error as FirebaseError).message);
    }
  };

  const getEventById = async (eventId: string): Promise<Event | null> => {
    try {
      const eventDoc = doc(db, "event", eventId);
      const snapshot = await getDoc(eventDoc);

      if (snapshot.exists()) {
        const eventData = snapshot.data();
        return {
          eventId: snapshot.id,
          ...eventData,
        } as Event;
      } else {
        console.log("No event found with ID: ${eventId}");
        return null;
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      throw new Error((error as FirebaseError).message);
    }
  };

  const fetchAlumnusById = async (alumnusId: string) => {
    try {
      const alumnusRef = doc(db, "alumni", alumnusId);
      const alumnusSnap = await getDoc(alumnusRef);
  
      if (alumnusSnap.exists()) {
        return alumnusSnap.data(); // contains firstName, lastName, etc.
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching alumnus:", error);
      return null;
    }
  };

 const handleBenefiaryChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const  {value } = e.target;
  const list = [...beneficiary];
  list[index] = value;
  setBeneficiary(list);
 }

 const handleAddBeneficiary = async () => {
  setBeneficiary([...beneficiary,'']);
 }

 const handleRemoveBeneficiary = async (index: number) => {
  const list = [...beneficiary];
  list.splice(index,1);
  setBeneficiary(list);
 }

 const handleImageChange = (e: { target: { files: any[]; }; }) => {
  const file = e.target.files[0];
  if (file) {
    setImage(file);
    setFileName(file.name); // Store the filename
    setPreview(URL.createObjectURL(file)); //preview
  }
  };

  const addDonationDrive = async (driveData: DonationDrive) => {
    
    try {
      const docRef = doc(collection(db, "donation_drive"));

      if (image) {
        const uploadResult = await uploadImage(image, `donation-drive/${docRef.id}`);
        if (uploadResult.success) {
          driveData.image = uploadResult.url;
          
          await setDoc(docRef, driveData);
          // Optional: also store under photoURL
          await updateDoc(docRef, { photoURL: uploadResult.url });
        } else {
          return { success: false, message: "Image upload failed" };
        }
      } else {
        return { success: false, message: "No image provided" };
      }

      driveData.donationDriveId = docRef.id;
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
      beneficiary,
      campaignName,
      status,
      creatorId,
      creatorType: "alimni",
      currentAmount: 0,
      targetAmount,
      isEvent: true,
      eventId,
      startDate: new Date(),
      endDate,
      donorList: [],
      image: "",
    };

    const response = await addDonationDrive(newDonoDrive);

    if (response.success) {
      setShowForm(false);
      setCampaignName("");
      setDescription("");
      setOneBeneficiary("");
      setBeneficiary([]);
      setTargetAmount(0);
      setEventId("");
      setEndDate(new Date());
      setStatus("");
      setImage(null);
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

  // const handleReject = async (donationDriveId: string) => {
  //   try {
  //     const driveRef = doc(db, "donation_drive", donationDriveId);
  //     await updateDoc(driveRef, { status: "rejected" });
  //     return { success: true, message: "Donation drive successfully rejected" };
  //   } catch (error) {
  //     return { success: false, message: (error as FirebaseError).message };
  //   }
  // };

  // const handleAccept = async (donationDriveId: string) => {
  //   try {
  //     const driveRef = doc(db, "donation_drive", donationDriveId);
  //     await updateDoc(driveRef, { status: "active", startDate: new Date() });
  //     return {
  //       success: true,
  //       message: "Donation drive successfully activated",
  //     };
  //   } catch (error) {
  //     return { success: false, message: (error as FirebaseError).message };
  //   }
  // };

  return (
    <DonationDriveContext.Provider
      value={{
        donationDrives,
        events,
        isLoading,
        addDonationDrive,
        showForm,
        setShowForm,
        handleImageChange,
        handleBenefiaryChange,
        handleAddBeneficiary,
        handleRemoveBeneficiary,
        handleSave,
        handleEdit,
        handleDelete,
        // handleReject,
        // handleAccept,
        campaignName,
        setCampaignName,
        description,
        setDescription,
        creatorId,
        setCreatorId,
        image,
        setImage,
        fileName,
        setFileName,
        preview,
        setPreview,
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
        oneBeneficiary, 
        setOneBeneficiary,
        beneficiary,
        setBeneficiary,
        getDonationDriveById,
        getEventById,
        fetchAlumnusById,
      }}
    >
      {children}
    </DonationDriveContext.Provider>
  );
}

export const useDonationDrives = () => useContext(DonationDriveContext);