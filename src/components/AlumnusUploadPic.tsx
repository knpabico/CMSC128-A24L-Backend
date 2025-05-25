"use client";

import React, { useState } from "react";
import { Alumnus } from "@/models/models";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { uploadImage } from "@/lib/upload";
import { XIcon } from "lucide-react";

export default function AlumnusUploadPic({
  alumnus,
  uploading,
  onClose,
}: {
  alumnus: Alumnus | null;
  uploading: boolean;
  onClose: () => void;
}) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  //getting the file (image uploaded)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    const selectedFile = event.target.files?.[0];
    console.log(event);
    if (selectedFile) {
      setImage(selectedFile);
      setFile(selectedFile);
      console.log(selectedFile, "just url");
      const localPreview = URL.createObjectURL(selectedFile);
      setPreviewUrl(localPreview);
    }
  };

  const handleUpload = async () => {
    setImgUploading(true);

    if (!file) {
      setMessage("No image selected");
      setIsError(true);
      setImgUploading(false);
      return;
    }

    try {
      const data = await uploadImage(file, `alumni/${alumnus?.alumniId}`);

      if (data.success) {
        setIsError(false);
        setMessage("Image uploaded successfully!");
        setUploadedUrl(data.url);

        // Save to Firestore
        if (alumnus) {
          const alumnusDocRef = doc(db, "alumni", alumnus.alumniId);
          await updateDoc(alumnusDocRef, { image: data.url });
        }
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
      setPreviewUrl(null);
    }
  };

  return (
    <>
      {uploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex flex-col w-full max-w-xl bg-white border-none shadow-2xl rounded-xl p-7 space-y-7">
            <div className="flex items-center justify-between relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="mr-10 w-full bg-[#3675c5] text-white py-2 px-3 rounded-md hover:bg-[#92b2dc] cursor-pointer"
              />
              {uploadedUrl ? (
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="absolute top-0 right-0"
                >
                  <XIcon className="cursor-pointer hover:text-red-500" />
                </button>
              ) : (
                <button onClick={onClose} className="absolute top-0 right-0">
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
                    width={0}
                    height={0}
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
                  disabled={!selectedFile}
                  className={`px-4 py-2 rounded ${selectedFile 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Upload Image
                </button>
              ) : (
                <button
                  onClick={handleUpload}
                  disabled
                  className="w-50 bg-[#92b2dc] text-white py-2 px-3 rounded-full cursor-not-allowed"
                >
                  Uploading...
                </button>
              )}

              {uploadedUrl && <p>Successfully changed photo!</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}