"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import React from "react";
import Slider from "react-slick";

interface SlideImage {
  url: string
  alt: string
}

export default function Carousel({
  images = [
    { url: "https://ics.uplb.edu.ph/wp-content/uploads/2023/08/2023-08-06_Graduating-Class-of-2023-Picture-5-1024x683.jpg", alt: "Landscape image 1" },
    { url: "https://www.shutterstock.com/image-vector/cute-cat-wear-dino-costume-600nw-2457633459.jpg", alt: "Landscape image 2" },
    { url: "https://www.shutterstock.com/image-vector/cute-cat-wear-dino-costume-600nw-2457633459.jpg", alt: "Landscape image 3" },
    { url: "https://www.shutterstock.com/image-vector/cute-cat-wear-dino-costume-600nw-2457633459.jpg", alt: "Landscape image 4" },
    { url: "https://www.shutterstock.com/image-vector/cute-cat-wear-dino-costume-600nw-2457633459.jpg", alt: "Landscape image 5" },
  ],
  autoplaySpeed = 2000,
  pauseOnHover = true,
}: {
  images?: SlideImage[]
  autoplaySpeed?: number
  pauseOnHover?: boolean
}) {
  const [containerWidth, setContainerWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Handle window resize
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth)
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  // Autoplay functionality
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, autoplaySpeed)

    return () => clearInterval(interval)
  }, [activeIndex, autoplaySpeed, images.length, isPaused])

  // Responsive calculations
  const isMobile = containerWidth < 768
  const itemCount = isMobile ? 3 : 5
  const itemWidth = containerWidth > 0 ? containerWidth / itemCount : 0

  // Base height calculation
  const baseHeight = itemWidth * 0.8

  // Height ratios
  const heightRatios = {
    center: 0.92,
    middle: 1,
    outer: 1.35,
  }

  // Perspective and rotation values
  const transforms = {
    middle: {
      perspective: 500,
      rotation: 15,
    },
    outer: {
      perspective: 200,
      rotation: 15,
    },
  }

  // Get image index with wrapping
  const getImageIndex = (index: number) => {
    const totalImages = images.length
    return (((activeIndex + index) % totalImages) + totalImages) % totalImages
  }

  // Generate items based on screen size
  const generateItems = () => {
    if (isMobile) {
      // Mobile: 3 items
      return [
        {
          type: "outer",
          height: baseHeight * heightRatios.outer,
          transform: `perspective(${transforms.outer.perspective}px) rotateY(${transforms.outer.rotation}deg)`,
          imageIndex: getImageIndex(-1),
          zIndex: 1,
        },
        {
          type: "center",
          height: baseHeight * heightRatios.center,
          transform: "",
          imageIndex: getImageIndex(0),
          zIndex: 3,
        },
        {
          type: "outer",
          height: baseHeight * heightRatios.outer,
          transform: `perspective(${transforms.outer.perspective}px) rotateY(-${transforms.outer.rotation}deg)`,
          imageIndex: getImageIndex(1),
          zIndex: 1,
        },
      ]
    } else {
      // Desktop: 5 items
      return [
        {
          type: "outer",
          height: baseHeight * heightRatios.outer,
          transform: `perspective(${transforms.outer.perspective}px) rotateY(${transforms.outer.rotation}deg)`,
          imageIndex: getImageIndex(-2),
          zIndex: 1,
        },
        {
          type: "middle",
          height: baseHeight * heightRatios.middle,
          transform: `perspective(${transforms.middle.perspective}px) rotateY(${transforms.middle.rotation}deg)`,
          imageIndex: getImageIndex(-1),
          zIndex: 2,
        },
        {
          type: "center",
          height: baseHeight * heightRatios.center,
          transform: "",
          imageIndex: getImageIndex(0),
          zIndex: 3,
        },
        {
          type: "middle",
          height: baseHeight * heightRatios.middle,
          transform: `perspective(${transforms.middle.perspective}px) rotateY(-${transforms.middle.rotation}deg)`,
          imageIndex: getImageIndex(1),
          zIndex: 2,
        },
        {
          type: "outer",
          height: baseHeight * heightRatios.outer,
          transform: `perspective(${transforms.outer.perspective}px) rotateY(-${transforms.outer.rotation}deg)`,
          imageIndex: getImageIndex(2),
          zIndex: 1,
        },
      ]
    }
  }

  const items = generateItems()

  return (
    // <div className="w-full flex justify-center items-center py-12 relative">
    //   <div
    //     className="flex justify-center items-center"
    //     onMouseEnter={() => pauseOnHover && setIsPaused(true)}
    //     onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    //   >
    //     {items.map((item, index) => (
    //       <div
    //         key={index}
    //         className={`${isMobile ? "w-1/3" : "w-1/5"} flex justify-center items-center transform transition-all duration-500 ease-in-out relative`}
    //         style={{
    //           height: `${item.height}px`,
    //           transform: item.transform,
    //           zIndex: item.zIndex,
    //         }}
    //       >
    //         <div className="w-[95%] h-[95%] overflow-hidden rounded-lg shadow-lg">
    //           <Image
    //             src={images[item.imageIndex].url || "/placeholder.svg"}
    //             alt={images[item.imageIndex].alt}
    //             width={500}
    //             height={500}
    //             className="w-full h-full object-cover"
    //             priority={item.type === "center"}
    //           />
    //         </div>
    //       </div>
    //     ))}
    //   </div>

    //   {/* Navigation dots */}
    //   <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 mt-4">
    //     {images.map((_, index) => (
    //       <button
    //         key={index}
    //         className={`w-2 h-2 rounded-full ${index === activeIndex ? "bg-white" : "bg-gray-400"}`}
    //         onClick={() => setActiveIndex(index)}
    //         aria-label={`Go to slide ${index + 1}`}
    //       />
    //     ))}
    //   </div>
    // </div>
    <div>
      <div className="bg-amber-500 h-100 w-screen flex justify-center items-center">
        <div className="bg-green-500 h-50 w-50">

        </div>
      </div>
    </div>
  )
}