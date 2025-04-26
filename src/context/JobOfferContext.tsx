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
const JobOfferContext = createContext<any>(null);

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

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user || isAdmin) {
      unsubscribe = subscribeToJobOffers(); //maglilisten sa firestore
    } else {
      setJobOffers([]); //reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user, isAdmin]);

  const addJobOffer = async (jobOffer: JobOffering, userId: string) => {
    try {
      const docRef = doc(collection(db, "job_offering"));
      jobOffer.jobId = docRef.id;
      jobOffer.alumniId = user!.uid;
      jobOffer.status = "Pending";
      console.log(jobOffer);
      await setDoc(doc(db, "job_offering", docRef.id), jobOffer);
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
      alumniId: "",
      datePosted: new Date(),
      status: "",
    };

    const response = await addJobOffer(newJobOffering, user!.uid);

    if (response.success) {
      setShowForm(false);
      setCompany("");
      setEmploymentType("");
      setExperienceLevel("");
      setJobDescription("");
      setJobType("");
      setPosition("");
      setRequiredSkill([]);
      setSalaryRange("");
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
        const offers = querySnapshot.docs.map(
          (doc: any) => doc.data() as JobOffering
        );
        setJobOffers(offers);
        setLoading(false);
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
      console.log("Succesfully deleted job with id of:", jobId);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  return (
    <JobOfferContext.Provider
      value={{
        jobOffers,
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
        handleDelete,
      }}
    >
      {children}
    </JobOfferContext.Provider>
  );
}

export const useJobOffer = () => useContext(JobOfferContext);
