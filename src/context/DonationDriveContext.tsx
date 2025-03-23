"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { DonationDrive } from "@/models/models";
import { FirebaseError } from "firebase/app";

const DonationDriveContext = createContext<any>(null);

export function DonationDriveProvider({ children }: { children: React.ReactNode }) {
    const [donationDrives, setDonationDrives] = useState<DonationDrive[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [addDonoForm, setAddDonoForm] = useState(false);
    const [editDonoForm, setEditDonoForm] = useState(false);
    const [donoDriveId, setDonoDriveId] = useState("");
    const [campaignName, setCampaignName] = useState("");
    const [description, setDescription] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        let unsubscribe: (() => void) | null;

        if (user) {
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
    }, [user]);

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

    const addDonationDrive = async (driveData: Omit<DonationDrive, "id">, driveId: string) => {
        try {
            await setDoc(doc(db, "donation_drive", driveId), {
                datePosted: new Date(),
                description: description,
                beneficiary: [],
                campaignName: campaignName,
                totalAmount: 0
            });
            console.log(`Donation drive added: ${driveId}`);
            return { success: true, message: "Donation drive added successfully." };
        } catch (error) {
            return { success: false, message: (error as FirebaseError).message };
        }
    };

    const editDonoDrive = async () => {
        try {
            await updateDoc(doc(db, "donation_drive", donoDriveId), {
                description: description,
                campaignName: campaignName
            });
            console.log(`Donation drive edited: ${donoDriveId}`);
            return { success: true, message: "Donation drive edited successfully." };
        } catch (error) {
            return { success: false, message: (error as FirebaseError).message };
        }
    };

    const subEditDonoDrive = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await editDonoDrive();
        if (response.success) {
            setEditDonoForm(false);
            setCampaignName("");
            setDescription("");
        } else {
            console.error("Error editing donation drive:", response.message);
        }
    };

    const editDonoDriveForm = async (donationDriveId: string, campaigname: string, drivedescription: string) => {
        setEditDonoForm(!editDonoForm);
        setDonoDriveId(donationDriveId);
        setCampaignName(campaigname);
        setDescription(drivedescription);
    };

    const deleteDonationDrive = async (donationDriveId: string) => {
        try {
            await deleteDoc(doc(db, "donation_drive", donationDriveId));
            setDonationDrives((prev) => prev.filter((driveData) => driveData.donationDriveId !== donationDriveId));
            return { success: true, message: "Donation drive deleted successfully." };
        } catch (error) {
            return { success: false, message: (error as FirebaseError).message };
        }
    };    

    const submitDonationDrive = async (e: React.FormEvent) => {
        e.preventDefault();
        const docRef = doc(collection(db, "donation_drive")); 
        const donationDriveId = docRef.id;
        const newDonoDrive: DonationDrive = {
            donationDriveId: donationDriveId,
            datePosted: new Date(),
            description,
            campaignName,
            totalAmount: 0
        };
        
        const response = await addDonationDrive(newDonoDrive,donationDriveId);

        if (response.success) {
            setAddDonoForm(false);
            setCampaignName("");
            setDescription("");
        } else {
            console.error("Error adding donation drive:", response.message);
        }
    };

    return (
        <DonationDriveContext.Provider value={{ donationDrives, isLoading, addDonationDrive, editDonoDriveForm, editDonoDrive, editDonoForm, setEditDonoForm, deleteDonationDrive,subEditDonoDrive, submitDonationDrive, addDonoForm, setAddDonoForm, donoDriveId, setDonoDriveId, campaignName, setCampaignName, description, setDescription }}>
        {children}
        </DonationDriveContext.Provider>
    );
}

export const useDonationDrives = () => useContext(DonationDriveContext);
