"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Announcement } from "@/models/models";
import { FirebaseError } from "firebase/app";
const AnnouncementContext = createContext<any>(null);

export function AnnouncementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announces, setAnnounce] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToUsers(); //maglilisten sa firestore
    } else {
      setAnnounce([]); //reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user]);

  const addAnnouncement = async (announce: Announcement, userId: string) => {
    try {
      const docRef = doc(collection(db, "Announcement"));
      announce.announcementId = docRef.id;
      announce.datePosted = new Date();
      console.log(announce);
      await setDoc(doc(db, "Announcement", userId), announce);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleDelete = async (announcementId: string) => {
    try {
      await deleteDoc(doc(db, "Announcement", announcementId));
      setAnnounce((prev) =>
        prev.filter(
          (announcement) => announcement.announcementId !== announcementId
        )
      );
      console.log(
        "Succesfully deleted announcement with id of:",
        announcementId
      );
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  // const handleEdit = async (announcementId: string) => {
  //   try {
  //     await updateDoc(doc(db, "Announcement", announcementId), {
  //       foo: 'bar'
  //     });
  //     return { success: true, message: "success" };
  //   } catch (error) {
  //     return { success: false, message: (error as FirebaseError).message };
  //   }
  // };

  const subscribeToUsers = () => {
    setLoading(true);
    const q = query(collection(db, "Announcement"));

    //listener for any changes
    const unsubscribeUsers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userList = querySnapshot.docs.map((doc: any) => doc.data());
        setAnnounce(userList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );
    return unsubscribeUsers;
  };

  const handleCheckbox = (type_input: string) => {
    if (type.includes(type_input)) {
      setType(type.filter((t) => t !== type_input));
    } else {
      setType([...type, type_input]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newAnnouncement: Announcement = {
      title,
      description,
      datePosted: new Date(),
      type,
      announcementId: "",
      userReference: user!.uid,
    };

    const response = await addAnnouncement(newAnnouncement, user!.uid);

    if (response.success) {
      setShowForm(false);
      setTitle("");
      setDescription("");
    } else {
      console.error("Error adding announcement:", response.message);
    }
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announces,
        isLoading,
        addAnnouncement,
        handleSubmit,
        handleCheckbox,
        handleDelete,
        title,
        description,
        showForm,
        type,
        setTitle,
        setDescription,
        setShowForm,
        setType,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export const useAnnouncement = () => useContext(AnnouncementContext);

/*
References:
https://firebase.google.com/docs/firestore/query-data/listen
*/
