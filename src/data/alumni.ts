// this file contain querying-helper functions
// for the alumni collection/data

import { serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { Alumni } from "@/types/alumni/alumni";
import { getTotalPages } from "./pagination";

// data type of the props argument of getAlumni()
type GetAlumniOptions = {
  filters?: {
    regStatus?: "pending" | "approved" | "rejected";
    // add more filters later
  };
  pagination?: {
    pageSize?: number;
    page?: number;
  };
};

// function for querying Alumni data
// options input is for filtering and pagination
// this query uses Firebase server SDK
export const getAlumni = async (options?: GetAlumniOptions) => {
  // data will be queried per page
  // the data will not be displayed as a whole
  // get the page number of the data to be queried
  // default option is 1, first page of the query result
  // will be shown
  const page = options?.pagination?.page || 1;

  // this defines how many documents//entries there will be per page
  // default value is 10 entries per page
  const pageSize = options?.pagination?.pageSize || 10;

  // destructure the filers property of options object
  // if there is no filters argument, set those variables to null
  const { regStatus } = options?.filters || {};

  // start making the query
  // suggestion: dapat separate inputs yung last name at first name
  // get all Alumni documents, sort by alphabetical order
  // of their name
  let alumniQuery = serverFirestoreDB
    .collection("alumni")
    .orderBy("name", "asc");

  // apply filters, if there is one
  // if there is a status filter, apply it
  if (regStatus) {
    alumniQuery = alumniQuery.where("regStatus", "==", regStatus);
  }

  // calculate the total number of pages
  const totalPages = await getTotalPages(alumniQuery, pageSize);

  // execute the query, get a snapshot fo the collection
  const alumniSnapshot = await alumniQuery
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .get();

  // add the ID of each alumnus document that has just been queried
  const alumni = alumniSnapshot.docs.map(
    doc => (
      {
        id: doc.id,
        ...doc.data(),
    } as Alumni)
  );
  
  return {data: alumni, totalPages};
};
