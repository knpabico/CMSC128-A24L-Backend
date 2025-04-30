//EXAMPLE IMPLEMENTATION OF UPLOAD IMAGE FUNCTION

"use client";
import { uploadImage } from "@/lib/upload";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { set } from "zod";
import { CameraIcon } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

//function for uploading to firebase
export const uploadToFirebase = async (image: any, alumniId: string) => {
  try {
    const data = await uploadImage(image, `alumni/${alumniId}`); //ITO YUNG PINAKAFUNCTION NA IUUTILIZE
    // 1st parameter is the actual image, 2nd is yung path sa firebase storage. Bale icustomize niyo na lang ito based sa klase ng image na iuupload niyo.
    // Kapag photo ng alumni, magiging await uploadImage(image, `alumni/${alumniId}`)"
    //Kapag donation drive, magiging await uploadImage(image, `donation_drive/${donationDriveId}`)"
    // Kapag event, magiging await uploadImage(image, `event/${eventId}`)"
    // etc. etc (please take a look sa firebase console).

    //Pero, need pa ng attribute na photoURL (or 'image', depende sa pangalan) sa bawat collection (e.g. alumni, event, etc.) para ma-save sa database. So, iupdate niyo na lang yun sa database after uploading the image.

    //Example: Sa backend niyo, especially sa pagcreate/update ng event, alumni, etc, ganito ang mangyayari:
    // await updateDoc(docRef, { photoURL: data.url });
    //Ang data.url ay URL ng uploaded image which is nirereturn ng uploadImage function.

    if (data.success) {
      // setIsError(false);
      // setMessage("Image uploaded successfully!");
      console.log("Image URL:", data.url); // URL of the uploaded image
      const alumniRef = doc(db, "alumni", alumniId);
      const alumniDoc = await getDoc(alumniRef);

      //set image attribute as the alum photo url
      if (alumniDoc.exists()) {
        await updateDoc(alumniRef, { image: data.url });
      }
    } else {
      // setMessage(data.result);
      // setIsError(true);
      console.log(data.result);
    }
  } catch (error) {
    console.error("Error uploading image:", error);
  }
};

export const AlumPhotoUpload = ({
  imageSetter,
}: {
  imageSetter: (file: File) => void;
}) => {
  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //preview
      imageSetter(file);
    }
  };

  const handleUpload = () => {
    if (!image) {
      setMessage("No image selected");
      setIsError(true);
      return;
    }
  };

  console.log("photoURL:" + user?.photoURL);

  return (
    <div>
      {/* original */}
      {/* <input type="file" accept="image/*" onChange={handleImageChange} />
      <Button onClick={handleUpload}>Upload Photo</Button> */}
      {/* isang icon lang */}
      <label onClick={handleUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        {/* <Button> */}
        <CameraIcon className="w-10 h-10 text-[#0856ba]" />
        {/* </Button> */}
      </label>
      {user && !preview && (
        <div className="mt-4">
          <Image
            src={
              user?.photoURL ??
              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
            }
            alt="Uploaded Preview"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
      )}
      {preview && (
        <div className="mt-4">
          <p>Preview:</p>
          <img
            src={preview}
            alt="Uploaded Preview"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </div>
      )}

      {message && (
        <p className={`mt-2 ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
};
