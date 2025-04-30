"use client";

import React from "react";
import { Bookmark, Donation, JobOffering } from "@/models/models";
import { useBookmarks } from "@/context/BookmarkContext";
import { useDonationContext } from "@/context/DonationContext";
import { useJobOffer } from "@/context/JobOfferContext";
import { useAuth } from "@/context/AuthContext";

const AlumniTabs = () => {
    const { bookmarks } = useBookmarks();
    const { userDonations } = useDonationContext();
    const { user, alumInfo, loading } = useAuth();
    const { jobOffers, isLoading } = useJobOffer();

    return (
        <div className="w-full space-y-6">
            {/* Bookmarks Section */}
            <section>
                <h1 className="text-xl font-bold mb-2">Your Bookmarks</h1>
                {!bookmarks ? (
                    <div>Loading Bookmarks...</div>
                ) : bookmarks.length > 0 ? (
                    bookmarks.map((bookmark: Bookmark, index: number) => (
                        <div key={index} className="bg-gray-100 p-4 mb-2">
                            <p>Entry Id: {bookmark.entryId}</p>
                            <p>Type: {bookmark.type.toString()}</p>
                        </div>
                    ))
                ) : (
                    <div>No bookmarks found.</div>
                )}
            </section>

            {/* Donations Section */}
            <section>
                <h1 className="text-xl font-bold mb-2">Your Donations</h1>
                {!userDonations ? (
                    <div>Loading donations...</div>
                ) : userDonations.length > 0 ? (
                    userDonations.map((donation: Donation) => (
                        <div key={donation.donationId} className="bg-gray-100 p-4 mb-2">
                            <p>Donation Amount: {donation.amount}</p>
                            <p>Date: {donation.date.toString()}</p>
                        </div>
                    ))
                ) : (
                    <div>No donations found.</div>
                )}
            </section>

            {/* Job Offers Section */}
            <section>
                <h1 className="text-xl font-bold mb-2">Your Job Offers</h1>
                {loading || isLoading ? (
                    <div>Loading job offers...</div>
                ) : jobOffers && jobOffers.length > 0 ? (
                    jobOffers.map((jobOffer: JobOffering) => (
                        <div key={jobOffer.jobId} className="bg-gray-100 p-4 mb-2">
                            <h2>Position: {jobOffer.position}</h2>
                            <p>Company: {jobOffer.company}</p>
                        </div>
                    ))
                ) : (
                    <div>No job offers found.</div>
                )}
            </section>
        </div>
    );
};

export default AlumniTabs;
