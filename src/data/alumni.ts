// this file contain querying-helper functions
// for the alumni collection/data

import { serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { getTotalPages } from "./pagination";
import { Alumnus } from "@/models/models";

// data type of the props argument of getAlumni()
export type GetAlumniOptions = {
  filters?: {
    regStatus?: "pending" | "approved" | "rejected";
    // add more filters later
    aStatus?: string | undefined;
    yearGraduated?: string | undefined;
    studentNumber?: string | undefined;
  };
  pagination?: {
    pageSize?: number;
    page?: number;
  };
  sorting?: {
    sort: string | undefined;
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
  const { regStatus, aStatus, yearGraduated, studentNumber } =
    options?.filters || {};

  //get sorting parameter
  //if undefined, sorting is the default type
  const sort = options?.sorting?.sort;

  // start making the query
  // suggestion: dapat separate inputs yung last name at first name
  // get all Alumni documents, sort by alphabetical order
  // of their name (default - first name ascending)
  let alumniQuery = serverFirestoreDB
    .collection("alumni")
    .orderBy("firstName", "asc");

  //sort by sorting params
  if (sort === "d") {
  } else if (sort === "sa") {
    //surname ascending sort
    alumniQuery = serverFirestoreDB
      .collection("alumni")
      .orderBy("lastName", "asc");
  } else if (sort === "sd") {
    //surname descending sort
    alumniQuery = serverFirestoreDB
      .collection("alumni")
      .orderBy("lastName", "desc");
  } else if (sort === "ar") {
    //approved to rejected order (asc sort)
    alumniQuery = serverFirestoreDB
      .collection("alumni")
      .orderBy("regStatus", "asc");
  } else if (sort === "ra") {
    //rejected to approved order (desc sort)
    alumniQuery = serverFirestoreDB
      .collection("alumni")
      .orderBy("regStatus", "desc");
  } else if (sort === "reca") {
    //recently approved (DESC)
    alumniQuery = serverFirestoreDB
      .collection("alumni")
      .orderBy("approvalDate", "desc");
  } else if (sort === "ai") {
    //active to inactive (ASC)
    alumniQuery = serverFirestoreDB
      .collection("alumni")
      .orderBy("activeStatus", "desc");
  } else if (sort === "ia") {
    //inactive to active (DESC)
    alumniQuery = serverFirestoreDB
      .collection("alumni")
      .orderBy("activeStatus", "asc");
  }

  // apply filters, if there is one
  // if there is a status filter, apply it
  if (regStatus) {
    alumniQuery = alumniQuery.where("regStatus", "==", regStatus);
  }

  //active status filter
  if (aStatus) {
    var bool_aStatus = false;
    if (aStatus == "active") {
      bool_aStatus = true;
    }
    alumniQuery = alumniQuery.where("activeStatus", "==", bool_aStatus);
  }

  //year graduated filter
  if (yearGraduated) {
    alumniQuery = alumniQuery.where("graduationYear", "==", yearGraduated);
  }

  //student number filter
  //year graduated filter
  if (studentNumber) {
    alumniQuery = alumniQuery.where("studentNumber", "==", studentNumber);
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
    (doc) =>
      ({
        alumniId: doc.id.toString(),
        ...doc.data(),
      } as Alumnus)
  );

  return { data: alumni, totalPages };
};
