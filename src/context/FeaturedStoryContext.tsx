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
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Featured } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { uploadImage } from "@/lib/upload";

const FeaturedStoryContext = createContext<any>(null);

export function FeaturedProvider({ children }: { children: React.ReactNode }) {
  const [featuredItems, setFeaturedItems] = useState<Featured[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentFeaturedId, setCurrentFeaturedId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [isPublic, setIsPublic] = useState(true); 
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user || isAdmin) {
      unsubscribe = subscribeToFeatured();
    } else {
      setFeaturedItems([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAdmin]);

  const addFeatured = async (item: Featured) => {
    try {
      const docRef = doc(collection(db, "featured"));
      item.featuredId = docRef.id;
      item.datePosted = new Date();
      item.text = text; // Use the text state
      item.title = title; // Use the title state
      item.type = type; // Use the type state
      item.isPublic = true; // Default to public
      await setDoc(docRef, item);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };


    const handleUpload = async (newFeatured: Featured) => {
      if (!image) {
        setMessage("No image selected");
        setIsError(true);
        return;
      }
      try {
        const data = await uploadImage(image, `featured/${newFeatured.featuredId}`); 
        const result = await updateFeatured(newFeatured.featuredId, {image: data.url} );
        if (data.success) {
          setIsError(false);
          setMessage("Image uploaded successfully!");
          console.log("Image URL:", data.url); // URL of the uploaded image
        } else {
          setMessage(data.result);
          setIsError(true);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Featured = {
      featuredId: "",
      text,
      image: "",
      title,
      type,
      isPublic,
      datePosted: new Date(),
    };

    const response = await addFeatured(newItem);

    handleUpload(newItem);

    if (response.success) {
      setShowForm(false);
      setText("");
      setImage("");
      setTitle("");
      setType("");
      setIsPublic(true);
    } else {
      console.error("Error adding featured item:", response.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "featured", id));
      setFeaturedItems((prev) => prev.filter((item) => item.featuredId !== id));
    } catch (error) {
      console.error("Error deleting featured item:", error);
    }
  };


  const updateFeatured = async (featuredId: string, updates: Partial<Featured>) => {
    try {
      const featuredRef = doc(db, "featured", featuredId);
      
      // Convert Date to Timestamp if datePosted is provided in updates
      const firestoreUpdates = { ...updates };
      if (updates.datePosted) {
        firestoreUpdates.datePosted = Timestamp.fromDate(updates.datePosted);
      }
      
      await updateDoc(featuredRef, firestoreUpdates);
      return { success: true, message: "Featured story updated successfully" };
    } catch (error) {
      console.error("Error updating featured story:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const subscribeToFeatured = () => {
    setLoading(true);
    const q = query(collection(db, "featured"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list = querySnapshot.docs.map((doc) => doc.data() as Featured);
        setFeaturedItems(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching featured items:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  const getFeaturedById = async (id: string): Promise<Featured | null> => {
    try {
      const docRef = doc(db, "featured", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as Featured;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching featured story by ID:", error);
      return null;
    }
  };

  return (
    <FeaturedStoryContext.Provider
      value={{
        featuredItems,
        isLoading,
        isEdit,
        text,
        image,
        title,
        type,
        isPublic,
        showForm,
        setText,
        setImage,
        setTitle,
        setType,
        setShowForm,
        setIsEdit,
        setIsPublic,
        setCurrentFeaturedId,
        addFeatured,
        handleSubmit,
        handleDelete,
        updateFeatured,
        getFeaturedById,
      }}
    >
      {children}
    </FeaturedStoryContext.Provider>
  );
}

export const useFeatured = () => useContext(FeaturedStoryContext);