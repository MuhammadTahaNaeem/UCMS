/**
 * Email Service with Nodemailer
 */
import nodemailer from "nodemailer";

const emailTemplates = {
  verifyEmail: (verificationLink, fullName) => ({
    subject: "Verify Your Email - University Complaint Management System",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { color: #4F46E5; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">University Complaint Management System - Email Verification</div>
              <p>Hi ${fullName},</p>
              <p>Thank you for registering with the University Complaint Management System. Please verify your email to activate your account.</p>
              <p><a href="${verificationLink}" class="button">Verify Email</a></p>
              <p>This link expires in 24 hours.</p>
              <div class="footer">
                <p>If you did not register, please ignore this email.</p>
                <p>&copy; 2026 University Complaint Management System. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  resetPassword: (resetLink, fullName) => ({
    subject: "Reset Your Password - University Complaint Management System",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { color: #4F46E5; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">Reset Your Password</div>
              <p>Hi ${fullName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>
              <p><a href="${resetLink}" class="button">Reset Password</a></p>
              <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
              <div class="footer">
                <p>&copy; 2026 University Complaint Management System. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  complaintUpdate: (fullName, complaintId, status, message) => ({
    subject: `Complaint ${complaintId} Status Update - University Complaint Management System`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { color: #4F46E5; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .status { display: inline-block; padding: 8px 16px; background: #4F46E5; color: white; border-radius: 20px; font-size: 12px; }
            .footer { margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">Complaint Update</div>
              <p>Hi ${fullName},</p>
              <p>Your complaint <strong>${complaintId}</strong> has been updated.</p>
              <p>
                <strong>Status:</strong><br>
                <span class="status">${status}</span>
              </p>
              <p><strong>Update:</strong><br>${message}</p>
              <p>Log in to University Complaint Management System to view more details.</p>
              <div class="footer">
                <p>&copy; 2026 UCMS. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

export const sendEmail = async (to, templateName, templateData) => {
  try {
    const template = emailTemplates[templateName](...templateData);
    // Build transporter: prefer configured SMTP, otherwise use Ethereal test account
    let transporter;
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465,
        secure: process.env.EMAIL_SECURE === "true" || String(process.env.EMAIL_PORT) === "465",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // allow self-signed certs in development
        tls: process.env.NODE_ENV !== "production" ? { rejectUnauthorized: false } : undefined,
      });
    } else {
      // No SMTP configured: create an Ethereal test account for local/dev environments
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("No SMTP config found - using Ethereal test account for email delivery (dev only).");
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'no-reply@ucms.university',
      to,
      subject: template.subject,
      html: template.html,
    });

    // If using Ethereal, log a preview URL so developers can view the email
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("Email preview URL:", previewUrl);

    return { success: true, info, previewUrl };
  } catch (error) {
    console.error("Email send error:", error);
    try {
      // Log the HTML so developers can copy the verification link if delivery fails
      console.log("Email HTML (for debugging):\n", template?.html);
    } catch (e) {
      /* ignore */
    }
    return { success: false, error };
  }
};
