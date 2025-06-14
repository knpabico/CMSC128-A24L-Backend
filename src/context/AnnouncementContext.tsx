"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  getDoc, 
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
import { auth } from "@/lib/firebase";
import { uploadImage } from "@/lib/upload";

const AnnouncementContext = createContext<any>(null);

export function AnnouncementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announces, setAnnounce] = useState<Announcement[]>([]);
  const [publicAnnouncements, setPublicAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const { user, isAdmin } = useAuth();
  const [image, setAnnounceImage] = useState(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false)
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState<
    string | null
  >(null);

  const { addNewsLetter, deleteNewsLetter } = useNewsLetters();

  useEffect(() => {
    setLoading(true);

    const q = query(collection(db, "Announcement"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const announcements = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            announcementId: doc.id,
            datePosted: data.datePosted.toDate(), // Convert Firestore Timestamp to Date
          } as Announcement;
        });
        setAnnounce(announcements);
        setPublicAnnouncements(
          announcements.filter((announcement) => announcement.isPublic)
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching announcements:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []); // Remove dependencies to ensure single subscription

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnnounceImage(file);
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    }
  };

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

const handleEdit = async (e: React.FormEvent, removeImage = false) => {
  e.preventDefault();

  const updatedAnnouncement: Announcement = {
    title,
    description,
    datePosted: new Date(),
    type,
    announcementId: currentAnnouncementId!,
    image: "", // will be updated below
    isPublic,
  };

  try {
    const docRef = doc(db, "Announcement", currentAnnouncementId!);
    const existingDoc = await getDoc(docRef);

    if (removeImage) {
      // Image is being removed
      updatedAnnouncement.image = "";
    } else if (image) {
      // New image is being uploaded
      const uploadResult = await uploadImage(image, `announcement/${Date.now()}`);
      if (uploadResult.success) {
        updatedAnnouncement.image = uploadResult.url;
      } else if (existingDoc.exists()) {
        const oldData = existingDoc.data() as Announcement;
        updatedAnnouncement.image = oldData.image || "";
      }
    } else {
      // Preserve existing image
      if (existingDoc.exists()) {
        const oldData = existingDoc.data() as Announcement;
        updatedAnnouncement.image = oldData.image || "";
      }
    }

    await updateDoc(docRef, updatedAnnouncement);

    // Reset form state
    setShowForm(false);
    setTitle("");
    setDescription("");
    setAnnounceImage(null);
    setPreview(null);
    setIsEdit(false);
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
      isPublic,
    };

    if (image) {
      const uploadResult = await uploadImage(image, `announcement/${Date.now()}`);
      if (uploadResult.success) {
        newAnnouncement.image = uploadResult.url;
      } else {
        setMessage(uploadResult.result || "Failed to upload image.");
        setIsError(true);
        return;
      }
    }
    

    const response = await addAnnouncement(newAnnouncement);
    
    if (response.success) {
      setShowForm(false);
      setTitle("");
      setDescription("");
      setAnnounceImage(null);
    } else {
      console.error("Error adding announcement:", response.message);
    }
  };

   const togglePublic = async (announcementId: string, currentState: boolean) => {
    try {
      const docRef = doc(db, "Announcement", announcementId);
      await updateDoc(docRef, {
        isPublic: !currentState
      });
      return { success: true, message: "Status updated successfully" };
    } catch (error) {
      console.error("Error toggling public status:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  return (
    <AnnouncementContext.Provider
      value={{
        announces,
        publicAnnouncements,
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
        isPublic,
        setAnnounce,
        setTitle,
        setDescription,
        setShowForm,
        setType,
        setIsEdit,
        handleImageChange,
        image,
        setAnnounceImage,
        preview,
        fileName,
        setCurrentAnnouncementId,
        setIsPublic,
        togglePublic
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
