// pages/stories/[id].tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { useFeatured } from "@/context/FeaturedStoryContext"; // make sure this exists
import { Featured } from "@/models/models"; // your featured story model
import Breadcrumb from "@/components/breadcrumb";

const FeaturedDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getFeaturedById } = useFeatured();
  const featuredId = params?.id as string;

  const [story, setStory] = useState<Featured | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { featuredItems} = useFeatured();

  const eventStories = featuredItems.filter((story: { type: string; }) => story.type === "event");

  const breadcrumbItems = [
    { label: "Events", href: "/events" },
    { label: `${story?.title}`, href: "#", active: true },
  ]

  const sortedStories = [...eventStories].sort((a, b) => {
    const dateA = a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted);
    const dateB = b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted);
    return dateB.getTime() - dateA.getTime();
  });


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

  const goBack = () => {
    router.back();
  };

  const formatDate = (date: any) => {
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

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

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
            <h1 className="text-4xl font-bold">
              {story?.title}
            </h1>
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

      {/* Featured Stories Section */}
      <div className="mt-10">
        <div className="pt-5 pb-10 flex items-center justify-center text-2xl font-bold">
          Featured Stories
        </div>

        {loading ? (
          <p className="text-gray-500">Loading featured stories...</p>
        ) : sortedStories.length === 0 ? (
          <p className="text-gray-500">No featured stories found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {sortedStories.map((story) => (
              <div
                key={story.featuredId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/events/featured/${story.featuredId}`)}
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
        )}
      </div>

    </div>
  );
};

export default FeaturedDetailPage;
