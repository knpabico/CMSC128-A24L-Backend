// pages/stories/[id].tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { useFeatured } from "@/context/FeaturedStoryContext"; // make sure this exists
import { Featured } from "@/models/models"; // your featured story model

const FeaturedDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getFeaturedById } = useFeatured();
  const featuredId = params?.id as string;

  const [story, setStory] = useState<Featured | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { featuredItems} = useFeatured();

  const eventStories = featuredItems.filter(story => story.type === "scholarship");


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
    <div className="bg-[#F8F8F8] mx-auto px-10 py-8 min-h-screen">
      <div className="text-sm mb-4 inline-flex gap-2 items-center hover:underline hover:cursor-pointer">
        <button onClick={goBack} className="flex items-center gap-2">
          <MoveLeft className="size-[17px]" />
          Back to Stories
        </button>
      </div>

      <div className="flex flex-col gap-[20px] md:px-[50px] xl:px-[200px]">
        <h1 className="text-4xl font-bold text-gray-800">{story?.title}</h1>

        {story?.image && (
          <div
            className="bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px] rounded-md"
            style={{ backgroundImage: `url(${story.image})` }}
          />
        )}

        <p className="mt-5 text-lg">{story?.text}</p>

        <p className="text-sm text-gray-600 mt-10">
          Published:{" "}
          {story?.datePosted instanceof Date
            ? story.datePosted.toLocaleDateString()
            : new Date(story?.datePosted?.seconds * 1000).toLocaleDateString()}
        </p>
      </div>


 
      {/* Featured Stories Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Stories</h2>

        {loading ? (
          <p className="text-gray-500">Loading featured stories...</p>
        ) : sortedStories.length === 0 ? (
          <p className="text-gray-500">No featured stories found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedStories.map((story) => (
              <div
                key={story.featuredId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/scholarship/featured/${story.featuredId}`)}
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
