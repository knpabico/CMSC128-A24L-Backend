import React, { useState } from "react";
import { Alumnus } from "@/models/models";
import Image from "next/image";
import { ref,uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
// import {PhotoUpload} from "../../../upload-photo/";
import { uploadImage } from "@/lib/upload";

interface AlumnusUploadPicProps {
    alumnus: Alumnus;
    uploading: boolean;
    onClose: () => void;
  }

//Note: yung uploading ay yung flag if magpapakita ba si modal
const AlumnusUploadPic: React.FC<AlumnusUploadPicProps> = ({ alumnus , uploading , onClose}) => {
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [imgUploading,setImgUploading]= useState(false);
    const [image, setImage ] = useState<File |null > (null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
      const [message, setMessage] = useState("");
      const [isError, setIsError] = useState(false);


    //getting the file (image uploaded)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        console.log(event);
        if (selectedFile) {
          setImage(selectedFile);         
          setFile(selectedFile);
          console.log(selectedFile, "just url" );
          const localPreview = URL.createObjectURL(selectedFile);
          setPreviewUrl(localPreview);
        }
      };
      
    // const handleUpload = async () => {
    //     if (!file) return;
    
    //     setImgUploading(true);
    //     const storageRef = ref(storage, `alumni/${alumnus.alumniId}/${file.name}`);
    
    //     try {
    //         // Upload image to Firebase Storage
    //         await uploadBytes(storageRef, file);
    //         const url = await getDownloadURL(storageRef);
    
    //         // Save URL to Firestore
    //         const alumnusDocRef = doc(db, "alumni", alumnus.alumniId);
    //         await updateDoc(alumnusDocRef, { image: url });

    //     } catch (error) {
    //         console.error("Error uploading or saving image URL:", error);
    //     } finally {
    //         setImgUploading(false);
    //     }
    // };

    const handleUpload = async () => {
      setImgUploading(true); 
    
      if (!file) {
        setMessage("No image selected");
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
        setPreviewUrl(false);
      }
    };

    return (
        <>
          {uploading && (
            <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
              <div className="bg-green-500 w-[500px] h-auto p-8 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4">
                <input type="file" onChange={handleFileChange} />
    
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={300}
                    height={300}
                    layout="responsive"
                  />
                )}
    
                <button onClick={handleUpload} disabled={imgUploading}>
                  {imgUploading ? "Uploading..." : "Upload Image"}
                </button>
    
                {uploadedUrl && (
                  <Image
                    src={uploadedUrl}
                    alt="Uploaded"
                    width={300}
                    height={300}
                    layout="responsive"
                  />
                )}
    
                <button onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </>
      );
    };

export default AlumnusUploadPic;