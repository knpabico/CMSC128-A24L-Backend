"use client"
import React from "react";
import { JobOffering } from "@/models/models"; // Assuming the JobOffering model exists
import { useJobOffer } from "@/context/JobOfferContext";
import { useAuth } from "@/context/AuthContext";

const AlumniJobOffers = () => {
    const { getJobOfferByAlumni } = useJobOffer();
    const { user, alumInfo, loading } = useAuth();
    const { jobOffers, isLoading } = useJobOffer();


    if (loading) {
        return <div>Loading job offers...</div>;
    }

    if (!jobOffers) {
        return <div>No job offers found.</div>;
    }


    //list lang din ito
    if (isLoading) {
        return <div>Loading job offers...</div>;
      }
    
      if (jobOffers.length === 0) {
        return <div>No job offers found.</div>;
      }
    
      return (
        <div className="w-full">
          <h1>Your Job Offers</h1>
          {jobOffers.map((jobOffer:JobOffering) => (
            <div key={jobOffer.jobId} className="bg-gray-100 p-4 mb-2">
              <h2>Position: {jobOffer.position}</h2>
              <p>Company: {jobOffer.company}</p>
            </div>
          ))}
        </div>
      );
};

export default AlumniJobOffers;
