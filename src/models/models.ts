// this file contains the type of an Alumni document
import { RegStatus } from "@/types/alumni/regStatus";
import { Timestamp } from "firebase-admin/firestore";


export interface Alumnus {
  alumniId: string;
  regStatus: RegStatus; //accepted, pending, or rejected registration
  activeStatus: boolean; //active or not
  studentNumber: string;
  address: string[];
  email: string;
  name: string;
  age: number;
  birthDate: Date;
  companyName: string;
  jobTitle: string;
  fieldOfWork: string;
  graduationYear: string;
  affiliation: string[];
}

export interface Admin {
  username: string;
  lastLogin: string;
  password: string;
}

export interface Invitation {
  invitationId: string;
  dateSent: Date;
}

export interface Announcement {
  datePosted: Date;
  announcementId: string;
  title: string;
  description: string;
  type: string[];
  userReference: string;
}

export interface Event {
  eventId: string;
  datePosted: Date;
  title: string;
  description: string;
  date: string;
  rsvps: string[];
  status: string;
  creatorId: string;
  creatorName: string;
  creatorType: string;
}

export interface Sponsorship {
  donationDriveId: string;
  datePosted: Date;
  description: string;
  beneficiary: string[];
  campaignName: string;
  status: string;
  totalAmount: number;
}

export interface DonationDrive {
  donationDriveId: string;
  datePosted: Date;
  description: string;
  beneficiary: string[];
  campaignName: string;
  totalAmount: number;
  status: string;
}

export interface DonationDriveSuggestions {
  donationDriveId: string;
  suggestedBy: string;
  datePosted: Date;
  description: string;
  beneficiary: string[];
  campaignName: string;
  status: string;
  totalAmount: number;
}

export interface Donation {
  donationId: string;
  postId: string;
  alumniId: string;
  paymentMethod: string;
  amount: number;
  date: Date;
}

export interface NewsletterItem {
  newsletterId: string;
  category: string[];
  dateSent: Date;
}

export interface RSVP {
  rsvpId: string;
  status: boolean;
  postId: string;
  alumniId: string;
}

export interface JobOffering {
  jobId: string;
  alumniId: string;
  salaryRange: string;
  requiredSkill: string[];
  experienceLevel: string;
  position: string;
  company: string;
  employmentType: string;
  jobDescription: string;
  datePosted: Date;
  jobType: string;
  status: string;
}

export interface Bookmark {
  bookmarkId: string;
  alumniId: string;
  type: string;
  entryId: string;
}
