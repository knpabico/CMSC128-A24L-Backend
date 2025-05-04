"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { JobOffering } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { useBookmarks } from "./BookmarkContext";
import { useNewsLetters } from "./NewsLetterContext";
import { set } from "zod";
const JobOfferContext = createContext<any>(null);
import { uploadImage } from "@/lib/upload"; 

export function JobOfferProvider({ children }: { children: React.ReactNode }) {
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [position, setPosition] = useState("");
  const [requiredSkill, setRequiredSkill] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobOffering | null>(null);
  const { user, isAdmin } = useAuth();
  const { bookmarks } = useBookmarks();
  const [image, setJobImage] = useState(null);
  const [location, setLocation] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const { addNewsLetter, deleteNewsLetter } = useNewsLetters();

  useEffect(() => {
    console.log("User from useAuth:", user);
    let unsubscribe: (() => void) | null;

    if (user || isAdmin) {
      unsubscribe = subscribeToJobOffers();
    } else {
      setJobOffers([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAdmin]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJobImage(file);
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addJobOffer = async (jobOffer: JobOffering, userId: string) => {
    try {
      const docRef = doc(collection(db, "job_offering"));
      jobOffer.jobId = docRef.id;
      jobOffer.alumniId = user?.uid || "Admin";
      jobOffer.status = isAdmin ? "Accepted": "Pending";
      console.log(jobOffer);
      await setDoc(doc(db, "job_offering", docRef.id), jobOffer)  ;
      return { success: true, message: "success" };
    } catch (error) { 
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequiredSkill(e.target.value.split(",").map((skill) => skill.trim()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newJobOffering: JobOffering = {
      company,
      employmentType,
      experienceLevel,
      jobDescription,
      jobType,
      position,
      requiredSkill,
      salaryRange,
      jobId: "",
      alumniId: isAdmin ? "Admin" : user?.uid || "",
      datePosted: new Date(),
      status,
      location, // Use the location state directly
      image: "", // Keep empty string as initial value for image
    };
  
    if (image) {
      const uploadResult = await uploadImage(image, `job_offers/${Date.now()}`);
      if (uploadResult.success) {
        newJobOffering.image = uploadResult.url;
      } else {
        setMessage(uploadResult.result || "Failed to upload image.");
        setIsError(true);
        return;
      }
    }
  
    const response = await addJobOffer(newJobOffering, user?.uid || "Admin");

    if (response.success) {
      console.log("Job offer added:", newJobOffering);
      // Reset form
      setShowForm(false);
      setCompany("");
      setEmploymentType("");
      setExperienceLevel("");
      setJobDescription("");
      setJobType("");
      setPosition("");
      setRequiredSkill([]);
      setSalaryRange("");
      setJobImage(null);
      setPreview(null);
    } else {
      console.error("Error adding job:", response.message);
    }
  };

  const subscribeToJobOffers = () => {
    setLoading(true);
    const q = query(collection(db, "job_offering"));

    //listener for any changes
    const unsubscribeJobOfffers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const offers = querySnapshot.docs.map((doc: any) => doc.data());
        setJobOffers(offers);
        setLoading(false);
        console.log("Success! Fetched job offers:", offers);
      },
      (error) => {
        console.error("Error fetching job offers:", error);
        setLoading(false);
      }
    );

    return unsubscribeJobOfffers;
  };

  const handleAccept = async (jobId: string) => {
    try {
      await updateDoc(doc(db, "job_offering", jobId), {
        status: "Accepted",
      });
      await addNewsLetter(jobId, "job_offering")
      console.log("Job offer accepted and added to newsletter:", jobId);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleReject = async (jobId: string) => {
    try {
      await updateDoc(doc(db, "job_offering", jobId), {
        status: "Rejected",
      });
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleView = (jobId: string) => {
    const job = jobOffers.find((job: JobOffering) => job.jobId === jobId);
    setSelectedJob(job || null);
  };

  const closeModal = () => {
    setSelectedJob(null);
  };

  const handleDelete = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, "job_offering", jobId));
      setJobOffers((prev) =>
        prev.filter((jobOffers) => jobOffers.jobId !== jobId)
      );

      await deleteNewsLetter(jobId);

      console.log("Succesfully deleted job with id of:", jobId);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <JobOfferContext.Provider
      value={{
        jobOffers,
        bookmarks,
        isLoading,
        addJobOffer,
        setShowForm,
        showForm,
        handleSubmit,
        company,
        setCompany,
        employmentType,
        setEmploymentType,
        experienceLevel,
        setExperienceLevel,
        jobDescription,
        setJobDescription,
        jobType,
        setJobType,
        position,
        setPosition,
        handleSkillChange,
        salaryRange,
        setSalaryRange,
        handleAccept,
        handleReject,
        handleView,
        closeModal,
        selectedJob,
        location,
        setLocation,
        handleDelete,
        image,
        setJobImage,
        preview,
        fileName,
        handleImageChange,
      }}
    >
      {children}
    </JobOfferContext.Provider>
  );
}

export const useJobOffer = () => useContext(JobOfferContext);
