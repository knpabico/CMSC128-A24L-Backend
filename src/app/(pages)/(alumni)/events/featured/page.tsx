"use client";

import { useFeatured } from "@/context/FeaturedStoryContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EventSidebar from "../components/Sidebar";
import Image from "next/image";

export default function FeaturedStoryPage() {
  const { featuredItems, isLoading } = useFeatured();
  const router = useRouter();

  const [sortOption, setSortOption] = useState<string>("newest");

  const eventStories = featuredItems.filter(
    (story: any) => story.type === "event"
  );

  const sortedStories = [...eventStories].sort((a, b) => {
    // Handle different date formats (string date, Date object, or Firestore timestamp)
    const getDateValue = (date: any) => {
      if (!date) return 0; // Default to epoch if date is missing

      // Handle Firestore timestamp object
      if (date?.seconds) {
        return new Date(date.seconds * 1000).getTime();
      }

      // Handle Date object
      if (date instanceof Date) {
        return date.getTime();
      }

      // Handle string date
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
    };

    const dateA = getDateValue(a.datePosted);
    const dateB = getDateValue(b.datePosted);

    if (sortOption === "newest") {
      return dateB - dateA;
    } else if (sortOption === "oldest") {
      return dateA - dateB;
    }
    return 0;
  });

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";

    // Handle Firestore timestamp
    if (date?.toDate && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Handle regular date object or date string
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const navigateToDetail = (featuredId: string) => {
    router.push(`/events/featured/${featuredId}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="bg-[#EAEAEA]">
      {/* Page Title */}
      <div
        className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50"
        style={{ backgroundImage: 'url("/ICS2.jpg")' }}
      >
        <div className="absolute inset-0 bg-blue-500/50" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold my-2 text-white">Events</h1>
          <p className="text-white text-sm md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            porta, ligula non sagittis tempus, risus erat aliquam mi, nec
            vulputate dolor nunc et eros. Fusce fringilla, neque et ornare
            eleifend, enim turpis maximus quam, vitae luctus dui sapien in
            ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam
            hendrerit eget.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[50px] xl:mx-[200px] static">
        {/* Sidebar */}
        <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7">
          <EventSidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-[10px] w-full mb-10">
          {/* Sorting Controls */}
          <div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center shadow-md border border-gray-200">
            <h2 className="text-md lg:text-lg font-semibold">
              Featured Stories
            </h2>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="text-gray-600 flex items-center text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
              <p className="text-gray-500">Loading events...</p>
            </div>
          ) : sortedStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {sortedStories.map((story) => (
                <div
                  key={story.featuredId}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigateToDetail(story.featuredId)}
                >
                  <div className="relative h-48 w-full">
                    {story.image ? (
                      <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        priority
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
                    <p className="text-gray-700 line-clamp-3">{story.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
              <h3 className="text-xl font-medium text-gray-600">
                No featured event stories found
              </h3>
              <p className="text-gray-500 mt-2">
                Check back later for more updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
