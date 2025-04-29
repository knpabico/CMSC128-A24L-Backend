import React, { useState } from "react";
import { Alumnus } from "@/models/models";
import Image from "next/image";
import { ref,uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

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


    //getting the file (image uploaded)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];         
        if (selectedFile) {
          setFile(selectedFile);
          const localPreview = URL.createObjectURL(selectedFile);
          setPreviewUrl(localPreview);
        }
      };
      
    const handleUpload = async () => {
        if (!file) return;
    
        setImgUploading(true);
        const storageRef = ref(storage, `alumni/${alumnus.alumniId}/${file.name}`);
    
        try {
            // Upload image to Firebase Storage
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
    
            // Save URL to Firestore
            const alumnusDocRef = doc(db, "alumni", alumnus.alumniId);
            await updateDoc(alumnusDocRef, { image: url });

        } catch (error) {
            console.error("Error uploading or saving image URL:", error);
        } finally {
            setImgUploading(false);
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