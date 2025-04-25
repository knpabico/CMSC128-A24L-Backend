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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Announcement } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { NewsLetterProvider, useNewsLetters } from "./NewsLetterContext";
const AnnouncementContext = createContext<any>(null);

export function AnnouncementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announces, setAnnounce] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string[]>([]);
  const { user, isAdmin } = useAuth();
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState<
    string | null
  >(null);

  const { addNewsLetter, deleteNewsLetter } = useNewsLetters();

  useEffect(() => {
    console.log("Admin", isAdmin);
    let unsubscribe: (() => void) | null;

    if (user || isAdmin) {
      unsubscribe = subscribeToUsers(); // listen to firestore
    } else {
      setAnnounce([]); // reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAdmin]); // added admin role

  const addAnnouncement = async (announce: Announcement) => {
    try {
      const docRef = doc(collection(db, "Announcement"));
      announce.announcementId = docRef.id;
      announce.datePosted = new Date();
      console.log(announce);
      await setDoc(docRef, announce);
      await addNewsLetter(announce.announcementId, "announcement");
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

      await deleteNewsLetter(announcementId);
    
      console.log(
        "Succesfully deleted announcement with id of:",
        announcementId
      );
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedAnnouncement: Announcement = {
      title,
      description,
      datePosted: new Date(),
      type,
      announcementId: currentAnnouncementId!,
      image: "",
      isPublic: false
    };

    try {
      if (currentAnnouncementId) {
        await updateDoc(doc(db, "Announcement", currentAnnouncementId), {
          ...updatedAnnouncement,
        });
      } else {
        console.error("Error: ann id is null");
      }
      console.log("Announcement updated successfully!");
      // Optionally, reset the form and close the form
      setShowForm(false);
      setTitle("");
      setDescription("");
      setIsEdit(false); // Reset the edit mode
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  const subscribeToUsers = () => {
    setLoading(true);
    const q = query(collection(db, "Announcement"));

    //listener for any changes
    const unsubscribeUsers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userList = querySnapshot.docs.map((doc: any) => doc.data());
        console.log("User List:", userList);
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
      image: "",
      isPublic: false,
    };

    const response = await addAnnouncement(newAnnouncement);

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
        isEdit,
        addAnnouncement,
        handleSubmit,
        handleCheckbox,
        handleDelete,
        handleEdit,
        title,
        description,
        showForm,
        type,
        setTitle,
        setDescription,
        setShowForm,
        setType,
        setIsEdit,
        setCurrentAnnouncementId,
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
