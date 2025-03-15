"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { DonationDrive } from "@/models/models";
import { FirebaseError } from "firebase/app";

const DonationDriveContext = createContext<any>(null);

export function DonationDriveProvider({ children }: { children: React.ReactNode }) {
    const [donationDrives, setDonationDrives] = useState<DonationDrive[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
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
                id: doc.id, // ✅ Add Firestore document ID
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
            ...driveData,
            status: "Active",
        });
        console.log(`Donation drive added: ${driveId}`);
        return { success: true, message: "Donation drive added successfully." };
        } catch (error) {
        return { success: false, message: (error as FirebaseError).message };
        }
    };

    return (
        <DonationDriveContext.Provider value={{ donationDrives, isLoading, addDonationDrive }}>
        {children}
        </DonationDriveContext.Provider>
    );
}

export const useDonationDrives = () => useContext(DonationDriveContext);
