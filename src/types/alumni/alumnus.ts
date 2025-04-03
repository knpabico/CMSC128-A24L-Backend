export type AlumnusType = {
  // personal information
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  studentNumber: string;
  graduationYear: string;
  currentLocation: string;

  // career information
  employmentStatus: string;	  // employed, self-employed, unemployed, retired, yung purely nag-a-aral like masters di pa considered
  companyName?: string;		    // hide this if self-employed
  jobTitle?: string;
  workField?: string;
  workSetup?: string;		      // onsite, wfh, hybrid, remote
  workLocation?: string;	    // hide rin ata to if self employed
  techStack: string[];
  skills?: string[];
  linkedinLink?: string;
  githubLink?: string;

  // additional information
  affiliations: string[];
  subscribeToNewsletter: boolean;

  alumniId: string;
  regStatus: string;        //accepted, pending, or rejected registration
  approvalDate: Date;
  createdDate: Date;
  activeStatus: boolean;        //active or not
}; 