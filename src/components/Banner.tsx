"use client";

import BannerImage from "../app/images/banner-bg.jpg";
import Image from "next/image";

interface BannerProps {
	title: string;
	description: string;
}

export default function Banner(
	{ title, description }: BannerProps
) {
  return (
    <div className="relative h-80 w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BannerImage}
          alt="Banner"
          fill
          className="object-cover object-bottom"
          style={{ objectPosition: '0 40%' }}
        />
        <div className="absolute inset-0 bg-[var(--primary-blue)]/70"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative h-full container mx-auto px-[10%]">
        <div className="flex flex-col justify-center h-full max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-white text-base md:text-md font-light max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// [var(--primary-blue)]