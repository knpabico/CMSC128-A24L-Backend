// this file contains the type of an Alumni document
import { RegStatus } from "@/types/alumni/regStatus";
import { Timestamp } from "firebase-admin/firestore";

export interface Alumnus {
  alumniId: string;
  regStatus: RegStatus; //accepted, pending, or rejected registration
  approvalDate: Date;
  activeStatus: boolean; //active or not
  studentNumber: string;
  address: string[];
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  age: number;
  birthDate: Date;
  affiliation: string[];
  image: string;
  // educationList: Education[];
}

export interface Education {
  educationId: string;
  alumniId: string;
  university: string;
  type: string;
  yearGraduated: string;
  major: string;
}

export interface Career {
  careerId: string;
  alumniId: string;
  company: string;
  jobTitle: string;
  startYear: Date;
  endYear: Date;
  industry: string;
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
  image: string;
  isPublic: boolean;
}

export interface Scholarship {
  scholarshipId: string;
  title: string;
  description: string;
  alumList: string[];
  datePosted: Date;
  image: string;
}

export interface Event {
  eventId: string;
  datePosted: Date;
  title: string;
  description: string;
  date: string;
  rsvps: string[];
  status: string;
  inviteType: string;
  creatorId: string;
  creatorName: string;
  creatorType: string;
  time: string;
  location: string;
  image: string;
  numofAttendees: number;
  targetGuests: String[];
  stillAccepting: boolean;
  needSponsorship: boolean;
  donationDriveId: string;
}

export interface Sponsorship {
  sponsorshipId: string;
  campaignName: string;
  creatorId: string;
  creatorName: string;
  creatorType: string;
  currentAmount: number;
  dateSuggested: Date;
  description: string;
  endDate: Date;
  isAcceptingtrue: boolean;
  eventId: string;
  startDate: Date;
  status: string;
  targetAmount: number;
}

export interface DonationDrive {
  donationDriveId: string;
  creatorId: string;
  creatorType: string;
  datePosted: Date;
  campaignName: string;
  description: string;
  beneficiary: string[];
  currentAmount: number;
  targetAmount: number;
  status: string;
  isEvent: boolean;
  eventId: string;
  startDate: Date;
  endDate: Date;
  donorList: string[];
}

export interface Donation {
  donationDriveId: string;
  donationId: string;
  alumniId: string;
  paymentMethod: string;
  amount: number;
  date: Date;
  isAnonymous: boolean;
  imageProof: string;
}

export interface RSVP {
  rsvpId: string;
  status: string;
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
  image: string;
}

export interface Bookmark {
  bookmarkId: string;
  alumniId: string;
  type: string;
  entryId: string;
  timestamp: Date;
}

export interface WorkExperience {
  workExperienceId: string;
  alumniId: string;
  company: string;
  location: string;
  latitude: number;
  longitude: number;
  details: string;
  startingDate: Timestamp;
  endingDate: Timestamp;
}

export interface NewsletterItem {
  newsletterId: string;
  referenceId: string;
  category: string;
  timestamp: Date;
}

export interface AIQuestion {
  what: string;
  who: string;
  when: string;
  where: string;
}
