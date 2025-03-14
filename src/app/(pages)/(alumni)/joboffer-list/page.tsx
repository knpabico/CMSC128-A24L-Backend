"use client";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";

export default function Users() {
  const { jobOffers, isLoading } = useJobOffer();

  return (
    <div>
      <h1>Job Offers</h1>
      {isLoading && <h1>Loading</h1>}
      {jobOffers.map((user: JobOffering, index: any) => (
        <div key={index} className="p-1">
          <h2>{user.company}</h2>
          <h1>{user.employmentType}</h1>
          <h2>{user.experienceLevel}</h2>
          <h2>{user.position}</h2>
          <h2>{user.datePosted}</h2>
        </div>
      ))}
    </div>
  );
}