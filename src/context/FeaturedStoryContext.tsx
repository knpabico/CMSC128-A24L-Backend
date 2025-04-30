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
import { Featured } from "@/models/models";
import { FirebaseError } from "firebase/app";

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
      await setDoc(docRef, item);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: Featured = {
      featuredId: "",
      text,
      image,
      title,
      type,
      datePosted: new Date(),
    };

    const response = await addFeatured(newItem);

    if (response.success) {
      setShowForm(false);
      setText("");
      setImage("");
      setTitle("");
      setType("");
    } else {
      console.error("Error adding featured item:", response.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Featured", id));
      setFeaturedItems((prev) => prev.filter((item) => item.featuredId !== id));
    } catch (error) {
      console.error("Error deleting featured item:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedItem: Featured = {
      featuredId: currentFeaturedId!,
      text,
      image,
      title,
      type,
      datePosted: new Date(),
    };

    try {
      if (currentFeaturedId) {
        await updateDoc(doc(db, "featured", currentFeaturedId), updatedItem);
        setShowForm(false);
        setText("");
        setImage("");
        setTitle("");
        setType("");
        setIsEdit(false);
      } else {
        console.error("Error: featuredId is null");
      }
    } catch (error) {
      console.error("Error updating featured item:", error);
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
        showForm,
        setText,
        setImage,
        setTitle,
        setType,
        setShowForm,
        setIsEdit,
        setCurrentFeaturedId,
        addFeatured,
        handleSubmit,
        handleDelete,
        handleEdit,
      }}
    >
      {children}
    </FeaturedStoryContext.Provider>
  );
}

export const useFeatured = () => useContext(FeaturedStoryContext);
