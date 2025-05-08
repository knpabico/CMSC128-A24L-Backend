//EXAMPLE IMPLEMENTATION OF UPLOAD IMAGE FUNCTION

"use client";
import { uploadImage } from "@/lib/upload";
import { Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { set } from "zod";
import { CameraIcon, Trash2Icon } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { toastSuccess } from "@/components/ui/sonner";

export const resizeGoogleUserImage = (url: string | null | undefined) => {
  return url?.replace(/s\d+-c/, "s400-c") ?? null;
};

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

export const updateAlumPhoto = async (photoURL: string, alumniId: string) => {
  const alumniRef = doc(db, "alumni", alumniId);
  const alumniDoc = await getDoc(alumniRef);

  //set image attribute as the alum photo url
  if (alumniDoc.exists()) {
    const newPhotoURL = resizeGoogleUserImage(photoURL);
    // toastSuccess(newPhotoURL ?? "");
    await updateDoc(alumniRef, { image: newPhotoURL });
  }
};

export const AlumPhotoUpload = ({
  imageSetter,
}: {
  imageSetter: (file: File | null) => void;
}) => {
  const { user, isGoogleSignIn } = useAuth();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [firstClick, setFirstClick] = useState(false);

  //ref for resetting current value of the image input button
  const imageInput = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //preview
      imageSetter(file);
    }
  };

  useEffect(() => {
    if (isGoogleSignIn) {
      setPreview(resizeGoogleUserImage(user!.photoURL!));
    }
  }, [isGoogleSignIn, user]);

  //handle removal of file
  const handleRemoval = () => {
    setImage(null);
    setPreview(null);
    imageSetter(null);
    setFirstClick(false); //reset firstClick
    //reset current value of the image input button before choosing an image
    if (imageInput.current) {
      imageInput.current.value = "";
    }
  };

  useEffect(() => {
    if (!image && firstClick) {
      setMessage("No image selected");
      setIsError(true);
    } else {
      setIsError(false);
      setMessage("");
    }
  }, [image, firstClick]);

  const handleUpload = () => {
    setFirstClick(true);
  };

  console.log("photoURL:" + user?.photoURL);

  return (
    <div>
      <div>
        {preview && !isGoogleSignIn && (
          <button
            className="absolute text-gray-500 cursor-pointer text-red-500"
            onClick={handleRemoval}
            type="button"
          >
            <Trash2Icon className="w-4" />
          </button>
        )}
        <div className="relative w-55 h-55 flex items-center justify-center">
          {preview ? (
            <>
              <Image
                width={0}
                height={0}
                sizes="100vw"
                priority
                src={preview}
                alt="Uploaded Preview"
                className="w-full h-full object-cover"
              />
            </>
          ) : (
            <p
              className={`text-center mt-20 ${
                isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}

          <label
            className="absolute w-12 h-12 flex items-center justify-center"
            onClick={handleUpload}
          >
            <CameraIcon className="w-12 h-12 text-white cursor-pointer" />

            <input
              ref={imageInput}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
