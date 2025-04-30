"use client"
import React from "react";
import { Bookmark } from "@/models/models";
import { useBookmarks } from "@/context/BookmarkContext";
import { number } from "zod";

const AlumniBookmarks = () => {
    const { bookmarks } = useBookmarks();
    
    if (!bookmarks) {
        return (
            <div >
                Loading Bookmarks...
            </div>
        );
    }

    return (
        <div className="w-full">
            <h1> Your Bookmarks</h1>
            {bookmarks.length > 0 ? (
                bookmarks.map((bookmark: Bookmark, index:number) => (
                    <div key={index} className="bg-gray-100">
                        <p>Entry Id: {bookmark.entryId}</p>
                        <p>Type: {bookmark.type.toString()}</p>
                    </div>
                ))
            ) : (
                <div>No donations found.</div>
            )}
        </div>
    );
}
export default AlumniBookmarks;