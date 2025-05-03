// this file contains the type of an Alumni document
import { RegStatus } from "@/types/alumni/regStatus";
import { Timestamp } from "firebase-admin/firestore";
import { StringFormat } from "firebase/storage";

export interface Alumnus {
  graduationYear: ReactNode;
  jobTitle: ReactNode;
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
  image: string;
  fieldOfInterest: string[];
  contactPrivacy: boolean;
  lastLogin: Date;
  subscribeToNewsletter: boolean;
}

export interface Affiliation {
  affiliationId: string;
  alumniId: string;
  affiliationName: string;
  yearJoined: string;
  university: string;
}

export interface Education {
  educationId: string;
  alumniId: string;
  university: string;
  type: string;
  yearGraduated: string;
  major: string;
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
  status: string;
}

export interface Event {
  dateCreated(dateCreated: any): import("react").ReactNode;
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
  image: string;
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
  location: string;
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
  industry: string;
  jobTitle: string;
  company: string;
  startYear: string;
  endYear: string; //Present job kapag naka-set as "present"
  location: string;
  latitude: number;
  longitude: number;
  proofOfEmployment: string; //image
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

export interface Featured {
  featuredId: string;
  text: string;
  image: string;
  title: string;
  type: string;
  datePosted: Date;
}
