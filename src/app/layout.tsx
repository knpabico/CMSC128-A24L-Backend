import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { AlumProvider } from "@/context/AlumContext";
import { JobOfferProvider } from "@/context/JobOfferContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";
import { EventProvider } from "@/context/EventContext";
import { DonationDriveProvider } from "@/context/DonationDriveContext";
import { BookmarkProvider } from "@/context/BookmarkContext";
import { Toaster } from "sonner";
import { DonationContextProvider } from "@/context/DonationContext";
import { WorkExperienceProvider } from "@/context/WorkExperienceContext";
import { GoogleMapsProvider } from "@/context/GoogleMapsContext";
import { EducationProvider } from "@/context/EducationContext";
import MapProvider from "@/context/MapContext";
import { ScholarshipProvider } from "@/context/ScholarshipContext";
import { NewsLetterProvider } from "@/context/NewsLetterContext";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <NewsLetterProvider>
          <DonationDriveProvider>
            <ScholarshipProvider>
              <BookmarkProvider>
                <JobOfferProvider>
                  <AnnouncementProvider>
                    <AlumProvider>
                      <WorkExperienceProvider>
                        <EventProvider>
                          <DonationContextProvider>
                            <GoogleMapsProvider>
                              <MapProvider>
                                <EducationProvider>
                                  <body
                                    className={inter.className}
                                  >
                                    <Navbar />
                                    {children}
                                    <Toaster />
                                  </body>
                                </EducationProvider>
                              </MapProvider>
                            </GoogleMapsProvider>
                          </DonationContextProvider>
                        </EventProvider>
                      </WorkExperienceProvider>
                    </AlumProvider>
                  </AnnouncementProvider>
                </JobOfferProvider>
              </BookmarkProvider>
            </ScholarshipProvider>
          </DonationDriveProvider>
        </NewsLetterProvider>
      </AuthProvider>
    </html>
  );
}
