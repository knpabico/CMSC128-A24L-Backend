"use client";
import { useFeatured } from "@/context/FeaturedStoryContext";
import { uploadImage } from "@/lib/upload";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Trash2, Edit, CirclePlus, Plus } from "lucide-react";

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

  const [activeTab, setActiveTab] = useState("All Stories");
  const tableRef = useRef(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);

  const tabs = ["All Stories", "Events", "Donations", "Scholarships"];

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

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      
      const tableRect = tableRef.current.getBoundingClientRect();
      
      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(tableRect.width);
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSticky]);

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
  
    if (!uploadStatus.isUploaded && !image && !isEdit) {
      setUploadStatus({
        message: "Please upload an image before submitting",
        isError: true,
        isUploaded: false
      });
      return;
    }
    
    // For edit mode, make sure we have either a newly uploaded image or the existing one
    if (!uploadStatus.isUploaded && !image && isEdit) {
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

  // Filter items based on active tab
  const filteredItems = activeTab === "All Stories" 
    ? featuredItems 
    : featuredItems.filter(item => {
        const tabTypeMap = {
          "Events": "event",
          "Donations": "donation",
          "Scholarships": "scholarship"
        };
        return item.type === tabTypeMap[activeTab];
      });

  // Count items for each category
  const getCategoryCount = (category) => {
    if (category === "All Stories") return featuredItems.length;
    
    const categoryTypeMap = {
      "Events": "event",
      "Donations": "donation",
      "Scholarships": "scholarship"
    };
    
    return featuredItems.filter(item => item.type === categoryTypeMap[category]).length;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>
          Manage Featured Stories
        </div>
      </div>
      
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Manage Featured Stories
          </div>
          <div 
            className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600 flex items-center gap-2"
            onClick={() => openForm(false)}
          >
            <CirclePlus size={18}  /> 
            Write featured story
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="w-full flex gap-2">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-white"
              }`}
            >
              {/* Blue bar above active tab */}
              <div
                className={`w-full h-1 transition-colors ${
                  activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-transparent"
                }`}
              ></div>
              <div
                className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                  activeTab === tab
                    ? "text-[var(--primary-blue)] bg-white"
                    : "text-blue-200 bg-white"
                }`}
              >
                {tab} 
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                    activeTab === tab
                      ? "bg-amber-400"
                      : "bg-blue-200"
                  }`}
                >
                  {getCategoryCount(tab)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* {/* Filter Bar */}
        {/* <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Any Date</div>
            <ChevronDown size={20} />
          </div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Type</div>
            <ChevronDown size={20} />
          </div>
        </div> */}

        {/* Table Container with Fixed Height for Scrolling */}
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-xl">Loading...</div>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-gray-300 relative" ref={tableRef}>
              {/* Sticky header */}
              <div 
                className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
                  isSticky ? 'fixed top-0' : ''
                }`}
                style={{ width: isSticky ? headerWidth : '100%' }}
              >
                <div className="w-2/3 flex items-center justify-baseline font-semibold">
                  Featured Story Info
                </div>
                <div className="w-1/3 flex justify-end items-center">
                  <div className="w-1/3 flex items-center justify-center font-semibold">Type</div>
                  <div className="w-1/3 flex items-center justify-center font-semibold">Actions</div>
                </div>
              </div>
              
              {/* Spacer div to prevent content jump when header becomes fixed */}
              {isSticky && <div style={{ height: '56px' }}></div>}

              {/* Featured Stories Rows */}
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className={`w-full flex gap-4 border-t border-gray-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <div className="w-2/3 flex p-4 gap-4">
                      {item.image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt="Featured" 
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="text-base font-bold">{item.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{item.text}</div>
                        <div className="text-xs text-gray-400">
                          {item.datePosted?.toDate?.().toLocaleString?.() || new Date(item.datePosted).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-1/3 flex items-center justify-end p-5">
                      <div className="w-1/3 flex items-center justify-center">
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {item.type}
                        </div>
                      </div>
                      
                      <div className="w-1/3 flex items-center justify-center gap-4">
                        <Edit 
                          size={18} 
                          className="text-blue-500 hover:text-blue-700 cursor-pointer" 
                          onClick={() => openForm(true, item)}
                        />
                        <Trash2 
                          size={18} 
                          className="text-gray-500 hover:text-red-500 cursor-pointer" 
                          onClick={() => handleDelete(item.featuredId)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No featured stories found in this category.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* "Add Featured Story" Button */}
      {/* <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        onClick={() => openForm(false)}
      >
        <Plus size={24} />
      </button> */}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-semibold">
                {isEdit ? "Edit featured story" : "Write Featured Story"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setPreview(null);         // Clear preview
                  setImageFile(null);       // Clear selected file
                  setImage("");             // Optional: reset image if needed
                  setUploadStatus({         // Reset upload status
                    isUploaded: false,
                    isError: false,
                    message: ""
                  });
                }}
                className="text-gray-600 text-xl font-bold hover:text-black"
              >
                ×
              </button>
            </div>

            {/* Title Input (Styled like placeholder) */}
            <input
              type="text"
              placeholder="Title here"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-6 mb-2 pl-1 text-lg font-medium placeholder-gray-400 focus:outline-none"
              required
            />

            {/* Description Input */}
            <textarea
              placeholder="Description here"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full mb-4 text-sm pl-1 placeholder-gray-400 resize-none focus:outline-none"
              rows={5}
              required
            />

            {/* Keep Dropdown */}
            <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full mb-4 text-sm placeholder-gray-400 resize-none focus:outline-none"
            required
          >
            <option value="" disabled hidden>
              Select Type
            </option>
            <option value="event">Event</option>
            <option value="donation">Donation</option>
            <option value="scholarship">Scholarship</option>
          </select>

          <hr className="border-t border-gray-200 my-1.5" />

            {/* Image Upload Block */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium py-2">
                Featured Image {uploadStatus.isUploaded && "✓"}
              </label>

              {/* Stylized Upload Box */}
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-24 h-24 bg-blue-50 text-blue-600 rounded-md border border-dashed border-blue-300 cursor-pointer hover:bg-blue-100"
              >
                <Plus size={24} />
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Preview or Current Image */}
              {(preview || (isEdit && image && !preview)) && (
                <div className="mt-4 p-3 rounded-md border bg-gray-50 shadow-sm">
                  <div className="w-full aspect-video overflow-hidden rounded-md border border-gray-300">
                    <img
                      src={preview || image}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {preview ? "Preview of uploaded image" : "Currently saved image"}
                  </p>
                </div>
              )}


              {/* Upload button and messages */}
              {/* <button
                type="button"
                onClick={handleUpload}
                disabled={!imageFile || !type}
                className={`px-4 py-1 rounded text-sm mt-2 ${
                  !imageFile || !type
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Upload Photo
              </button> */}

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

            {/* Styled Post Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-full mt-4 text-white text-sm font-semibold ${
                !image && !preview
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#0856BA] hover:bg-blue-600"
              }`}
            >
              {isEdit ? "Update" : "Post"}
            </button>
          </form>
        </div>


      )}
    </div>
  );
}