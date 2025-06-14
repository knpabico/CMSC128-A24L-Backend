"use client";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { AlumProvider } from "@/context/AlumContext";
import { JobOfferProvider } from "@/context/JobOfferContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";
import { EventProvider } from "@/context/EventContext";
import { RsvpProvider } from "@/context/RSVPContext";
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
import { AffiliationProvider } from "@/context/AffiliationContext";
import { FeaturedProvider } from "@/context/FeaturedStoryContext";
import { Inter } from "next/font/google";
import { JobApplicationContextProvider } from "@/context/JobApplicationContext";
import LoadingPage from "@/components/Loading";
import { Suspense } from "react";
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#EAEAEA]">
      <AuthProvider>
        <FeaturedProvider>
          <NewsLetterProvider>
            <DonationDriveProvider>
              <ScholarshipProvider>
                <BookmarkProvider>
                  <JobOfferProvider>
                    <JobApplicationContextProvider>
                      <AnnouncementProvider>
                        <AlumProvider>
                          <WorkExperienceProvider>
                            <EventProvider>
                              <RsvpProvider>
                                <DonationContextProvider>
                                  <GoogleMapsProvider>
                                    <MapProvider>
                                      <EducationProvider>
                                        <AffiliationProvider>
                                          <body className={inter.className}>
                                            <Suspense
                                              fallback={<LoadingPage />}
                                            >
                                              <Navbar />
                                              <div className="">{children}</div>
                                              <Toaster />
                                            </Suspense>
                                          </body>
                                        </AffiliationProvider>
                                      </EducationProvider>
                                    </MapProvider>
                                  </GoogleMapsProvider>
                                </DonationContextProvider>
                              </RsvpProvider>
                            </EventProvider>
                          </WorkExperienceProvider>
                        </AlumProvider>
                      </AnnouncementProvider>
                    </JobApplicationContextProvider>
                  </JobOfferProvider>
                </BookmarkProvider>
              </ScholarshipProvider>
            </DonationDriveProvider>
          </NewsLetterProvider>
        </FeaturedProvider>
      </AuthProvider>
    </html>
  );
}
