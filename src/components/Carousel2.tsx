"use client"
import Image from "next/image"

export default function Carousel2() {
  const images = [
    "https://ics.uplb.edu.ph/wp-content/uploads/2023/08/2023-08-06_Graduating-Class-of-2023-Picture-5-1024x683.jpg",
    "https://ics.uplb.edu.ph/wp-content/uploads/2024/06/palicsihan7-1024x768.jpg",
    "https://ics.uplb.edu.ph/wp-content/uploads/2024/05/FICC2024_REG-1024x768.jpg",
    "https://ics.uplb.edu.ph/wp-content/uploads/2024/06/career_talk_2024-1024x576.jpg",
    "https://ics.uplb.edu.ph/wp-content/uploads/2024/04/2024-03-22_zenith-1024x728.png",
  ]

  // Duplicate images to create seamless loop
  const allImages = [...images, ...images]

  return (
    <div className="w-full overflow-hidden">
      <div className="relative w-full flex justify-center items-center">
        {/* Outer container with hidden overflow */}
        <div className="overflow-hidden" style={{ width: "99vw" }}>
          {/* Scrolling container */}
          <div className="flex animate-scroll repeat-infinite">
            {/* First set of images */}
            {images.map((src, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 h-60 w-100 mx-3 rounded-lg overflow-hidden shadow-lg">
                <div className="relative h-full w-full bg-green-500 flex justify-center items-center">
                  <Image src={src || "/placeholder.svg"} alt={`Slide ${index + 1}`} fill className="object-cover" />
                </div>
              </div>
            ))}

            {/* Duplicate set for seamless looping */}
            {images.map((src, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 h-60 w-100 mx-3 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative h-full w-full bg-green-500 flex justify-center items-center">
                  <Image src={src || "/placeholder.svg"} alt={`Slide ${index + 1}`} fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
