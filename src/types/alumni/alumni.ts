// this file contains the type of an Alumni document
import { Timestamp } from "firebase-admin/firestore";
import { RegStatus } from "./regStatus";

export type Alumni = {
  id: string,
  address: string[];
  affiliations: string[];
  age: number;
  birthDate: Timestamp;
  companyName: string;
  email: string;
  fieldOfWork: string;
  graduationYear: string;
  jobTitle: string;
  name: string;
  regStatus: RegStatus;
  studentNumber: string;
};