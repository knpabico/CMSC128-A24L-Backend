import {
  addDoc,
  collection,
  QueryDocumentSnapshot,
  DocumentData,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import { FirebaseError } from "firebase/app";
import {
  Alumnus,
  Announcement,
  DonationDrive,
  Event,
  JobApplication,
  JobOffering,
  Scholarship,
} from "@/models/models";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

export async function sendEmailTemplate(
  alumniEmail: string,
  alumniName: string,
  isApproved: boolean
) {
  try {
    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: "ICS-ARMS Registration Status Update",
        text: isApproved
          ? `Dear ${alumniName},\n\nYour registration status is now approved.\n\nYou can now log in to the website. \n\nThank you!`
          : `Dear ${alumniName}.\n\n We regret to inform you that your registration status has been rejected.\n\nThank you!`,
        html: `<!DOCTYPE html>
                <html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <head>
                    <meta charset="UTF-8" />
                    <title>ICS-ARMS Registration Update</title>
                </head>
                <body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #004aad;">ICS-ARMS</h2>
                    </div>
                    <p>Dear ${alumniName},</p>
                        
                    ${
                      isApproved
                        ? `<p>Congratulations! Your registration status has been <strong style="color: green;">approved</strong>.</p>
                    <p>You can now log in to the website and explore the platform.</p>
                    <div style="margin: 30px 0; text-align: center;">
                    <a href="https://your-website-link.com/login" style="background-color: #004aad; color: #ffffff; padding: 12px 14px; text-decoration: none; border-radius: 5px; display: inline-block;">Log in Now</a>
                    </div>
                    `
                        : `
                    <p>We regret to inform you that your registration status has been <strong style="color: red;">rejected</strong>.</p>
                    <p>If you believe this was a mistake, feel free to contact our support team.</p>
                    <div style="text-align: center; margin: 20px 0;">
                    <a href="mailto:cmsc128a24l@gmail.com?subject=Registration%20Appeal%20Request" style="background-color: #e60000; color: #ffffff; padding: 12px 14px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Contact Us
                    </a>
                </div>
                    `
                    }

                    <p style="font-size: 0.9em; color: #555;">If you did not register, you may ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 0.8em; color: #999; text-align: center;">
                    © 2025 ICS-ARMS | University of the Philippines Los Baños<br />
                    All rights reserved. <br />
                    </p>
                </body>
                </html>`,
      },
    });
    return {
      success: true,
      message: `Alumni ${
        isApproved ? "approved" : "rejected"
      } and corresponding email sent successfully!`,
    };
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendVerificationCode(code: string, alumniEmail: string) {
  try {
    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: "ICS-ARMS - Verification Code",
        text: "Dear user, your verification code is ...",
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Verify your email address</title>
  <style type="text/css" rel="stylesheet" media="all">
    /* Base ------------------------------ */
    body {
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      width: 100% !important;
      height: 100%;
      margin: 0;
      line-height: 1.4;
      background-color: #F5F7F9;
      color: #333333;
      -webkit-text-size-adjust: none;
    }
    
    a {
      color: #3869D4;
    }
    
    /* Layout ------------------------------ */
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #F5F7F9;
    }
    
    .email-content {
      width: 100%;
      margin: 0;
      padding: 0;
    }
    
    /* Masthead ----------------------- */
    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }
    
    .email-masthead_logo {
      max-width: 400px;
      border: 0;
    }
    
    .email-masthead_name {
      font-size: 16px;
      font-weight: bold;
      color: #2F3133;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }
    
    .email-logo {
      max-height: 50px;
    }
    
    /* Body ------------------------------ */
    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
      border-top: 1px solid #EDEFF2;
      border-bottom: 1px solid #EDEFF2;
      background-color: #FFF;
    }
    
    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
    }
    
    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      text-align: center;
    }
    
    .email-footer p {
      color: #839197;
    }
    
    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      text-align: center;
    }
    
    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #EDEFF2;
    }
    
    .content-cell {
      padding: 35px;
    }
    
    .align-right {
      text-align: right;
    }
    
    /* Type ------------------------------ */
    h1 {
      margin-top: 0;
      color: #2F3133;
      font-size: 19px;
      font-weight: bold;
    }
    
    h2 {
      margin-top: 0;
      color: #2F3133;
      font-size: 16px;
      font-weight: bold;
    }
    
    h3 {
      margin-top: 0;
      color: #2F3133;
      font-size: 14px;
      font-weight: bold;
    }
    
    p {
      margin-top: 0;
      color: #333333;
      font-size: 16px;
      line-height: 1.5em;
    }
    
    p.sub {
      font-size: 12px;
    }
    
    p.center {
      text-align: center;
    }
    
    /* Buttons ------------------------------ */
    .button {
      display: inline-block;
      width: 200px;
      background-color: #414141;
      border-radius: 3px;
      color: #ffffff;
      font-size: 15px;
      line-height: 45px;
      text-align: center;
      text-decoration: none;
      -webkit-text-size-adjust: none;
    }
    
    .button--blue {
      background-color: #3869D4;
    }
    
    .button--green {
      background-color: #22BC66;
    }
    
    .button--red {
      background-color: #dc4d2f;
    }
    
    .verification-code {
      display: inline-block;
      padding: 15px 25px;
      font-family: monospace;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      background-color: #f0f0f0;
      border-radius: 4px;
      margin: 20px 0;
    }
    
    .motto {
      font-style: italic;
      color: #666;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="email-content" width="100%" cellpadding="0" cellspacing="0">
          <!-- Logo -->
          <tr>
            <td class="email-masthead">
              <a class="email-masthead_name">ICS ARMS</a>
              <p class="motto">Extending Our Reach, Embracing Our Legacy</p>
            </td>
          </tr>
          <!-- Email Body -->
          <tr>
            <td class="email-body" width="100%">
              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">
                <!-- Body content -->
                <tr>
                  <td class="content-cell">
                    <h1>Verify Your Email Address</h1>
                    <p>Thank you for registering with ICS ARMS. Please use the verification code below to complete your registration.</p>
                    <!-- Verification Code -->
                    <div class="body-action">
                      <div class="verification-code">${code}</div>
                    </p>
                    <p>This code will expire in 5 minutes. If you did not request this verification, please disregard this email.</p>
                    <p>For security reasons, this is an automated message. Please do not reply to this email.</p>
                    <p>Thank you,<br>The ICS ARMS Team</p>
                    <!-- Sub copy -->
                    <table class="body-sub">
                      <tr>
                        <td>
                          <p class="sub">If you're having trouble with the verification code, please contact our support team.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-cell">
                    <p class="sub center">
                      ICS ARMS
                      <br>© 2025 ICS ARMS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      },
    });
    return {
      success: true,
      message: `Verification sent successfully!`,
    };
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForNewsletterDonationDrive(
  donationDrive: DonationDrive,
  alumniEmail: string
) {
  try {
    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: donationDrive.campaignName,
        text: donationDrive.description,
        html: `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${donationDrive.campaignName} - ICS-ARMS Donation Drive</title>
</head>
<body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #004aad;">ICS-ARMS DONATION DRIVE</h2>
    </div>
    
    <img src="${
      donationDrive.image
    }" alt="Donation Drive Image" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />
    
    <h3 style="color: #333; font-size: 24px; margin-bottom: 15px;">${
      donationDrive.campaignName
    }</h3>
    
    <div style="background-color: #f7f9fc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Beneficiary:</strong> ${donationDrive.beneficiary.join(
          ", "
        )}</p>
        <p style="margin: 5px 0;"><strong>Campaign Period:</strong> ${formatDate(
          donationDrive.startDate
        )} - ${donationDrive.endDate}</p>
        ${
          donationDrive.isEvent
            ? `<p style="margin: 5px 0;"><strong>For Event:</strong> This donation drive supports an ICS-ARMS event</p>`
            : ""
        }
    </div>
    
    <div style="margin-bottom: 25px;">
        <h4 style="color: #004aad; margin-bottom: 10px;">About This Campaign</h4>
        <p style="line-height: 1.6;">${donationDrive.description}</p>
    </div>
    
    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
        <h4 style="margin-top: 0; color: #2e7d32;">Progress</h4>
        <div style="background-color: #e0e0e0; height: 25px; border-radius: 12px; overflow: hidden; margin: 15px 0;">
            <div style="background-color: #4caf50; height: 100%; width: ${Math.min(
              Math.round(
                (donationDrive.currentAmount / donationDrive.targetAmount) * 100
              ),
              100
            )}%; border-radius: 12px;"></div>
        </div>
        <p><strong>₱${donationDrive.currentAmount.toLocaleString()}</strong> raised of <strong>₱${donationDrive.targetAmount.toLocaleString()}</strong> goal (${Math.round(
          (donationDrive.currentAmount / donationDrive.targetAmount) * 100
        )}%)</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h4 style="color: #004aad; margin-bottom: 10px;">How to Donate</h4>
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
            ${
              donationDrive.qrGcash
                ? `
            <div style="text-align: center;">
                <p><strong>GCash</strong></p>
                <img src="${donationDrive.qrGcash}" alt="GCash QR Code" style="width: 150px; height: 150px;" />
            </div>
            `
                : ""
            }
            ${
              donationDrive.qrPaymaya
                ? `
            <div style="text-align: center;">
                <p><strong>PayMaya</strong></p>
                <img src="${donationDrive.qrPaymaya}" alt="PayMaya QR Code" style="width: 150px; height: 150px;" />
            </div>
            `
                : ""
            }
        </div>
    </div>
    
    <div style="margin: 30px 0; text-align: center;">
        <a href="https://ics-arms.up.edu.ph/donations/${
          donationDrive.donationDriveId
        }" style="background-color: #004aad; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Donate Now</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 0.8em; color: #999; text-align: center;">
        © 2025 ICS-ARMS | University of the Philippines Los Baños<br />
        All rights reserved.<br />
        To unsubscribe from these emails, please visit your <a href="https://ics-arms.up.edu.ph/profile" style="color: #004aad;">account settings</a>.
    </p>
</body>
</html>
    `,
      },
    });
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForNewsletterScholarship(
  scholarship: Scholarship,
  alumniEmail: string
) {
  try {
    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: scholarship.title,
        text: scholarship.description,
        html: `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${scholarship.title} - ICS-ARMS Scholarship</title>
</head>
<body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #004aad;">ICS-ARMS SCHOLARSHIP OPPORTUNITY</h2>
    </div>
    
    ${
      scholarship.image
        ? `<img src="${scholarship.image}" alt="Scholarship Image" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />`
        : ""
    }
    
    <h3 style="color: #333; font-size: 24px; margin-bottom: 15px;">${
      scholarship.title
    }</h3>
    
    <div style="background-color: #f7f9fc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Date Posted:</strong> ${formatDate(
          scholarship.datePosted
        )}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> ${
          scholarship.status
        }</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h4 style="color: #004aad; margin-bottom: 10px;">Scholarship Details</h4>
        <p style="line-height: 1.6;">${scholarship.description}</p>
    </div>
    
    <div style="margin: 30px 0; text-align: center;">
        <a href="https://ics-arms.up.edu.ph/scholarships/${
          scholarship.scholarshipId
        }" style="background-color: #004aad; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Learn More</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 0.8em; color: #999; text-align: center;">
        © 2025 ICS-ARMS | University of the Philippines Los Baños<br />
        All rights reserved.<br />
        To unsubscribe from these emails, please visit your <a href="https://ics-arms.up.edu.ph/profile" style="color: #004aad;">account settings</a>.
    </p>
</body>
</html>`,
      },
    });
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForJobApplicationStatus(
  alumni: Alumnus,
  jobOffer: JobOffering,
  status: string
) {
  console.log(
    `Sent ${status} email to ${alumni.email} for the ${jobOffer.position} position at ${jobOffer.company}`
  );
  try {
    await addDoc(collection(db, "mail"), {
      to: alumni.email,
      message: {
        subject: "Job Application Status",
        text: status,
        html: `
        <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .content {
              padding: 20px;
              background-color: #ffffff;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .status-accepted {
              color: #28a745;
              font-weight: bold;
            }
            .status-rejected {
              color: #dc3545;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 0.9em;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>ICS ARMS Job Application Status Update</h2>
          </div>
          <div class="content">
            <p>Dear ${alumni.firstName} ${alumni.lastName},</p>
            ${
              status.toLowerCase() === "accepted"
                ? `
                <p>We are pleased to inform you that your application for the position of <strong>${jobOffer.position}</strong> at <strong>${jobOffer.company}</strong> has been <span class="status-accepted">ACCEPTED</span>!</p>
                <p>This is a great opportunity to start your professional journey. We believe you will be a valuable addition to the team.</p>
                <p>Please expect further communication regarding the next steps in the hiring process.</p>
                `
                : `
                <p>We regret to inform you that your application for the position of <strong>${jobOffer.position}</strong> at <strong>${jobOffer.company}</strong> has been <span class="status-rejected">REJECTED</span>.</p>
                <p>We appreciate your interest in the position and encourage you to apply for other opportunities that match your skills and experience.</p>
                <p>We wish you the best in your job search and future endeavors.</p>
                `
            }
            <p>Best regards,<br>ICS ARMS Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
        `,
      },
    });
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForNewsletterJobApplication(
  jobApplication: JobOffering,
  alumni: Alumnus,
  hiringManager: string
) {
  try {
    await addDoc(collection(db, "mail"), {
      to: hiringManager,
      message: {
        subject:
          "New Application for " +
          jobApplication.position +
          " at " +
          jobApplication.company,
        text: jobApplication.jobDescription,
        html: `
        <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Application Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #0066cc;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #ffffff;
      padding: 20px;
      border-left: 1px solid #dddddd;
      border-right: 1px solid #dddddd;
    }
    .job-details {
      background-color: #f9f9f9;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      border-left: 4px solid #0066cc;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      border-radius: 0 0 5px 5px;
      border: 1px solid #dddddd;
    }
    .button {
      display: inline-block;
      background-color: #0066cc;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 15px;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .highlight {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Job Application</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You have received a new application for the <span class="highlight">${
        jobApplication.position
      }</span> position at <span class="highlight">${
          jobApplication.company
        }</span>.</p>
      
      <div class="job-details">
        <h2>Applicant Details</h2>
        <p><strong>Name:</strong> ${alumni.firstName} ${alumni.lastName}</p>
        <p><strong>Email:</strong> ${alumni.email}</p>
        <p><strong>Age:</strong> ${alumni.age}</p>
        <p><strong>Location:</strong> ${alumni.address || "Not specified"}</p>
        <p><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      
      <p>Please review this application at your earliest convenience.</p>
      <p>Thank you,<br>ICS-ARMS Team</p>
    </div>
    <div class="footer">
      <p>This is an automated notification. Please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} Alumni Network - All rights reserved</p>
    </div>
  </div>
</body>
</html>
        `,
      },
    });
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForNewsletterJobOffer(
  jobOffer: JobOffering,
  alumniEmail: string
) {
  try {
    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: jobOffer.position + " at " + jobOffer.company,
        text: jobOffer.jobDescription,
        html: `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${jobOffer.position} at ${
          jobOffer.company
        } - ICS-ARMS Job Opportunity</title>
</head>
<body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #004aad;">ICS-ARMS JOB OPPORTUNITY</h2>
    </div>
    
    ${
      jobOffer.image
        ? `<img src="${jobOffer.image}" alt="Company Logo" style="max-width: 250px; height: auto; margin: 0 auto 20px; display: block;" />`
        : ""
    }
    
    <h3 style="color: #333; font-size: 24px; margin-bottom: 5px;">${
      jobOffer.position
    }</h3>
    <h4 style="color: #555; font-size: 18px; margin-top: 0; margin-bottom: 20px;">${
      jobOffer.company
    }</h4>
    
    <div style="background-color: #f7f9fc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Location:</strong> ${
          jobOffer.location
        }</p>
        <p style="margin: 5px 0;"><strong>Employment Type:</strong> ${
          jobOffer.employmentType
        }</p>
        <p style="margin: 5px 0;"><strong>Job Type:</strong> ${
          jobOffer.jobType
        }</p>
        <p style="margin: 5px 0;"><strong>Experience Level:</strong> ${
          jobOffer.experienceLevel
        }</p>
        <p style="margin: 5px 0;"><strong>Salary Range:</strong> Php${
          jobOffer.salaryRange
        }</p>
        <p style="margin: 5px 0;"><strong>Date Posted:</strong> ${formatDate(
          jobOffer.datePosted
        )}</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h4 style="color: #004aad; margin-bottom: 10px;">Job Description</h4>
        <p style="line-height: 1.6;">${jobOffer.jobDescription}</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h4 style="color: #004aad; margin-bottom: 10px;">Required Skills</h4>
        <ul style="padding-left: 20px; line-height: 1.6;">
            ${jobOffer.requiredSkill
              .map((skill) => `<li>${skill}</li>`)
              .join("")}
        </ul>
    </div>
    
    <div style="margin: 30px 0; text-align: center;">
        <a href="https://ics-arms.up.edu.ph/jobs/${
          jobOffer.jobId
        }" style="background-color: #004aad; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Apply Now</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 0.8em; color: #999; text-align: center;">
        © 2025 ICS-ARMS | University of the Philippines Los Baños<br />
        All rights reserved.<br />
        To unsubscribe from these emails, please visit your <a href="https://ics-arms.up.edu.ph/profile" style="color: #004aad;">account settings</a>.
    </p>
</body>
</html>`,
      },
    });
    return {
      success: true,
      message: `Newsletter sent successfully!`,
    };
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForNewsletterAnnouncement(
  announcement: Announcement,
  alumniEmail: string
) {
  try {
    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: announcement.title,
        text: announcement.description,
        html: `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${announcement.title} - ICS-ARMS Announcement</title>
</head>
<body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #004aad;">ICS-ARMS ANNOUNCEMENT</h2>
    </div>
    
    ${
      announcement.image
        ? `<img src="${announcement.image}" alt="Announcement Image" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />`
        : ""
    }
    
    <h3 style="color: #333; font-size: 24px; margin-bottom: 15px;">${
      announcement.title
    }</h3>
    
    <div style="background-color: #f7f9fc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Date Posted:</strong> ${formatDate(
          announcement.datePosted
        )}</p>
        <p style="margin: 5px 0;"><strong>Type:</strong> ${announcement.type.join(
          ", "
        )}</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h4 style="color: #004aad; margin-bottom: 10px;">Announcement Details</h4>
        <p style="line-height: 1.6;">${announcement.description}</p>
    </div>
    
    <div style="margin: 30px 0; text-align: center;">
        <a href="https://ics-arms.up.edu.ph/announcements/${
          announcement.announcementId
        }" style="background-color: #004aad; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Read More</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 0.8em; color: #999; text-align: center;">
        © 2025 ICS-ARMS | University of the Philippines Los Baños<br />
        All rights reserved.<br />
        To unsubscribe from these emails, please visit your <a href="https://ics-arms.up.edu.ph/profile" style="color: #004aad;">account settings</a>.
    </p>
</body>
</html>`,
      },
    });
    return {
      success: true,
      message: `Newsletter sent successfully!`,
    };
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForNewsletterEvent(
  event: Event,
  alumniEmail: string
) {
  try {
    const alumRef = query(
      collection(db, "alumni"),
      where("email", "==", alumniEmail)
    );
    const querySnapshot = await getDocs(alumRef);
    const alum = querySnapshot.docs[0].data() as Alumnus;

    if (!event.targetGuests.includes(alum.alumniId)) {
      return {
        success: false,
        message: "Alumni not in target guests",
      };
    }

    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: event.title,
        text: event.description,
        html: `<!DOCTYPE html>
<html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${event.title} - ICS-ARMS Event</title>
</head>
<body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #004aad;">ICS-ARMS ALUMNI EVENT</h2>
    </div>
    
    <img src="${
      event.image
    }" alt="Event Image" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />
    
    <h3 style="color: #333; font-size: 24px; margin-bottom: 15px;">${
      event.title
    }</h3>
    
    <div style="background-color: #f7f9fc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${event.date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${event.time}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${
          event.location
        }</p>
        <p style="margin: 5px 0;"><strong>Organized by:</strong> ${
          event.creatorName
        }</p>
    </div>
    
    <div style="margin-bottom: 25px;">
        <h4 style="color: #004aad; margin-bottom: 10px;">Event Details</h4>
        <p style="line-height: 1.6;">${event.description}</p>
    </div>
    
    ${
      event.needSponsorship
        ? `
    <div style="background-color: #fff8e1; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
        <p style="margin: 5px 0;"><strong>This event is seeking sponsorship!</strong> If you'd like to contribute, please check our donation drive page.</p>
    </div>
    `
        : ""
    }
    
    <div style="margin: 30px 0; text-align: center;">
        ${
          event.stillAccepting
            ? `
        <a href="https://ics-arms.up.edu.ph/events/${event.eventId}" style="background-color: #004aad; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">RSVP Now</a>
        `
            : `
        <p style="color: #666; font-style: italic;">Registration for this event is now closed.</p>
        <a href="https://ics-arms.up.edu.ph/events/${event.eventId}" style="background-color: #004aad; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-top: 10px;">View Event Details</a>
        `
        }
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 0.8em; color: #999; text-align: center;">
        © 2025 ICS-ARMS | University of the Philippines Los Baños<br />
        All rights reserved.<br />
        To unsubscribe from these emails, please visit your <a href="https://ics-arms.up.edu.ph/profile" style="color: #004aad;">account settings</a>.
    </p>
</body>
</html>`,
      },
    });
    return {
      success: true,
      message: `Newsletter sent successfully!`,
    };
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export const emailNewsLettertoAlums = async (
  referenceId: string,
  category: string
) => {
  try {
    const q = query(
      collection(db, "alumni"),
      where("activeStatus", "==", true),
      where("subscribeToNewsletter", "==", true),
      where("regStatus", "==", "approved")
    );
    const querySnapshot = await getDocs(q);

    if (category === "event") {
      const eventDoc = await getDoc(doc(db, "event", referenceId));
      if (!eventDoc.exists()) {
        throw new Error("Event not found");
      }
      const event = eventDoc.data() as Event;
      querySnapshot.docs.map(
        async (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) =>
          await sendEmailTemplateForNewsletterEvent(event, doc.data().email)
      );
    } else if (category === "announcement") {
      const announcementDoc = await getDoc(
        doc(db, "Announcement", referenceId)
      );
      if (!announcementDoc.exists()) {
        throw new Error("Announcement not found");
      }
      const announcement = announcementDoc.data() as Announcement;
      querySnapshot.docs.map(
        async (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) =>
          await sendEmailTemplateForNewsletterAnnouncement(
            announcement,
            doc.data().email
          )
      );
    } else if (category === "job_offering") {
      const jobOfferDoc = await getDoc(doc(db, "job_offering", referenceId));
      if (!jobOfferDoc.exists()) {
        throw new Error("Job offering not found");
      }
      const jobOffer = jobOfferDoc.data() as JobOffering;
      querySnapshot.docs.map(
        async (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) =>
          await sendEmailTemplateForNewsletterJobOffer(
            jobOffer,
            doc.data().email
          )
      );
    } else if (category === "scholarship") {
      const scholarshipDoc = await getDoc(doc(db, "scholarships", referenceId));
      if (!scholarshipDoc.exists()) {
        throw new Error("Scholarship not found");
      }
      const scholarship = scholarshipDoc.data() as Scholarship;
      querySnapshot.docs.map(
        async (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) =>
          await sendEmailTemplateForNewsletterScholarship(
            scholarship,
            doc.data().email
          )
      );
    } else if (category === "donation_drive") {
      const donationDriveDoc = await getDoc(
        doc(db, "donation_drive", referenceId)
      );
      if (!donationDriveDoc.exists()) {
        throw new Error("Donation drive not found");
      }
      const donationDrive = donationDriveDoc.data() as DonationDrive;
      querySnapshot.docs.map(
        async (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) =>
          await sendEmailTemplateForNewsletterDonationDrive(
            donationDrive,
            doc.data().email
          )
      );
    }
    return {
      success: true,
      message: "Newsletter sent successfully to all subscribed alumni",
    };
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return {
      success: false,
      message: (error as Error).message,
    };
  }
};
