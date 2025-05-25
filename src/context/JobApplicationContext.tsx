"use client";

import { db } from "@/lib/firebase";
import { Alumnus, JobApplication, JobOffering } from "@/models/models";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  getDoc,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  sendEmailTemplateForJobApplicationStatus,
  sendEmailTemplateForNewsletterJobApplication,
} from "@/lib/emailTemplate";

export const JobApplicationContext = createContext<any>(null);

export function JobApplicationContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;
    if (user || isAdmin) {
      unsubscribe = subscribeToJobApplications();
    } else {
      setJobApplications([]);
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAdmin]);

  const addJobApplication = async (
    jobApplication: JobApplication,
    job: JobOffering
  ) => {
    try {
      const docRef = doc(collection(db, "job_applications"));
      jobApplication.jobApplicationId = docRef.id;
      jobApplication.applicantId = user?.uid ?? "";
      await setDoc(doc(db, "job_applications", docRef.id), jobApplication);
      const applicant = await getDoc(
        doc(db, "alumni", jobApplication.applicantId)
      ).then((doc) => {
        if (doc.exists()) {
          return doc.data() as Alumnus;
        }
        return null;
      });
      let hiringManager;
      if (jobApplication.contactId === "Admin") {
        hiringManager = "cmsc128a24l@gmail.com";
      } else {
        hiringManager = await getDoc(doc(db, "alumni", job.alumniId)).then(
          (doc) => {
            if (doc.exists()) {
              return doc.data().email as string;
            }
            return null;
          }
        );
      }
      if (applicant && hiringManager) {
        await sendEmailTemplateForNewsletterJobApplication(
          job,
          applicant,
          hiringManager
        );
      }
    } catch (error) {
      console.error("Error adding job application:", error);
    }
  };

  const updateApplicationStatus = async (
    jobId: string,
    status: string,
    applicant: Alumnus,
    job: JobOffering
  ) => {
    try {
      const jobApplicationRef = doc(db, "job_applications", jobId);
      await updateDoc(jobApplicationRef, { status: status });
      await sendEmailTemplateForJobApplicationStatus(applicant, job, status);
    } catch (error) {
      console.error("Error updating job application status:", error);
    }
  };

  const updateApplicationStatusAdmin = async (
    jobId: string,
    status: string
  ) => {
    try {
      const jobApplicationRef = doc(db, "job_applications", jobId);
      await updateDoc(jobApplicationRef, { status: status });
    } catch (error) {
      console.error("Error updating job application status:", error);
    }
  };

  const subscribeToJobApplications = () => {
    setLoading(true);
    const q = query(collection(db, "job_applications"));

    //listener for any changes
    const unsubscribeJobOfffers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const applications = querySnapshot.docs.map((doc: any) => doc.data());
        setJobApplications(applications);
        setLoading(false);
        console.log("Success! Fetched job applications:", applications);
      },
      (error) => {
        console.error("Error fetching job applications:", error);
        setLoading(false);
      }
    );

    return unsubscribeJobOfffers;
  };

  return (
    <JobApplicationContext.Provider
      value={{
        jobApplications,
        loading,
        addJobApplication,
        updateApplicationStatus,
        updateApplicationStatusAdmin,
      }}
    >
      {children}
    </JobApplicationContext.Provider>
  );
}

export const useJobApplicationContext = () => useContext(JobApplicationContext);
