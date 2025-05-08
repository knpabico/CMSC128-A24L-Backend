"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { uploadImage } from "@/lib/upload";
import { XIcon } from "lucide-react";
import { Alumnus } from "@/models/models";

// This is the actual page component for the upload profile route
export default function UploadProfilePage() {
  const router = useRouter();
  const params = useParams();
  const alumniId = params.alumniId as string;
  
  const [alumnus, setAlumnus] = useState<Alumnus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Fetch alumnus data on component mount
  useEffect(() => {
    const fetchAlumnus = async () => {
      if (!alumniId) return;
      
      try {
        const alumnusRef = doc(db, "alumni", alumniId);
        const alumnusSnap = await getDoc(alumnusRef);
        
        if (alumnusSnap.exists()) {
          setAlumnus({ 
            alumniId,
            ...alumnusSnap.data() 
          } as Alumnus);
        } else {
          console.error("No alumnus found with this ID");
          router.push("/dashboard"); // Redirect if not found
        }
      } catch (error) {
        console.error("Error fetching alumnus data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumnus();
  }, [alumniId, router]);

  // Handle closing the modal and returning to profile
  const handleClose = () => {
    router.push(`/my-profile/${alumniId}`);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setImage(selectedFile);
      setFile(selectedFile);
      const localPreview = URL.createObjectURL(selectedFile);
      setPreviewUrl(localPreview);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    setImgUploading(true);

    if (!file || !alumnus) {
      setMessage("No image selected or alumnus data not loaded");
      setIsError(true);
      setImgUploading(false);
      return;
    }

    try {
      const data = await uploadImage(file, `alumni/${alumnus.alumniId}`);

      if (data.success) {
        setIsError(false);
        setMessage("Image uploaded successfully!");
        setUploadedUrl(data.url);

        // Save to Firestore
        const alumnusDocRef = doc(db, "alumni", alumnus.alumniId);
        await updateDoc(alumnusDocRef, { image: data.url });

      } else {
        setMessage(data.result);
        setIsError(true);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsError(true);
      setMessage("Upload failed.");
    } finally {
      setImgUploading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0856ba]"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="flex flex-col w-full max-w-xl bg-white border-none shadow-2xl rounded-xl p-7 space-y-7">
        <div className="flex items-center justify-between relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mr-10 w-full bg-[#3675c5] text-white py-2 px-3 rounded-md hover:bg-[#92b2dc] cursor-pointer"
          />
          {uploadedUrl ? (
            <button onClick={() => { window.location.reload(); }} className="absolute top-0 right-0">
              <XIcon className="cursor-pointer hover:text-red-500" />
            </button>
          ) : (
            <button onClick={handleClose} className="absolute top-0 right-0">
              <XIcon className="cursor-pointer hover:text-red-500" />
            </button>
          )}
        </div>
        
        <div className="flex flex-col justify-center items-center space-y-7">
          {previewUrl ? (
            <div className="w-70 h-70">
              <Image
                src={previewUrl}
                alt="Preview"
                width={200}
                height={200}
                sizes="100vw"
                className="object-cover w-full h-full rounded-full"
              />
            </div>
          ) : (
            <div className="w-70 h-70 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              No file chosen
            </div>
          )}

          {!imgUploading ? (
            <button
              onClick={handleUpload}
              className="w-50 bg-[#0856ba] text-white py-2 px-3 rounded-full cursor-pointer hover:bg-[#92b2dc]"
            >
              Upload Image
            </button>
          ) : (
            <button
              disabled
              className="w-50 bg-[#92b2dc] text-white py-2 px-3 rounded-full cursor-not-allowed"
            >
              Uploading...
            </button>
          )}

          {message && (
            <p className={isError ? "text-red-500" : "text-green-500"}>
              {message}
            </p>
          )}

          {uploadedUrl && (
            <p className="text-green-500">Successfully changed photo!</p>
          )}
        </div>
      </div>
    </div>
  );
}