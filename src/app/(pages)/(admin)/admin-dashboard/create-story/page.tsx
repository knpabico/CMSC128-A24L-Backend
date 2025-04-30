"use client";
import { useFeatured } from "@/context/FeaturedStoryContext";
import { uploadImage } from "@/lib/upload";
import { useState } from "react";

export default function FeaturedStoriesPage() {
  const {
    featuredItems,
    isLoading,
    isEdit,
    handleSubmit,
    handleEdit,
    handleDelete,
    text,
    title,
    image,
    type,
    showForm,
    setText,
    setTitle,
    setImage,
    setType,
    setShowForm,
    setIsEdit,
    setCurrentFeaturedId,
  } = useFeatured();

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    message: "",
    isError: false,
    isUploaded: false
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setUploadStatus({
        message: "Image selected, please click Upload Photo",
        isError: false,
        isUploaded: false
      });
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setUploadStatus({
        message: "No image selected",
        isError: true,
        isUploaded: false
      });
      return;
    }

    try {
      // Upload to Firebase based on type - using type as folder path
      const uploadPath = type ? `photos/${type}` : "photos/uploads";
      setUploadStatus({
        message: "Uploading...",
        isError: false,
        isUploaded: false
      });
      
      const data = await uploadImage(imageFile, uploadPath);
      
      if (data.success) {
        // Set the uploaded image URL to the context
        setImage(data.url);
        setUploadStatus({
          message: "Image uploaded successfully!",
          isError: false,
          isUploaded: true
        });
      } else {
        setUploadStatus({
          message: data.result || "Upload failed",
          isError: true,
          isUploaded: false
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        message: "Unexpected error occurred during upload.",
        isError: true,
        isUploaded: false
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Make sure an image is uploaded before submitting
    if (!uploadStatus.isUploaded && !image) {
      setUploadStatus({
        message: "Please upload an image before submitting",
        isError: true,
        isUploaded: false
      });
      return;
    }
    
    if (isEdit) {
      handleEdit(e);
    } else {
      handleSubmit(e);
    }
  };

  const openForm = (isEditMode, item = null) => {
    if (isEditMode && item) {
      setText(item.text);
      setTitle(item.title); // now a string
      setImage(item.image); // now a string
      setType(item.type);
      setCurrentFeaturedId(item.featuredId);
    } else {
      setText("");
      setTitle(""); // empty string
      setImage(""); // empty string
      setType("");
      setCurrentFeaturedId(null);
    }
    setIsEdit(isEditMode);
    setShowForm(true);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">FEATURED STORIES</h1>
      {isLoading && <h1>Loading...</h1>}

      {featuredItems.map((item, index) => (
        <div key={index} className="p-1 flex justify-between items-center border-b pb-2">
          <div>
            <h1 className="font-semibold">{item.text}</h1>
            <h2>{item.datePosted?.toDate?.().toLocaleString?.() || new Date(item.datePosted).toLocaleString()}</h2>
            <h2>Title: {item.title}</h2>
            <h2>Type: {item.type}</h2>
            {item.image > 0 && (
              <img src={item.image} alt="Featured" className="w-20 h-20 object-cover mt-1" />
            )}
          </div>
          <div className="flex gap-4">
            <button
              className="text-blue-500 hover:underline"
              onClick={() => openForm(true, item)}
            >
              Edit
            </button>
            <button
              className="text-red-500 hover:underline"
              onClick={() => handleDelete(item.featuredId)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full"
        onClick={() => openForm(false)}
      >
        +
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w-full max-w-md"
          >
            <h2 className="text-xl mb-4">{isEdit ? "Edit" : "Add"} Featured Story</h2>

            <input
              type="text"
              placeholder="TITLE"
              value={text}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Main Story"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />


            {/* Type Dropdown - Select before uploading image */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            >
              <option value="">Select Type</option>
              <option value="event">Event</option>
              <option value="donation">Donation</option>
              <option value="scholarship">Scholarship</option>
            </select>

            {/* Upload Photo */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Featured Image {uploadStatus.isUploaded && "✓"}
              </label>
              
              {/* Show current image if editing */}
              {isEdit && image  && !preview && (
                <div className="mb-2">
                  <img src={image} alt="Current" className="w-full h-auto max-h-40 object-contain rounded border" />
                  <p className="text-xs text-gray-500 mt-1">Current image</p>
                </div>
              )}
              
              {preview && (
                <div className="mb-2">
                  <img src={preview} alt="Preview" className="w-full h-auto max-h-40 object-contain rounded border" />
                  <p className="text-xs text-gray-500 mt-1">New image preview</p>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="mb-2 block w-full text-sm border border-gray-300 rounded-lg cursor-pointer"
              />
              
              <button
                type="button"
                onClick={handleUpload}
                disabled={!imageFile || !type}
                className={`px-4 py-1 rounded text-sm ${
                  !imageFile || !type
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Upload Photo
              </button>
              
              {!type && imageFile && (
                <p className="text-sm mt-1 text-yellow-600">
                  Select a type before uploading
                </p>
              )}
              
              {uploadStatus.message && (
                <p className={`text-sm mt-1 ${uploadStatus.isError ? "text-red-500" : "text-green-600"}`}>
                  {uploadStatus.message}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded ${
                  (!uploadStatus.isUploaded && !image) 
                    ? "bg-gray-300 text-gray-500"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isEdit ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}