export interface Alumnus {
  status: boolean; //active or not
  studentNumber: string;
  address: string;
  email: string;
  name: string;
  age: string;
  birthDate: string;
  companyName: string;
  jobTitle: string;
  fieldOfWork: string;
  graduationYear: string;
  affiliation: string;
}

export interface Admin {
  lastLogin: string;
  username: string;
  password: string;
}

export interface Announcement {
  datePosted: string;
  announcementId: string;
  type: string;
}

export interface Event {
  postId: string;
  status: boolean;
  dateApproved: string;
  dateSent: string;
  title: string;
  description: string;
  date: string;
}

export interface DonationDrive {
  postId: string;
  status: boolean;
  dateApproved: string;
  dateSent: string;
  description: string;
  beneficiary: string;
  campaignName: string;
  totalAmount: number;
}

export interface Donation {
  donationId: string;
  paymentMethod: string;
  amount: number;
  postId: string;
  alumniEmail: string;
}

export interface NewsletterItem {
  category: string;
  newsletterId: string;
  dateSent: string;
}

export interface RSVP {
  rsvpId: string;
  status: boolean;
  postId: string;
  alumniEmail: string;
}

export interface JobOffering {
  jobId: string;
  alumniEmail: string;
  salaryRange: string;
  requiredSkill: string;
  experienceLevel: string;
  position: string;
  company: string;
  employmentType: string;
  jobDescription: string;
  datePosted: string;
  jobType: string;
}
