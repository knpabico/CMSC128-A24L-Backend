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
