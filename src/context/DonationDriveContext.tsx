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
import { getStorage, ref, deleteObject } from "firebase/storage";
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
  const [qrGcashChange, setGcashChange] = useState(false);
  const [qrPaymaya, setQrPaymaya] = useState(null);
  const [filePaymayaName, setFilePaymayaName] = useState<string>("");
  const [previewPaymaya, setPreviewPaymaya] = useState<string|null>(null);  
  const [qrPaymayaChange, setPaymayaChange] = useState(false);
  const [image, setImage] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<string|null>(null);
  const [imageChange, setImageChange] = useState(false);
  const [targetAmount, setTargetAmount] = useState(0);
  const [isEvent, setIsEvent] = useState(false);
  const [eventId, setEventId] = useState("");
  const [endDate, setEndDate] = useState<any>();
  const [status, setStatus] = useState("");
  const [oneBeneficiary, setOneBeneficiary] = useState("");
  const [beneficiary, setBeneficiary] = useState<string[]>([""]);
  const [fromEvent, setFromEvent] = useState(false);

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
    setGcashChange(true);
  }
 };

 const handlePaymayaChange = (e: { target: { files: any[]; }; }) => {
  const file = e.target.files[0];
  if (file) {
    setQrPaymaya(file);
    setFilePaymayaName(file.name); // Store the filename
    setPreviewPaymaya(URL.createObjectURL(file)); //preview
    setPaymayaChange(true);
  }
 };

 const handleImageChange = (e: { target: { files: any[]; }; }) => {
  const file = e.target.files[0];
  if (file) {
    setImage(file);
    setFileName(file.name); // Store the filename
    setPreview(URL.createObjectURL(file)); //preview
    setImageChange(true);
  }
 };

  const addDonationDrive = async (driveData: DonationDrive) => {
    var uploadError = false;
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
        } else {
          console.error("Gcash QR Code upload failed");
          uploadError = true;
          return { success: false, message: "Error uploading image file" };
        }
      } else {
        console.error("No Gcash QR Code provided");
        uploadError = true;
        return { success: false, message: "No Gcash QR Code provided" };
      }
      if (qrPaymaya) {
        const uploadResult = await uploadImage(qrPaymaya, `donation-drive/qr_paymaya/${docRef.id}`);
        if (uploadResult.success) {
          driveData.qrPaymaya = uploadResult.url;
        } else {
          console.error("Paymaya QR Code upload failed");
          uploadError = true;
          return { success: false, message: "Error uploading image file" };
        }
      } else {
        console.error("No Paymaya QR Code provided");
        uploadError = true;
        return { success: false, message: "No Paymaya QR Code provided" };
      }
      if (image) {
        const uploadResult = await uploadImage(image, `donation-drive/${docRef.id}`);
        if (uploadResult.success) {
          driveData.image = uploadResult.url;
        } else {
          console.error("Image upload failed");
          uploadError = true;
          return { success: false, message: "Error uploading image file" };
        }
      } else {
        console.error("No image provided");
        uploadError = true;
        return { success: false, message: "No image provided" };
      }
      if(uploadError){
        return { success: false, message: "Error uploading image file" };
      }else{
        driveData.donationDriveId = docRef.id;
        await setDoc(doc(db, "donation_drive", docRef.id), driveData);
        await addNewsLetter(driveData.donationDriveId, "donation_drive");  
        if (driveData.isEvent) {
          await updateDoc(doc(db, "event", eventId), {donationDriveId: docRef.id});
        }
        return { success: true, message: "Donation drive added successfully." };              
      }
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
      setEndDate("");
      setStatus("active");
      setImage(null);
      setPreview(null);
      setPreviewGcash(null);
      setPreviewPaymaya(null);
      setFromEvent(false);
      setImageChange(false);
      setPaymayaChange(false);
      setGcashChange(false);
    } else {
      console.error("Error adding donation drive:", response.message);
    }
    return { success: response.success, message: response.message };
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
      setEndDate(event.date);
      setFromEvent(true);
      router.push(`./donation-drive/add`);
    }else{
      console.error("No event found");
    }
    
  }

  const handleEdit = async (
    donationDriveId: string,
    updatedData: Partial<DonationDrive>
  ) => {
    var uploadError = false;
    const docRef = doc(db, "donation_drive", donationDriveId);
    const storage = getStorage();
    const drive = await getDonationDriveById(donationDriveId);
    try {
      if (qrGcashChange) {
        var beDelete = false;
        var toDelete = null;
        if(drive?.qrGcash !== ""){
          const fileURL = drive?.qrGcash;
          toDelete = await ref(storage, fileURL);  
          beDelete = true;       
        }  
        const uploadResult = await uploadImage(qrGcash!, `donation-drive/qr_gcash/${docRef.id}`);
        if (uploadResult.success) {
          const qrGcashUrl = uploadResult.url;
          await updateDoc(docRef, {qrGcash: qrGcashUrl});
          console.log("Gcash QR code edited successfully");
        } else {
          console.error( "Gcash QR Code upload failed" );
          uploadError = true;
          beDelete = false;
        }
        if(beDelete){
          deleteObject(toDelete).then(() => {
            // File deleted successfully
            console.log("Gcash QR code deleted successfully");
          }).catch((error) => {
            // Handle any errors
            console.error("Error deleting Gcash QR code:", error);
          });          
        }        
      }
      if (qrPaymayaChange) {
        var beDelete = false;
        var toDelete = null;
        if(drive?.qrPaymaya !== ""){
          const fileURL = drive?.qrPaymaya;
          toDelete = await ref(storage, fileURL);
          beDelete = true;                    
        }
        const uploadResult = await uploadImage(qrPaymaya!, `donation-drive/qr_paymaya/${docRef.id}`);
        if (uploadResult.success) {
          const qrPaymayaUrl = uploadResult.url;
          await updateDoc(docRef, {qrPaymaya: qrPaymayaUrl});
          console.log("Paymaya QR code edited successfully");
        } else {
          console.error ( "Paymaya QR Code upload failed" );
          uploadError = true;
          beDelete = false;
        }
        if(beDelete){         
          deleteObject(toDelete).then(() => {
            // File deleted successfully
            console.log("Paymaya QR code deleted successfully");
          }).catch((error) => {
            // Handle any errors
            console.error("Error deleting Paymaya QR code:", error);
          });          
        }
      }
      if (imageChange) {
        var beDelete = false;
        var toDelete = null;
        if(drive?.image !== ""){
          const fileURL = drive?.image;
          toDelete = await ref(storage, fileURL);  
          beDelete = true;         
        }
        const uploadResult = await uploadImage(image, `donation-drive/${docRef.id}`);
        if (uploadResult.success) {
          const imageUrl = uploadResult.url;
          await updateDoc(docRef, {image: imageUrl});
          console.log("Image edited successfully");
        } else {
          console.error("Image upload failed");
          uploadError = true;
          beDelete = false;
        }
        if(beDelete){       
          deleteObject(toDelete).then(() => {
            // File deleted successfully
            console.log("Image deleted successfully");
          }).catch((error) => {
            // Handle any errors
            console.error("Error deleting Image:", error);
          });
        }
      }
      if(uploadError){
        return { success: false, message: "Error uploading image file" };
      }{
        await updateDoc(doc(db, "donation_drive", donationDriveId), updatedData);
        setDonationDrives((prev) =>
          prev.map((donationDrive) =>
            donationDrive.donationDriveId === donationDriveId
              ? { ...donationDrive, ...updatedData }
              : donationDrive
          )
        );      
        return { success: true, message: "Donation drive edited successfully." };        
      }
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
        // handleDelete,
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
        fromEvent, 
        setFromEvent,
        getDonationDriveById,
        getEventById,
        fetchAlumnusById,
        setImageChange,
        setPaymayaChange,
        setGcashChange,
      }}
    >
      {children}
    </DonationDriveContext.Provider>
  );
}

export const useDonationDrives = () => useContext(DonationDriveContext);