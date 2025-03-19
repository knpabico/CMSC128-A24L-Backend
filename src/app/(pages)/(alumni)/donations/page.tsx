"use client";

import { useDonationContext } from "@/context/DonationContext";

export default function Donations() {
  const { userDonations, isLoading, error } = useDonationContext();

  return (
    <>
      <h1>User donations:</h1>
      {error && <p>{error}</p>}
      {isLoading && <p>Loading...</p>}
      <div className="flex flex-col gap-10 mt-5">
        {userDonations ? (
          userDonations.map((donation) => (
            <div key={donation.donationId}>
              <p>postId: {donation.postId}</p>
              <p>alumniId: {donation.alumniId}</p>
              <p>amount: {donation.amount}</p>
              <p>paymentMethod: {donation.paymentMethod}</p>
              <p>date: {new Date(donation.date).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>no userDonations</p>
        )}
      </div>
    </>
  );
}
