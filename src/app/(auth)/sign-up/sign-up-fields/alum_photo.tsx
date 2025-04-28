//EXAMPLE IMPLEMENTATION OF UPLOAD IMAGE FUNCTION

"use client";
import { uploadImage } from "@/lib/upload";
import { Button } from "@mui/material";
import React, { useState } from "react";
import { set } from "zod";

export const AlumPhotoUpload = ({ form }: { form: any }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //preview
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setMessage("No image selected");
      setIsError(true);
      return;
    }
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
        setIsError(false);
        setMessage("Image uploaded successfully!");
        console.log("Image URL:", data.url); // URL of the uploaded image
      } else {
        setMessage(data.result);
        setIsError(true);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="p-4">
      <input type="file" accept="image/*" onChange={handleImageChange} />
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
      <Button onClick={handleUpload}>Upload Photo</Button>
      {message && (
        <p className={`mt-2 ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
};
