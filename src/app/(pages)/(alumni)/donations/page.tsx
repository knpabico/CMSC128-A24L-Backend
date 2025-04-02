"use client";

import { useDonationContext } from "@/context/DonationContext";
import { useRouter, useSearchParams } from "next/navigation";

const sortTypes = [
  "MOST RECENT FIRST",
  "OLDEST DONATION FIRST",
  "AMOUNT DONATED (ASC)",
  "AMOUNT DONATED (DESC)",
]; //sort types
const sortValues = ["mrf", "odf", "asc", "desc"]; //sort values (query params)
export default function Donations() {
  const { userDonations, isLoading, error } = useDonationContext();

  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
  const router = useRouter();

  //function for handling change on sort type
  function handleSortChange(sortType: string) {
    let sorting = sortType ? `?sort=${sortType}` : "";

    //will push the parameters to the url
    router.push(`${sorting}`);
  }

  //function for getting the defaultValue for the sort by dropdown using the current query
  function getDefaultSort(): string {
    let defaultSort = "rdf";
    for (let i = 0; i < sortValues.length; i++) {
      if (sortValues[i] === sort) {
        defaultSort = sortValues[i]; //find its index in the sortValues array
        break;
      }
    }
    return defaultSort;
  }

  return (
    <>
      {/*sorting dropdown*/}
      <div>
        <div className="flex">
          <h1>Sort by:</h1>
          <div>
            <select
              id="sort"
              className="outline rounded-xs ml-2"
              defaultValue={getDefaultSort()}
              onChange={(e) => {
                handleSortChange(e.target.value);
              }}
            >
              {sortTypes.map((sortType, index) => (
                <option key={index} value={sortValues[index]}>
                  {sortType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
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
