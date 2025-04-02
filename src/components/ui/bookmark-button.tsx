"use client";

import { useState } from "react";
import { useBookmarks } from "@/context/BookmarkContext";
import { toast } from "sonner";

type BookmarkButtonProps = {
  entryId: string;
  type: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

export default function BookmarkButton({ 
  entryId, 
  type, 
  className = "", 
  size = "md",
  showText = false 
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isBookmarkedItem = isBookmarked(entryId);
  
  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const result = await toggleBookmark(entryId, type);
      
      if (result.success) {
        toast.success(isBookmarkedItem ? "Removed from bookmarks" : "Added to bookmarks");
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Size configurations
  const sizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3"
  };
  
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  return (
    <button
      className={`flex items-center gap-1 rounded-md transition-colors ${isBookmarkedItem ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'} ${sizeClasses[size]} ${className}`}
      onClick={handleToggleBookmark}
      disabled={isProcessing}
      aria-label={isBookmarkedItem ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarkedItem ? (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={iconSize[size]} 
            height={iconSize[size]} 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          {showText && <span>Bookmarked</span>}
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={iconSize[size]} 
            height={iconSize[size]} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          {showText && <span>Bookmark</span>}
        </>
      )}
    </button>
  );
}