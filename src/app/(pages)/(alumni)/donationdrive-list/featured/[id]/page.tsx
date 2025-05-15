// pages/stories/[id].tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { MoveLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useFeatured } from "@/context/FeaturedStoryContext"; // make sure this exists
import { Featured } from "@/models/models"; // your featured story model
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";
import { Timestamp } from "firebase/firestore";

const FeaturedDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getFeaturedById } = useFeatured();
  const featuredId = params?.id as string;

  const [story, setStory] = useState<Featured | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { featuredItems } = useFeatured();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter stories by type and exclude the current story
  const eventStories = featuredItems.filter(
    (story: Featured) =>
      story.type === "donation" && story.featuredId !== featuredId
  );

  const sortedStories = [...eventStories].sort((a, b) => {
    const dateA =
      a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted);
    const dateB =
      b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted);
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate the maximum index for carousel
  const maxIndex = Math.max(0, sortedStories.length - 3);

  // Move to the next story
  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Move to the previous story
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Get visible stories based on current index
  const visibleStories = sortedStories.slice(currentIndex, currentIndex + 3);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedById(featuredId);
        if (data) {
          setStory(data);
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load story.");
      } finally {
        setLoading(false);
      }
    };

    if (featuredId) {
      fetchStory();
    }
  }, [featuredId, getFeaturedById]);

  const formatDate = (
    timestamp: Timestamp | string | number | Date | null | undefined
  ): string => {
    try {
      if (!timestamp) return "N/A";

      let date: Date;

      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }

      return isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid Date";
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const breadcrumbItems = [
    { label: "Donation Drives", href: "/donationdrive-list" },
    { label: `${story.title}`, href: "#", active: true },
  ];

  return (
    <div className="px-[20%] pt-10 pb-30 flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="bg-white shadow-md h-full rounded-2xl flex flex-col gap-4 overflow-hidden">
        <div className="w-full h-[50vh] overflow-hidden">
          {story?.image ? (
            <img
              src={story.image}
              alt={story.title}
              className="object-cover w-full h-full bg-center"
            />
          ) : (
            <Image
              src="/default-image.jpg"
              alt={story.title}
              width={800}
              height={400}
              className="object-cover w-full h-full"
            />
          )}
        </div>

        {/* Event Title */}
        <div className="w-full px-8 pt-3 flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <h1 className="text-4xl font-bold">{story?.title}</h1>
          </div>

          <div className="text-[14px] text-gray-500">
            Posted on {formatDate(story?.datePosted)}
          </div>
        </div>

        {/* Event Description */}
        <div className="w-full px-8 pb-8">
          <h1 className="text-sm">{story?.text}</h1>
        </div>
      </div>

      {/* Featured Stories Section - Carousel */}
      <div className="mt-16 md:px-[50px] xl:px-[200px]">
        <h2 className="text-2xl text-center font-bold mb-6 text-gray-800">
          More Featured Stories
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center">
            Loading featured stories...
          </p>
        ) : sortedStories.length === 0 ? (
          <p className="text-gray-500 text-center">
            No featured stories found.
          </p>
        ) : (
          <div className="relative">
            {/* Previous button */}
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-md
							${
                currentIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-70 hover:opacity-100"
              }`}
              aria-label="Previous stories"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Stories grid - always 3 columns on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
              {visibleStories.length === 0 && (
                <div className="col-span-3 text-center text-gray-500">
                  No other stories available at this time.
                </div>
              )}
              {visibleStories.map((story) => (
                <div
                  key={story.featuredId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/donationdrive-list/featured/${story.featuredId}`
                    )
                  }
                >
                  {story.image && (
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${story.image})` }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">
                      {story.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(story.datePosted)}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                      {story.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-md
							${
                currentIndex >= maxIndex
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-70 hover:opacity-100"
              }`}
              aria-label="Next stories"
            >
              <ChevronRight size={24} />
            </button>

            {/* Pagination dots */}
            {sortedStories.length > 3 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 w-2 rounded-full ${
                      idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedDetailPage;
