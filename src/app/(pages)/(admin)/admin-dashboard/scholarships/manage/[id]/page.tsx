"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useScholarship } from "@/context/ScholarshipContext";
import { Alumnus, Scholarship } from "@/models/models";
import {
  Asterisk,
  ChevronRight,
  MoveLeft,
  Pen,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { uploadImage } from "@/lib/upload";
import { useAlums } from "@/context/AlumContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ScholarshipDetailPage: React.FC = () => {
  const params = useParams();
  const { getScholarshipById, updateScholarship, getStudentsByScholarshipId } =
    useScholarship();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scholarshipId = params?.id as string;
  const { alums, isLoading } = useAlums();

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alumList, setAlumniList] = useState<Alumnus[]>([]);
  const [isInformationOpen, setIsInformationOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const data = await getScholarshipById(scholarshipId);
        if (data) {
          setScholarship(data);
          setEditData({
            title: data.title || "",
            description: data.description || "",
            image: data.image || "",
          });
          setPreview(data.image);

          // Only attempt to fetch alumni if alumList exists and is not empty
          if (data.alumList && data.alumList.length > 0) {
            // Fetch Alumni details for each alumId
            const alumniList = await Promise.all(
              data.alumList.map(async (alumId: any) => {
                try {
                  const alumRef = doc(db, "alumni", alumId);
                  const alumSnap = await getDoc(alumRef);

                  if (alumSnap.exists()) {
                    const alumData = alumSnap.data();
                    return {
                      id: alumId,
                      ...alumData,
                      fullName:
                        `${alumData.firstName || ""} ${
                          alumData.lastName || ""
                        }`.trim() || "Unknown",
                    };
                  } else {
                    return { id: alumId, fullName: "Unknown" };
                  }
                } catch (error) {
                  console.error(
                    `Error fetching alumni info for ${alumId}:`,
                    error
                  );
                  return { id: alumId, fullName: "Unknown" };
                }
              })
            );
            // Set the fetched alumni list to state
            setAlumniList(alumniList);
          } else {
            // Set empty array if no alumni are associated
            setAlumniList([]);
          }
        } else {
          setError("Scholarship not found");
        }
      } catch (err) {
        setError("Error loading scholarship details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const studentList = await getStudentsByScholarshipId(scholarshipId);
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    if (scholarshipId) {
      fetchScholarship();
      fetchStudents();
    }
  }, [scholarshipId, getStudentsByScholarshipId]);

  const router = useRouter();
  const addStudentRoute = () => {
    router.push(
      `/admin-dashboard/scholarships/manage/${scholarshipId}/add-student`
    );
  };

  // Scholarship Edit/Update
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    image: "",
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarship?.scholarshipId) return;
    let updatedData = { ...editData };
    if (image && image !== scholarship.image) {
      try {
        setIsSubmitting(true);
        const data = await uploadImage(
          image,
          `scholarship/${scholarship.scholarshipId}`
        );
        if (data.success) {
          updatedData.image = data.url;
          setIsError(false);
          setMessage("Image uploaded successfully!");
          console.log("Image URL:", data.url);
        } else {
          setMessage(data.result || "Image upload failed.");
          setIsError(true);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toastError("Image upload error.");
        return;
      }
    }
    const result = await updateScholarship(
      scholarship.scholarshipId,
      updatedData
    );
    if (result.success) {
      toastSuccess("Scholarship updated successfully!");
      setIsSubmitting(false);
      setIsEditing(false);
    } else {
      toastError("Failed to update: " + result.message);
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //preview
    }
  };

	const manage = () => {
    router.push("/admin-dashboard/scholarships/manage");
  };

	const home = () => {
    router.push("/admin-dashboard");
  };

  if (loading) {
    return <div style={{ margin: "20px" }}>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="hover:text-blue-600 cursor-pointer" onClick={home} >Home</div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="hover:text-blue-600 cursor-pointer" onClick={manage}>Manage Donation Drives</div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-bold text-[var(--primary-blue)]">
            {scholarship?.title}
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="font-bold text-3xl">{scholarship?.title}</div>
            {!isEditing && (
              <div
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
              >
                <Pencil size={18} /> Edit Donation Drive
              </div>
            )}
          </div>
        </div>

        {loading && <h1>Loading</h1>}
        {/* Form */}
        <div className="flex flex-col gap-3">
          {/* Not editable */}
          <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
            <div className="flex justify-between items-center px-2">
              <div className="text-sm font-medium flex items-center">
                Scholarship Infomations
              </div>
              <button
                onClick={() => setIsInformationOpen(!isInformationOpen)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isInformationOpen ? "Hide Details" : "Show Details"}
              </button>
            </div>
            {isInformationOpen && (
              <>
                {/* Date */}
                <div className="flex items-center py-1 px-3">
                  <p className="text-sm text-gray-600">
                    Posted on {scholarship?.datePosted.toLocaleDateString()}
                  </p>
                </div>
                {/* Sponsors */}
                <div className="flex items-center text-sm text-gray-600 px-3">
                  <span className="mr-2">Sponsors:</span>
                  <span className="font-medium">
                    {scholarship?.alumList.length}
                  </span>
                </div>
                <div className="rounded-lg px-1">
                  {alumList.length > 0 && (
                    <div className="px-4 py-2">
                      {alumList.map((alum, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {index + 1}. {alum.firstName} {alum.lastName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Editable Details */}
          <form
            className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4"
            onSubmit={handleEdit}
          >
            <div className="flex flex-col gap-5">
              {/* Scholarship Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium flex items-center"
                >
                  <Asterisk size={16} className="text-red-600" /> Scholarship
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Scholarship name"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  required
                  disabled={!isEditing}
                />
              </div>
              {/* Scholarship Description */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium flex items-center"
                >
                  <Asterisk size={16} className="text-red-600" /> Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Scholarship Description"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  required
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2 text-start">
                <div className="flex gap-3">
                  <div className="text-sm font-medium flex items-center">
                    <Asterisk size={16} className="text-red-600" /> Photo:
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Upload className="size-4" />
                    Upload Gcash QR Code
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={!isEditing}
                  />
                </div>
                {preview && (
                  <div className="mt-2 pl-5">
                    <p className="text-sm font-medium flex items-center">
                      Preview:
                    </p>
                    <img
                      src={preview}
                      alt="Uploaded Preview"
                      style={{ width: "200px", borderRadius: "8px" }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Button */}
            {isEditing && (
              <div className="bg-white rounded-2xl p-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
                >
                  {isSubmitting ? "Processing…" : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      {/* Student Section */}
      <br></br>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Students in this Scholarship
        </h2>
        {loadingStudents ? (
          <p>Loading students...</p>
        ) : students.length > 0 ? (
          <ul className="list-disc pl-6">
            {students.map((student) => (
              <li key={student.studentId} className="text-gray-700">
                <strong>{student.name}</strong> - {student.emailAddress}
              </li>
            ))}
          </ul>
        ) : (
          <p>No students are currently associated with this scholarship.</p>
        )}
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          {!isEditing && (
            <div
              onClick={addStudentRoute}
              className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
            >
              + Add Student
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ScholarshipDetailPage;
