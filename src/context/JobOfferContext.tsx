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
  getDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { JobOffering } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { useBookmarks } from "./BookmarkContext";
import { useNewsLetters } from "./NewsLetterContext";
import { uploadImage } from "@/lib/upload";

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
  const { bookmarks } = useBookmarks();
  const [image, setJobImage] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
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
      jobOffer.alumniId = isAdmin ? "Admin" : user?.uid ?? "";
      
      // This was causing the issue - using an undefined status variable
      // Setting appropriate status based on conditions
      jobOffer.status = jobOffer.status === "Draft" ? "Draft" : (isAdmin ? "Accepted" : "Pending");
      
      console.log(jobOffer);
      await setDoc(doc(db, "job_offering", docRef.id), jobOffer);
      if (isAdmin && jobOffer.status === "Accepted") {
        addNewsLetter(jobOffer.jobId, "job_offering");
      }
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequiredSkill(e.target.value.split(",").map((skill) => skill.trim()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    document.body.style.overflow = "auto";
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
      status: isAdmin ? "Accepted" : "Pending", // Fixed status setting
      location,
      image: "",
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
      // Delete from draft if it exists
      if (editingDraftId) {
        await deleteDoc(doc(db, "job_offering", editingDraftId));
        console.log("Draft deleted successfully");
      }
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

  const handleEdit = async (editedJob: JobOffering) => {
    // Ensure required fields are defined
    if (!editedJob.position || !editedJob.jobDescription || !editedJob.status) {
      console.error("Required fields are missing");
      return;
    }

    const updatedFields = {
      position: editedJob.position,
      jobDescription: editedJob.jobDescription,
      status: editedJob.status,
    };

    try {
      await updateDoc(doc(db, "job_offering", editedJob.jobId), updatedFields);
      console.log("Job updated successfully!");
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const updateStatus = async (status: string, jobId: string) => {
    if (!status || !jobId) {
      console.error("Status or Job ID is missing");
      return;
    }

    try {
      const jobRef = doc(db, "job_offering", jobId);
      await updateDoc(jobRef, { status });
      console.log("Job updated successfully!");
    } catch (error) {
      console.error("Error updating job:", error);
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
      await addNewsLetter(jobId, "job_offering");
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

  const handlePending = async (jobId: string) => {
    try {
      await updateDoc(doc(db, "job_offering", jobId), {
        status: "Pending",
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
      const jobApplicationsQuery = query(
        collection(db, "job_applications"),
        where("jobId", "==", jobId)
      );
      const jobApplicationsSnapshot = await getDocs(jobApplicationsQuery);
      const deletePromises = jobApplicationsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      console.log("Succesfully deleted job with id of:", jobId);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    const draftJobOffering: JobOffering = {
      company,
      employmentType,
      experienceLevel,
      jobDescription,
      jobType,
      position,
      requiredSkill,
      salaryRange,
      jobId: editingDraftId || "", // Use existing ID if editing
      alumniId: isAdmin ? "Admin" : user?.uid || "",
      datePosted: new Date(),
      status: "Draft",
      location,
      image: preview || "", // Use existing preview if available
    };

    try {
      if (image) {
        const uploadResult = await uploadImage(
          image,
          `job_offers/${Date.now()}`
        );
        if (uploadResult.success) {
          draftJobOffering.image = uploadResult.url;
        } else {
          setMessage(uploadResult.result || "Failed to upload image.");
          setIsError(true);
          return;
        }
      }

      let response;

      if (editingDraftId) {
        // Update existing draft
        const updateFields = {
          company: draftJobOffering.company,
          employmentType: draftJobOffering.employmentType,
          experienceLevel: draftJobOffering.experienceLevel,
          jobDescription: draftJobOffering.jobDescription,
          jobType: draftJobOffering.jobType,
          position: draftJobOffering.position,
          requiredSkill: draftJobOffering.requiredSkill,
          salaryRange: draftJobOffering.salaryRange,
          status: draftJobOffering.status,
          location: draftJobOffering.location,
          image: draftJobOffering.image,
        };
        await updateDoc(doc(db, "job_offering", editingDraftId), updateFields);
        response = { success: true, message: "Draft updated successfully" };
      } else {
        // Create new draft
        response = await addJobOffer(draftJobOffering, user?.uid || "Admin");
      }

      if (response.success) {
        // Reset form and states
        setShowForm(false);
        setCompany("");
        setEmploymentType("");
        setExperienceLevel("");
        setJobDescription("");
        setJobType("");
        setPosition("");
        setRequiredSkill([]);
        setSalaryRange("");
        setLocation("");
        setJobImage(null);
        setPreview(null);
        setEditingDraftId(null); // Reset the editing draft ID
        return {
          success: true,
          message: editingDraftId ? "Draft updated" : "Draft saved",
        };
      } else {
        console.error("Error saving draft:", response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      return { success: false, message: "Failed to save draft" };
    }
  };

  const handleEditDraft = (draft: JobOffering) => {
    setCompany(draft.company);
    setEmploymentType(draft.employmentType);
    setExperienceLevel(draft.experienceLevel);
    setJobDescription(draft.jobDescription);
    setJobType(draft.jobType);
    setPosition(draft.position);
    setRequiredSkill(draft.requiredSkill || []);
    setSalaryRange(draft.salaryRange);
    setLocation(draft.location);
    if (draft.image) {
      setPreview(draft.image);
    }
    setEditingDraftId(draft.jobId);
    setShowForm(true);
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
        requiredSkill,
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
        handlePending,
        handleEdit,
        updateStatus,
        handleSaveDraft,
        handleEditDraft,
        setPreview,
        setFileName
      }}
    >
      {children}
    </JobOfferContext.Provider>
  );
}

export const useJobOffer = () => useContext(JobOfferContext);
