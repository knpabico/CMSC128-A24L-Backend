"use client";
import { uploadDocument } from "@/lib/upload";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { UploadIcon } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const uploadDocToFirebase = async (
  document: any,
  alumniId: string,
  workExperienceId: string
) => {
  try {
    const data = await uploadDocument(document, `alumni/${alumniId}`); //ITO YUNG PINAKAFUNCTION NA IUUTILIZE
    // 1st parameter is the actual document, 2nd is yung path sa firebase storage. Bale icustomize niyo na lang ito based sa klase ng image na iuupload niyo.
    // Kapag proof ng work exp ng alumni, magiging await uploadDocument(document, `alumni/${alumniId}`)"
    //(please take a look sa firebase console).

    //Pero, need pa ng attribute na documentURL or kayo bahala sa name (if ever na wala pa) para ma-save sa database. So, iupdate niyo na lang yun sa database after uploading the document.

    //Example: Sa backend niyo, especially sa pagcreate/update ng work experience:
    // await updateDoc(docRef, { docURL: data.url });
    //Ang data.url ay URL ng uploaded document which is nirereturn ng uploadDocument function.

    if (data.success) {
      //setIsError(false);
      //setMessage("Document uploaded successfully!");
      console.log("Document URL:", data.url);
      const workRef = doc(db, "work_experience", workExperienceId);
      const workDoc = await getDoc(workRef);

      //set image attribute as the alum photo url
      if (workDoc.exists()) {
        await updateDoc(workRef, { proofOfEmployment: data.url });
      }
    } else {
      //setMessage(data.result);
      //setIsError(true);
      console.log(data.result);
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    // setMessage("Error uploading document");
    // setIsError(true);
  }
};

export const AlumDocumentUpload = ({
  index,
  form,
  proofSetter,
}: {
  index: number;
  form: any;
  proofSetter: (file: File) => void;
}) => {
  const [document, setDocument] = useState(null);
  const [preview, setPreview] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [firstClick, setFirstClick] = useState(false);

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocument(file);
      setDocumentType(file.type);
      proofSetter(file);

      // Only create preview for image files
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  useEffect(() => {
    if (!document && firstClick) {
      setMessage("No document selected");
      setIsError(true);
    } else {
      setIsError(false);
      setMessage("");
    }
  }, [document, firstClick]);

  const handleUpload = () => {
    setFirstClick(true);
  };

  const getDocumentTypeDisplay = () => {
    if (!document) return "";

    if (documentType === "application/pdf") return "PDF Document";
    if (documentType === "application/msword") return "Word Document (.doc)";
    if (
      documentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "Word Document (.docx)";
    if (documentType.startsWith("image/")) return "Image";

    return document.name;
  };

  return (
    <div>
      {document && (
        <div className="text-sm bg-gray-300 py-[7.2px] px-2.5 border border-gray-500 w-full text-gray-500 rounded-md">
          <p>Selected file: {document.name}</p>
          <p>Type: {getDocumentTypeDisplay()}</p>
          <p>Size: {(document.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      <label
        className="flex items-center space-x-2 cursor-pointer pt-2"
        onClick={handleUpload}
      >
        <p className="text-[#0856ba]">
          <UploadIcon className="w-4" />
        </p>
        <p className="text-[#0856ba] text-sm hover:underline">
          Upload document
        </p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleDocumentChange}
          className="hidden"
        />
      </label>

      <p className="text-xs font-extralight pt-2">
        Accepted formats: PDF, DOC, DOCX, and images
      </p>

      {preview && (
        <div className="mt-2 mb-4">
          <p className="text-xs font-light">Preview:</p>
          <img
            src={preview}
            alt="Image Preview"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </div>
      )}

      {message && (
        <p
          className={`mt-2 text-sm ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};
