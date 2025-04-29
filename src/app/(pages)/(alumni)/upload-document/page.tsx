"use client";
import { uploadDocument } from "@/lib/upload";
import { Button } from "@mui/material";
import React, { useState } from "react";

function DocumentUpload() {
  const [document, setDocument] = useState(null);
  const [preview, setPreview] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocument(file);
      setDocumentType(file.type);

      // Only create preview for image files
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!document) {
      setMessage("No document selected");
      setIsError(true);
      return;
    }
    try {
      const data = await uploadDocument(document, "documents/uploads"); //ITO YUNG PINAKAFUNCTION NA IUUTILIZE
      // 1st parameter is the actual document, 2nd is yung path sa firebase storage. Bale icustomize niyo na lang ito based sa klase ng image na iuupload niyo.
      // Kapag proof ng work exp ng alumni, magiging await uploadDocument(document, `alumni/${alumniId}`)"
      //(please take a look sa firebase console).

      //Pero, need pa ng attribute na documentURL or kayo bahala sa name (if ever na wala pa) para ma-save sa database. So, iupdate niyo na lang yun sa database after uploading the document.

      //Example: Sa backend niyo, especially sa pagcreate/update ng work experience:
      // await updateDoc(docRef, { docURL: data.url });
      //Ang data.url ay URL ng uploaded document which is nirereturn ng uploadDocument function.

      if (data.success) {
        setIsError(false);
        setMessage("Document uploaded successfully!");
        console.log("Document URL:", data.url);
      } else {
        setMessage(data.result);
        setIsError(true);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      setMessage("Error uploading document");
      setIsError(true);
    }
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <p className="mb-2">Accepted formats: PDF, DOC, DOCX, and images</p>

      <input
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        onChange={handleDocumentChange}
        className="mb-4"
      />

      {document && (
        <div className="mt-2 mb-4">
          <p className="font-medium">Selected file: {document.name}</p>
          <p>Type: {getDocumentTypeDisplay()}</p>
          <p>Size: {(document.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {preview && (
        <div className="mt-2 mb-4">
          <p>Preview:</p>
          <img
            src={preview}
            alt="Image Preview"
            style={{ width: "200px", borderRadius: "8px" }}
          />
        </div>
      )}

      <Button variant="contained" onClick={handleUpload} disabled={!document}>
        Upload Document
      </Button>

      {message && (
        <p className={`mt-2 ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default DocumentUpload;
