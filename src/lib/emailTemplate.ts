import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import { FirebaseError } from "firebase/app";

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
        subject: "ICS-ARMS - New Account Registration",
        text: "Dear user, your verification code is ...",
        html: `<!DOCTYPE html>
                    <html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <head>
                        <meta charset="UTF-8" />
                        <title>Email Verification</title>
                    </head>
                    <body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #004aad;">ICS-ARMS</h2>
                        </div>
                        
                        <h3 style="color: #333;">Dear User, your verification code is</h3>
                        <strong>${code}</strong>
                        <p>Please use this code to verify your registration</p>
                        <br/>
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
      message: `Verification sent successfully!`,
    };
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}

export async function sendEmailTemplateForNewsletter(
  photoURL: string,
  title: string,
  content: string,
  alumniEmail: string,
  category: string
) {
  try {
    await addDoc(collection(db, "mail"), {
      to: alumniEmail,
      message: {
        subject: category.toUpperCase() + ": " + title,
        text: content,
        html: `<!DOCTYPE html>
                    <html lang="en" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <head>
                        <meta charset="UTF-8" />
                        <title>${title}</title>
                    </head>
                    <body style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #004aad;">ICS-ARMS</h2>
                        </div>
                        <img src="${photoURL}" alt="Newsletter Image" style="width: 100%; height: auto; border-radius: 8px;" />
                        <h3 style="color: #333;">${title}</h3>
                        <p>${content}</p>
                        <div style="margin: 30px 0; text-align: center;">
                        <a href="https://your-website-link.com/newsletter" style="background-color: #004aad; color: #ffffff; padding: 12px 14px; text-decoration: none; border-radius: 5px; display: inline-block;">View Newsletter</a>
                        </div>
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
      message: `Newsletter sent successfully!`,
    };
  } catch (error) {
    return { success: false, message: (error as FirebaseError).message };
  }
}
