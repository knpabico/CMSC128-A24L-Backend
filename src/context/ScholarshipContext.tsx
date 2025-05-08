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
  getDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { FirebaseError } from "firebase/app";
import { Scholarship, Student, ScholarshipStudent } from "@/models/models";
import { useNewsLetters } from "./NewsLetterContext";

const ScholarshipContext = createContext<any>(null);

export function ScholarshipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [scholarshipStudents, setScholarshipStudents] = useState<
    ScholarshipStudent[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const { addNewsLetter } = useNewsLetters();

  useEffect(() => {
    let unsubscribeScholarships: (() => void) | null = null;
    let unsubscribeStudents: (() => void) | null = null;
    let unsubscribeScholarshipStudents: (() => void) | null = null;

    if (user || isAdmin) {
      unsubscribeScholarships = subscribeToScholarships();
      unsubscribeStudents = subscribeToStudents();
      unsubscribeScholarshipStudents = subscribeToScholarshipStudents();
    } else {
      setScholarships([]);
      setStudents([]);
      setScholarshipStudents([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribeScholarships) unsubscribeScholarships();
      if (unsubscribeStudents) unsubscribeStudents();
      if (unsubscribeScholarshipStudents) unsubscribeScholarshipStudents();
    };
  }, [user, isAdmin]);

  const subscribeToScholarships = () => {
    setLoading(true);
    setError(null);

    // Only fetch active scholarships by default
    const q = query(
      collection(db, "scholarship"),
      where("status", "in", ["active", "closed"])
    );

    // Listener for any changes
    const unsubscribeScholarships = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const scholarshipList = querySnapshot.docs.map((doc) => {
            const data = doc.data();

            // Convert Firestore Timestamp to JavaScript Date
            return {
              ...data,
              datePosted:
                data.datePosted instanceof Timestamp
                  ? data.datePosted.toDate()
                  : new Date(data.datePosted),
            } as Scholarship;
          });

          setScholarships(scholarshipList);
          setLoading(false);
        } catch (err) {
          console.error("Error processing scholarships data:", err);
          setError("Failed to process scholarships data");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching scholarships:", err);
        setError("Failed to fetch scholarships");
        setLoading(false);
      }
    );

    return unsubscribeScholarships;
  };

  const subscribeToStudents = () => {
    setLoading(true);
    setError(null);

    // Fetch all students
    const q = query(collection(db, "student"));

    // Listener for any changes
    const unsubscribeStudents = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const studentList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              studentId: doc.id,
            } as Student;
          });

          setStudents(studentList);
          setLoading(false);
        } catch (err) {
          console.error("Error processing students data:", err);
          setError("Failed to process students data");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching students:", err);
        setError("Failed to fetch students");
        setLoading(false);
      }
    );

    return unsubscribeStudents;
  };

  const subscribeToScholarshipStudents = () => {
    setLoading(true);
    setError(null);

    // Fetch all scholarship-student relationships
    const q = query(collection(db, "scholarship_student"));

    // Listener for any changes
    const unsubscribeScholarshipStudents = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const scholarshipStudentList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              ScholarshipStudentId: doc.id,
            } as ScholarshipStudent;
          });

          setScholarshipStudents(scholarshipStudentList);
          setLoading(false);
        } catch (err) {
          console.error("Error processing scholarship-student data:", err);
          setError("Failed to process scholarship-student data");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching scholarship-student relationships:", err);
        setError("Failed to fetch scholarship-student relationships");
        setLoading(false);
      }
    );

    return unsubscribeScholarshipStudents;
  };

  const checkUserRole = async (userId: string) => {
    const adminRef = doc(db, "admin", userId);
    const alumniRef = doc(db, "alumni", userId);

    const [adminSnap, alumniSnap] = await Promise.all([
      getDoc(adminRef),
      getDoc(alumniRef),
    ]);

    if (adminSnap.exists()) {
      return { role: "Admin", name: null };
    } else {
      const alumnusData = alumniSnap.data();
      return { role: "Alumni", name: alumnusData?.name || "Unknown" };
    }
  };

  const addScholarship = async (scholarship: Scholarship) => {
    try {
      const docRef = doc(collection(db, "scholarship"));
      scholarship.scholarshipId = docRef.id;
      scholarship.datePosted = new Date();
      scholarship.status = "active"; // Set default status to active
      // Ensure studentList is initialized if not provided
      scholarship.studentList = scholarship.studentList || [];
      await setDoc(docRef, scholarship);
      await addNewsLetter(scholarship.scholarshipId, "scholarship");

      return { success: true, message: "Scholarship added successfully" };
    } catch (error) {
      console.error("Error adding scholarship:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const updateScholarship = async (
    scholarshipId: string,
    updates: Partial<Scholarship>
  ) => {
    try {
      const scholarshipRef = doc(db, "scholarship", scholarshipId);

      // Convert Date to Timestamp if datePosted is provided in updates
      const firestoreUpdates = { ...updates };
      if (updates.datePosted) {
        firestoreUpdates.datePosted = Timestamp.fromDate(updates.datePosted);
      }

      await updateDoc(scholarshipRef, firestoreUpdates);
      return { success: true, message: "Scholarship updated successfully" };
    } catch (error) {
      console.error("Error updating scholarship:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Soft delete - update status to "deleted" instead of removing from database
  const deleteScholarship = async (scholarshipId: string) => {
    try {
      const scholarshipRef = doc(db, "scholarship", scholarshipId);
      await updateDoc(scholarshipRef, { status: "deleted" });
      return { success: true, message: "Scholarship deleted successfully" };
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Get all scholarships including deleted ones (for admin purposes)
  const getAllScholarships = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "scholarship"));

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            try {
              const scholarshipList = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                  ...data,
                  datePosted:
                    data.datePosted instanceof Timestamp
                      ? data.datePosted.toDate()
                      : new Date(data.datePosted),
                } as Scholarship;
              });

              setLoading(false);
              resolve(scholarshipList);
              // Unsubscribe after getting the data once
              unsubscribe();
            } catch (err) {
              console.error("Error processing all scholarships data:", err);
              setError("Failed to process all scholarships data");
              setLoading(false);
              reject(err);
              unsubscribe();
            }
          },
          (err) => {
            console.error("Error fetching all scholarships:", err);
            setError("Failed to fetch all scholarships");
            setLoading(false);
            reject(err);
            unsubscribe();
          }
        );
      });
    } catch (error) {
      setLoading(false);
      console.error("Error in getAllScholarships:", error);
      throw error;
    }
  };

  const getScholarshipById = async (
    id: string
  ): Promise<Scholarship | null> => {
    try {
      const scholarshipDoc = doc(db, "scholarship", id);
      const scholarshipSnapshot = await getDoc(scholarshipDoc);

      if (scholarshipSnapshot.exists()) {
        const data = scholarshipSnapshot.data();
        return {
          scholarshipId: scholarshipSnapshot.id,
          title: data.title,
          description: data.description,
          datePosted: data.datePosted.toDate(),
          alumList: data.alumList || [],
          studentList: data.studentList || [],
          image: data.image,
          status: data.status || "active", // Default to active if status is not present
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching scholarship by ID:", err);
      throw new Error("Failed to load scholarship details");
    }
  };

  // Student-related functions
  const addStudent = async (student: Student) => {
    try {
      const docRef = doc(collection(db, "student"));
      student.studentId = docRef.id;
      await setDoc(docRef, student);
      return {
        success: true,
        message: "Student added successfully",
        studentId: docRef.id,
      };
    } catch (error) {
      console.error("Error adding student:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const updateStudent = async (
    studentId: string,
    updates: Partial<Student>
  ) => {
    try {
      const studentRef = doc(db, "student", studentId);
      await updateDoc(studentRef, updates);
      return { success: true, message: "Student updated successfully" };
    } catch (error) {
      console.error("Error updating student:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      // First check if student is associated with any scholarships
      const scholarshipStudentQuery = query(
        collection(db, "scholarship_student"),
        where("studentId", "==", studentId)
      );

      const scholarshipStudentSnapshot = await getDocs(scholarshipStudentQuery);

      if (!scholarshipStudentSnapshot.empty) {
        return {
          success: false,
          message:
            "Cannot delete student as they are associated with scholarships",
        };
      }

      // If no associations, delete the student
      const studentRef = doc(db, "student", studentId);
      await deleteDoc(studentRef);
      return { success: true, message: "Student deleted successfully" };
    } catch (error) {
      console.error("Error deleting student:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const getStudentById = async (id: string): Promise<Student | null> => {
    try {
      const studentDoc = doc(db, "student", id);
      const studentSnapshot = await getDoc(studentDoc);

      if (studentSnapshot.exists()) {
        const data = studentSnapshot.data();
        return {
          studentId: studentSnapshot.id,
          name: data.name,
          studentNumber: data.studentNumber,
          age: data.age,
          shortBackground: data.shortBackground,
          address: data.address,
          emailAddress: data.emailAddress,
          background: data.background,
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching student by ID:", err);
      throw new Error("Failed to load student details");
    }
  };

  // ScholarshipStudent-related functions
  const addScholarshipStudent = async (
    scholarshipStudent: ScholarshipStudent
  ) => {
    try {
      const docRef = doc(collection(db, "scholarship_student"));
      scholarshipStudent.ScholarshipStudentId = docRef.id;

      await setDoc(docRef, scholarshipStudent);

      // Add student to the studentList array in the scholarship document
      const scholarshipRef = doc(
        db,
        "scholarship",
        scholarshipStudent.scholarshipId
      );
      const scholarshipDoc = await getDoc(scholarshipRef);

      if (scholarshipDoc.exists()) {
        const scholarshipData = scholarshipDoc.data();
        const studentList = scholarshipData.studentList || [];

        if (!studentList.includes(scholarshipStudent.studentId)) {
          await updateDoc(scholarshipRef, {
            studentList: [...studentList, scholarshipStudent.studentId],
          });
        }
      }

      return {
        success: true,
        message: "Scholarship application submitted successfully",
        scholarshipStudentId: docRef.id,
      };
    } catch (error) {
      console.error("Error adding scholarship student:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const updateScholarshipStudent = async (
    scholarshipStudentId: string,
    updates: Partial<ScholarshipStudent>
  ) => {
    try {
      const scholarshipStudentRef = doc(
        db,
        "scholarship_student",
        scholarshipStudentId
      );
      await updateDoc(scholarshipStudentRef, updates);
      return {
        success: true,
        message: "Scholarship application updated successfully",
      };
    } catch (error) {
      console.error("Error updating scholarship student:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const deleteScholarshipStudent = async (scholarshipStudentId: string) => {
    try {
      // Get the scholarship student record first to get the scholarshipId and studentId
      const scholarshipStudentRef = doc(
        db,
        "scholarship_student",
        scholarshipStudentId
      );
      const scholarshipStudentDoc = await getDoc(scholarshipStudentRef);

      if (scholarshipStudentDoc.exists()) {
        const scholarshipStudentData = scholarshipStudentDoc.data();
        const { scholarshipId, studentId } = scholarshipStudentData;

        // Delete the scholarship student record
        await deleteDoc(scholarshipStudentRef);

        // Remove student from the studentList in the scholarship document
        const scholarshipRef = doc(db, "scholarship", scholarshipId);
        const scholarshipDoc = await getDoc(scholarshipRef);

        if (scholarshipDoc.exists()) {
          const scholarshipData = scholarshipDoc.data();
          const studentList = scholarshipData.studentList || [];
          const updatedStudentList = studentList.filter(
            (id: string) => id !== studentId
          );

          await updateDoc(scholarshipRef, {
            studentList: updatedStudentList,
          });
        }

        return {
          success: true,
          message: "Scholarship application deleted successfully",
        };
      } else {
        return { success: false, message: "Scholarship application not found" };
      }
    } catch (error) {
      console.error("Error deleting scholarship student:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const getScholarshipStudentById = async (
    id: string
  ): Promise<ScholarshipStudent | null> => {
    try {
      const scholarshipStudentDoc = doc(db, "scholarship_student", id);
      const scholarshipStudentSnapshot = await getDoc(scholarshipStudentDoc);

      if (scholarshipStudentSnapshot.exists()) {
        const data = scholarshipStudentSnapshot.data();
        return {
          ScholarshipStudentId: scholarshipStudentSnapshot.id,
          studentId: data.studentId,
          alumId: data.alumId,
          scholarshipId: data.scholarshipId,
          status: data.status,
          pdf: data.pdf,
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching scholarship application by ID:", err);
      throw new Error("Failed to load scholarship application details");
    }
  };

  // Get all students for a specific scholarship
  const getStudentsByScholarshipId = async (
    scholarshipId: string
  ): Promise<Student[]> => {
    try {
      // First get the scholarship to get the studentList
      const scholarshipDoc = await getScholarshipById(scholarshipId);

      if (
        !scholarshipDoc ||
        !scholarshipDoc.studentList ||
        scholarshipDoc.studentList.length === 0
      ) {
        return [];
      }

      // Fetch all students in the studentList
      const studentPromises = scholarshipDoc.studentList.map(
        (studentId: string) => getStudentById(studentId)
      );

      const students = await Promise.all(studentPromises);
      // Filter out any null results
      return students.filter((student): student is Student => student !== null);
    } catch (err) {
      console.error("Error fetching students by scholarship ID:", err);
      throw new Error("Failed to load scholarship students");
    }
  };

  // Get all scholarship applications for a specific scholarship
  const getScholarshipStudentsByScholarshipId = async (
    scholarshipId: string
  ): Promise<ScholarshipStudent[]> => {
    try {
      const q = query(
        collection(db, "scholarship_student"),
        where("scholarshipId", "==", scholarshipId)
      );

      const querySnapshot = await getDocs(q);
      const scholarshipStudentList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        ScholarshipStudentId: doc.id,
      })) as ScholarshipStudent[];

      return scholarshipStudentList;
    } catch (err) {
      console.error(
        "Error fetching scholarship applications by scholarship ID:",
        err
      );
      throw new Error("Failed to load scholarship applications");
    }
  };

  // Get all scholarship applications for a specific student
  const getScholarshipStudentsByStudentId = async (
    studentId: string
  ): Promise<ScholarshipStudent[]> => {
    try {
      const q = query(
        collection(db, "scholarship_student"),
        where("studentId", "==", studentId)
      );

      const querySnapshot = await getDocs(q);
      const scholarshipStudentList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        ScholarshipStudentId: doc.id,
      })) as ScholarshipStudent[];

      return scholarshipStudentList;
    } catch (err) {
      console.error(
        "Error fetching scholarship applications by student ID:",
        err
      );
      throw new Error("Failed to load student's scholarship applications");
    }
  };

  // Get all scholarship applications for a specific alumnus
  const getScholarshipStudentsByAlumId = async (
    alumId: string
  ): Promise<ScholarshipStudent[]> => {
    try {
      const q = query(
        collection(db, "scholarship_student"),
        where("alumId", "==", alumId)
      );

      const querySnapshot = await getDocs(q);
      const scholarshipStudentList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        ScholarshipStudentId: doc.id,
      })) as ScholarshipStudent[];

      return scholarshipStudentList;
    } catch (err) {
      console.error("Error fetching scholarship applications by alum ID:", err);
      throw new Error(
        "Failed to load alum's sponsored scholarship applications"
      );
    }
  };

  return (
    <ScholarshipContext.Provider
      value={{
        // Scholarship-related
        scholarships,
        addScholarship,
        updateScholarship,
        deleteScholarship,
        getScholarshipById,
        getAllScholarships,

        // Student-related
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,

        // ScholarshipStudent-related
        scholarshipStudents,
        addScholarshipStudent,
        updateScholarshipStudent,
        deleteScholarshipStudent,
        getScholarshipStudentById,
        getScholarshipStudentsByScholarshipId,
        getScholarshipStudentsByStudentId,
        getScholarshipStudentsByAlumId,
        getStudentsByScholarshipId,

        // Status
        loading,
        error,
      }}
    >
      {children}
    </ScholarshipContext.Provider>
  );
}

export const useScholarship = () => {
  const context = useContext(ScholarshipContext);
  if (!context) {
    throw new Error("useScholarship must be used within a ScholarshipProvider");
  }
  return context;
};
