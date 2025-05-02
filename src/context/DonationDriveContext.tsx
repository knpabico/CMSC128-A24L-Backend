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
import { NewsLetterProvider, useNewsLetters } from "./NewsLetterContext";
import { FirebaseError } from "firebase/app";
import { uploadImage } from "@/lib/upload";
import { toastSuccess } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

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
  const [creatorType, setCreatorType] = useState("");
  const [qrGcash, setQrGcash] = useState(null);
  const [fileGcashName, setFileGcashName] = useState<string>("");
  const [previewGcash, setPreviewGcash] = useState<string|null>(null);
  const [qrPaymaya, setQrPaymaya] = useState(null);
  const [filePaymayaName, setFilePaymayaName] = useState<string>("");
  const [previewPaymaya, setPreviewPaymaya] = useState<string|null>(null);  
  const [image, setImage] = useState<any>(null);
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
  const { addNewsLetter } = useNewsLetters(); 
  const router = useRouter();
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

 const handleGcashChange = (e: { target: { files: any[]; }; }) => {
  const file = e.target.files[0];
  if (file) {
    setQrGcash(file);
    setFileGcashName(file.name); // Store the filename
    setPreviewGcash(URL.createObjectURL(file)); //preview
  }
 };

 const handlePaymayaChange = (e: { target: { files: any[]; }; }) => {
  const file = e.target.files[0];
  if (file) {
    setQrPaymaya(file);
    setFilePaymayaName(file.name); // Store the filename
    setPreviewPaymaya(URL.createObjectURL(file)); //preview
  }
 };

 const handleImageChange = (e: { target: { files: any[]; }; }) => {
  const file = e.target.files[0];
  if (file) {
    setImage(file);
    setFileName(file.name); // Store the filename
    setPreview(URL.createObjectURL(file)); //preview
  }
 };

  const addDonationDrive = async (driveData: DonationDrive) => {
    if(!isEvent){
      driveData.creatorType = "admin";
      driveData.creatorId = "";
    }else{
      driveData.creatorId = creatorType==="admin"? "" : creatorId;
    }
    try {
      const docRef = doc(collection(db, "donation_drive"));
      driveData.donationDriveId = docRef.id;
      if (qrGcash) {
        const uploadResult = await uploadImage(qrGcash, `donation-drive/qr_gcash/${docRef.id}`);
        if (uploadResult.success) {
          driveData.qrGcash = uploadResult.url;
          
          await setDoc(docRef, driveData);
        } else {
          return { success: false, message: "Gcash QR Code upload failed" };
        }
      } else {
        return { success: false, message: "No Gcash QR Code provided" };
      }
      if (qrPaymaya) {
        const uploadResult = await uploadImage(qrPaymaya, `donation-drive/qr_paymaya/${docRef.id}`);
        if (uploadResult.success) {
          driveData.qrPaymaya = uploadResult.url;
          
          await setDoc(docRef, driveData);
        } else {
          return { success: false, message: "Paymaya QR Code upload failed" };
        }
      } else {
        return { success: false, message: "No Paymaya QR Code provided" };
      }
      if (image) {
        const uploadResult = await uploadImage(image, `donation-drive/${docRef.id}`);
        if (uploadResult.success) {
          driveData.image = uploadResult.url;
          
          await setDoc(docRef, driveData);
        } else {
          return { success: false, message: "Image upload failed" };
        }
      } else {
        return { success: false, message: "No image provided" };
      }

      console.log(driveData);
      driveData.donationDriveId = docRef.id;
      await setDoc(doc(db, "donation_drive", docRef.id), driveData);
      await addNewsLetter(driveData.donationDriveId, "donation_drive");
      if (driveData.isEvent) {
        await updateDoc(doc(db, "event", eventId), {donationDriveId: docRef.id});
      }
      if (driveData.isEvent) {
        await updateDoc(doc(db, "event", eventId), {donationDriveId: docRef.id});
      }
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
      status: "active",
      creatorId,
      creatorType,
      currentAmount: 0,
      targetAmount,
      qrGcash: "",
      qrPaymaya: "",
      isEvent,
      eventId,
      startDate: new Date(),
      endDate: new Date(endDate),
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
      setStatus("active");
      setStatus("active");
      setImage(null);
      setPreview(null);
      setPreviewGcash(null);
      setPreviewPaymaya(null);
    } else {
      console.error("Error adding donation drive:", response.message);
    }
  };

  const handleAddEventRelated = async (event: Event) => {
    // const event = await getEventById(eventId);
    console.log(event);
    if(event){
      setIsEvent(true);
      setCreatorId(event.creatorId);
      setEventId(event.eventId);
      setCreatorType(event.creatorType);
      setCampaignName(event.title);
      setImage(event.image);
      setDescription(event.description);
      setEndDate(new Date(event.date));
      router.push(`./donations/add`);
    }else{
      console.error("No event found");
    }
    
  }

  const handleEdit = async (
    donationDriveId: string,
    updatedData: Partial<DonationDrive>
  ) => {
    try {
      await updateDoc(doc(db, "donation_drive", donationDriveId), updatedData);
      setDonationDrives((prev) =>
        prev.map((donationDrive) =>
          donationDrive.donationDriveId === donationDriveId
            ? { ...donationDrive,endDate: new Date(endDate), ...updatedData }
            : donationDrive
        )
      );
      setCreatorId("");
      setCampaignName("");
      setDescription("");
      setOneBeneficiary("");
      setBeneficiary([]);
      setTargetAmount(0);
      setEndDate(new Date());
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
      if (isEvent) {
        await updateDoc(doc(db, "event", eventId), {donationDriveId: ""});
      }
      if (isEvent) {
        await updateDoc(doc(db, "event", eventId), {donationDriveId: ""});
      }
      return { success: true, message: "Donation drive deleted successfully." };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  return (
    <DonationDriveContext.Provider
      value={{
        donationDrives,
        events,
        isLoading,
        addDonationDrive,
        showForm,
        setShowForm,
        handleGcashChange,
        handlePaymayaChange,
        handleImageChange,
        handleBenefiaryChange,
        handleAddBeneficiary,
        handleRemoveBeneficiary,
        handleSave,
        handleAddEventRelated,
        handleEdit,
        handleDelete,
        campaignName,
        setCampaignName,
        description,
        setDescription,
        creatorId,
        setCreatorId,
        qrGcash, 
        setQrGcash, 
        fileGcashName, 
        setFileGcashName, 
        previewGcash, 
        setPreviewGcash, 
        qrPaymaya, 
        setQrPaymaya, 
        filePaymayaName, 
        setFilePaymayaName, 
        previewPaymaya, 
        setPreviewPaymaya,

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