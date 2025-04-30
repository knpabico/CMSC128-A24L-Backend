"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Donation } from "@/models/models";
import { useDonationContext } from "@/context/DonationContext";


const RecordOfDonations = ({
  open,
  onClose,
  userId,
  setSuccess,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  setSuccess: (success: boolean) => void;
}) => {


  const { userDonations } = useDonationContext();

  if (!userDonations) {
    return (
        <div >
            Loading donations...
        </div>
    );
}
      return (
          <div className="w-full">
              <h1> Your Donations</h1>
              {userDonations.length > 0 ? (
                  userDonations.map((donation: Donation) => (
                      <div key={donation.donationId} className="bg-gray-100">
                          <p>Donation Amount: {donation.amount}</p>
                          <p>Date: {donation.date.toString()}</p>
                      </div>
                  ))
              ) : (
                  <div>No donations found.</div>
              )}
          </div>
      );
};

export default RecordOfDonations;
