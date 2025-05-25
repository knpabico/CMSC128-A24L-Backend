"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Alumnus } from "@/models/models";
import AlumnusUploadPic from "@/components/AlumnusUploadPic"; // Assuming you'll move the component here

export default function UploadProfilePage() {
  const router = useRouter();
  const params = useParams();
  const alumniId = params.alumniId as string;
  
  const [alumnus, setAlumnus] = useState<Alumnus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(true); // Start with the modal open

  useEffect(() => {
    const fetchAlumnusData = async () => {
      if (!alumniId) return;

      try {
        const alumnusDoc = await getDoc(doc(db, "alumni", alumniId));
        if (alumnusDoc.exists()) {
          setAlumnus({ ...alumnusDoc.data(), alumniId } as Alumnus);
        }
      } catch (error) {
        console.error("Error fetching alumnus data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnusData();
  }, [alumniId]);

  const handleCloseModal = () => {
    setUploading(false);
    router.back(); // Go back to previous page when modal is closed
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <AlumnusUploadPic 
        alumnus={alumnus}
        uploading={uploading}
        onClose={handleCloseModal}
      />
    </div>
  );
}