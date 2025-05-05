"use client";

import { useFeatured } from "@/context/FeaturedStoryContext";
import { useRouter } from 'next/navigation';

export default function FeaturedStoryPage() {
  const { featuredItems, isLoading } = useFeatured();
  const router = useRouter();

  const eventStories = featuredItems.filter(story => story.type === "donation");

  const sortedStories = [...eventStories].sort((a, b) => {
    const dateA = a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted);
    const dateB = b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted);
    return dateB.getTime() - dateA.getTime();
  });

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      if (date?.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      }
      return "Invalid date";
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const navigateToDetail = (featuredId: string) => {
    router.push(`/events/featured/${featuredId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Featured Stories</h1>

      {isLoading && <p className="text-gray-500">Loading events...</p>}
      {!isLoading && sortedStories.length === 0 && (
        <p className="text-gray-500">No events found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStories.map((story) => (
          <div
            key={story.featuredId}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            onClick={() => navigateToDetail(story.featuredId)}
          >
            <div className="relative h-48 w-full">
              {story.image ? (
                <img
                  src={story.image}
                  alt={story.title || "Event"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                {story.title || "Untitled Event"}
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                {formatDate(story.datePosted)}
              </p>
              <p className="text-gray-700 line-clamp-3">
                {story.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
