"use client";
import { useFeatured } from "@/context/FeaturedStoryContext";
import { uploadImage } from "@/lib/upload";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Trash2, Edit, CirclePlus, Plus, ArrowLeft, Pencil, Asterisk } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const [viewingStory, setViewingStory] = useState(null);
  const [currentPage, setCurrentPage] = useState("list");
  const [isViewEditing, setIsViewEditing] = useState(false); // For edit mode in view page
  const [isViewSticky, setIsViewSticky] = useState(false); // For sticky buttons in view page
  const viewButtonsRef = useRef(null);
  const viewPlaceholderRef = useRef(null);

  const tabs = ["All Stories", "Events", "Donations", "Scholarships"];
  
  // Set up intersection observer for view page buttons
  useEffect(() => {
    if (!viewPlaceholderRef.current || !isViewEditing) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the buttons container is visible (intersecting), it's not sticky
        // When it's not visible (not intersecting), make it sticky
        setIsViewSticky(!entry.isIntersecting);
      },
      { 
        threshold: 0,
        rootMargin: "0px" // Adjust if needed
      }
    );

    observer.observe(viewPlaceholderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isViewEditing]);

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
    
    // Reset view editing state
    if (isViewEditing) {
      setIsViewEditing(false);
      setIsViewSticky(false);
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

  const viewStory = (item) => {
    setViewingStory(item);
    setCurrentPage("view");
  };

  const editViewedStory = () => {
    if (viewingStory) {
      setText(viewingStory.text);
      setTitle(viewingStory.title);
      setImage(viewingStory.image);
      setType(viewingStory.type);
      setCurrentFeaturedId(viewingStory.featuredId);
      setIsViewEditing(true);
    }
  };

  const handleViewCancelClick = () => {
    setIsViewEditing(false);
    setIsViewSticky(false);
  };

  const goBackToList = () => {
    setCurrentPage("list");
    setViewingStory(null);
    setPreview(null);
    setImageFile(null);
    setIsViewEditing(false);
    setIsViewSticky(false);
    setUploadStatus({
      isUploaded: false,
      isError: false,
      message: "",
    });
  };

  const handleViewEditSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(e);
    setIsViewEditing(false);
    setCurrentPage("list");
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

  // Render view page for a featured story
  const renderViewPage = () => {
    if (!viewingStory) return null;
    
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div>
            Home
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div 
            className="cursor-pointer hover:text-blue-600"
            onClick={goBackToList}
          >
            Manage Featured Stories
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-bold text-[var(--primary-blue)]">
            {viewingStory.title}
          </div>
        </div>
        
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="font-bold text-3xl">
              {viewingStory.title}
            </div>
            {!isViewEditing && (
              <div 
                onClick={editViewedStory}
                className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
              >
                <Pencil size={18} /> Edit Featured Story
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
            <div className="flex flex-col gap-5">
              {/* Title input */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600"/> Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={isViewEditing ? title : viewingStory.title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isViewEditing}
                />
              </div>

              {/* Description textarea */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600"/> Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={isViewEditing ? text : viewingStory.text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!isViewEditing}
                  rows={5}
                />
              </div>

              {/* Story type */}
              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600"/> Type
                </label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={isViewEditing ? type : viewingStory.type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={!isViewEditing}
                >
                  <option value="event">Event</option>
                  <option value="donation">Donation</option>
                  <option value="scholarship">Scholarship</option>
                </select>
              </div>

              {/* Featured image */}
              <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600"/> Featured Image
                </label>
                {isViewEditing ? (
                  <div>
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="image-upload-view"
                        className="flex items-center justify-center w-24 h-24 bg-blue-50 text-blue-600 rounded-md border border-dashed border-blue-300 cursor-pointer hover:bg-blue-100"
                      >
                        <Plus size={24} />
                        <input
                          id="image-upload-view"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      
                      {preview ? (
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="w-24 h-24 object-cover rounded-md border border-gray-300" 
                        />
                      ) : (
                        <img 
                          src={viewingStory.image} 
                          alt="Featured" 
                          className="w-24 h-24 object-cover rounded-md border border-gray-300" 
                        />
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!imageFile}
                      className={`px-4 py-1 rounded text-sm mt-2 ${
                        !imageFile
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      Upload Photo
                    </button>
                    
                    {uploadStatus.message && (
                      <p className={`text-sm mt-1 ${uploadStatus.isError ? "text-red-500" : "text-green-600"}`}>
                        {uploadStatus.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <img 
                      src={viewingStory.image} 
                      alt="Featured" 
                      className="max-w-md object-cover rounded-md border border-gray-300" 
                    />
                  </div>
                )}
              </div>

              {/* Date posted */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Date Posted</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingStory.datePosted?.toDate?.().toLocaleString?.() || new Date(viewingStory.datePosted).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons container for edit mode */}
          {isViewEditing && (
            <div ref={viewPlaceholderRef} className="bg-white rounded-2xl p-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleViewCancelClick}
                className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleViewEditSubmit}
                className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
        
        {/* Fixed buttons container that appears when original is out of view and editing is active */}
        {isViewSticky && isViewEditing && (
          <div className="bg-[var(--primary-white)] fixed bottom-0 rounded-t-2xl gap-2 p-4 flex justify-end" style={{ width: "calc(96% - 256px)", boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)' }}>
            <button
              type="button"
              onClick={handleViewCancelClick}
              className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleViewEditSubmit}
              className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render list page (original layout)
  const renderListPage = () => {
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
                      <div 
                        className="w-2/3 flex p-4 gap-4 cursor-pointer"
                        onClick={() => viewStory(item)}
                      >
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

                      
                      <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={item.isPublic}
                              onChange={async () => {
                                try {
                                  await updateDoc(doc(db, "featured", item.featuredId), {
                                    isPublic: !item.isPublic,
                                  });
                                  console.log(`isPublic set to ${!item.isPublic} for ${item.featuredId}`);
                                } catch (error) {
                                  console.error("Error updating isPublic:", error);
                                }
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </label>
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
      </div>
    );
  };

  return (
    <>
      {/* Main content conditional rendering based on current page */}
      {currentPage === "list" ? renderListPage() : renderViewPage()}
      
      {/* Form Modal - keep this outside the conditional rendering so it's available for both pages */}
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

            {/* Type Dropdown */}
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
              <button
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
    </>
  );
}