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
  getDocs,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { JobOffering } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { useBookmarks } from "./BookmarkContext";

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
  const { user, isAdmin, alumInfo } = useAuth();
  const [alumJobOfferings, setAlumJobOfferings] = useState<JobOffering[]>([]);
  
  
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

  useEffect(() => {
    const fetchJobOffers = async () => {
      if (!alumInfo?.alumniId) {
        return; // Don't fetch if alumniId is not available
      }

      setLoading(true); // Start loading

      try {
        const jobOffersQuery = query(
          collection(db, "job_offering"),
          where("alumniId", "==", alumInfo.alumniId)
        );

        const snapshot = await getDocs(jobOffersQuery);

        const fetchedJobOffers = snapshot.docs.map(
          (doc) => ({
            jobId: doc.id,
            ...doc.data(),
          } as JobOffering)
        );

        setJobOffers(fetchedJobOffers); // Store the fetched job offers
      } catch (error) {
        console.error("Error fetching job offers:", error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchJobOffers();
  }, [alumInfo?.alumniId]); 


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


    //get the Job Offer by Alumni
    const getJobOfferByAlumni = async (
      alumniId: string
    ): Promise<JobOffering[]> => {
      if (!alumniId) {
        console.error("No alumni ID provided");
        return Promise.reject("No alumni ID provided");
      }
  
      setLoading(true);
  
      try {
        const jobOffersQuery = query(
          collection(db, "job_offering"),
          where("alumniId", "==", alumniId)
        );
  
        const snapshot = await getDocs(jobOffersQuery);
  
        const jobOffers = snapshot.docs.map(
          (doc) =>
            ({
              jobId: doc.id,
              ...doc.data(),
            } as JobOffering)
        );
  
        setLoading(false);
        return jobOffers;
      } catch (error) {
        console.error("Error fetching donations by alumni:", error);
        setLoading(false);
        throw error;
      }
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
      image: "",
    };

    const response = await addJobOffer(newJobOffering, user!.uid);

    if (response.success) {
      console.log("Job offer successfully added:", newJobOffering);
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
        getJobOfferByAlumni,
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
