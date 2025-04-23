"use client";

import React, { useState, useEffect } from 'react';
// import { format } from 'date-fns';
import { useScholarship, Scholarship } from '@/context/ScholarshipContext';
import BookmarkButton from "@/components/ui/bookmark-button";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { useAuth } from '@/context/AuthContext';

const ScholarshipPage: React.FC = () => {
  const { scholarships, loading, error } = useScholarship();
  const { user } = useAuth(); // Assuming you have an auth context

  // Local state for filtering and sorting
  const [filterType, setFilterType] = useState<'all' | 'bookmarked'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);

  // Fetch user's bookmarked scholarships
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user?.uid) {
        setBookmarkedIds([]);
        return;
      }

      try {
        const bookmarksRef = collection(db, 'bookmarks');
        const q = query(
          bookmarksRef, 
          where('userId', '==', user.uid),
          where('type', '==', 'scholarship')
        );
        const querySnapshot = await getDocs(q);
        
        const bookmarkedScholarshipIds = querySnapshot.docs.map(doc => doc.data().entryId);
        setBookmarkedIds(bookmarkedScholarshipIds);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      }
    };

    fetchBookmarks();
  }, [user]);

  // Apply filtering and sorting to scholarships
  useEffect(() => {
    if (!scholarships) return;

    let result = [...scholarships];

    // Apply filter
    if (filterType === 'bookmarked') {
      result = result.filter(scholarship => 
        bookmarkedIds.includes(scholarship.scholarshipId)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      if (sortOrder === 'latest') {
        return b.datePosted.getTime() - a.datePosted.getTime();
      } else {
        return a.datePosted.getTime() - b.datePosted.getTime();
      }
    });

    setFilteredScholarships(result);
  }, [scholarships, filterType, sortOrder, bookmarkedIds]);

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Scholarships</h1>
      
      {/* Filters and sorting */}
      <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${filterType === 'bookmarked' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilterType('bookmarked')}
          >
            Bookmarked
          </button>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg ${sortOrder === 'latest' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSortOrder('latest')}
          >
            Latest First
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${sortOrder === 'oldest' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSortOrder('oldest')}
          >
            Oldest First
          </button>
        </div>
      </div>
      
      {/* Scholarships List */}
      {filteredScholarships.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filterType === 'bookmarked' 
            ? "You haven't bookmarked any scholarships yet." 
            : "No scholarships available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <div key={scholarship.scholarshipId} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{scholarship.title}</h2>
                  <BookmarkButton 
                    entryId={scholarship.scholarshipId}  
                    type="scholarship" 
                    size="lg"
                  />
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  Posted on {scholarship.datePosted.toLocaleString()}
                </p>
                
                <p className="text-gray-700 mb-4">
                  {scholarship.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-600 mt-4">
                  <span className="mr-2">Recipients:</span>
                  <span className="font-medium">{scholarship.alumList.length}</span>
                </div>
                
                {scholarship.alumList.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Alumni Recipients</h3>
                    <div className="flex flex-wrap gap-1">
                      {scholarship.alumList.map((alumId, index) => (
                        <span key={alumId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Recipient {index + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScholarshipPage;