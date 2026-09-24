import { transporter, isEmailConfigured } from '../config/email.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const emailService = {
  sendEmail: async ({ to, subject, html, text }) => {
    try {
      const mailOptions = {
        from: ENV.SMTP_FROM,
        to,
        subject,
        html,
        text: text || subject,
      };

      const info = await transporter.sendMail(mailOptions);
      if (isEmailConfigured) {
        logger.info(`Email sent to ${to}: ${info.messageId}`);
      }
      return info;
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error.message);
      // Do not throw so failure in email delivery does not crash business workflows
      return null;
    }
  },

  sendVerificationEmail: async (to, name, token) => {
    const verifyUrl = `${ENV.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 8px;">
        <h2 style="color: #1E40AF; margin-bottom: 16px;">Welcome to HireFlow ATS</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering on HireFlow ATS. Please verify your email address to activate all features of your account.</p>
        <div style="margin: 28px 0;">
          <a href="${verifyUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #64748B; font-size: 14px;">If the button does not work, copy and paste this link in your browser:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 12px;">© ${new Date().getFullYear()} HireFlow ATS. All rights reserved.</p>
      </div>
    `;
    return emailService.sendEmail({ to, subject: 'Verify your email - HireFlow ATS', html });
  },

  sendPasswordResetEmail: async (to, name, token) => {
    const resetUrl = `${ENV.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 8px;">
        <h2 style="color: #1E40AF; margin-bottom: 16px;">HireFlow ATS - Password Reset</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Click the button below to set a new password. This link is valid for 1 hour.</p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748B; font-size: 14px;">If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 12px;">© ${new Date().getFullYear()} HireFlow ATS. All rights reserved.</p>
      </div>
    `;
    return emailService.sendEmail({ to, subject: 'Password Reset Request - HireFlow ATS', html });
  },

  sendApplicationStatusEmail: async (to, candidateName, jobTitle, companyName, status) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 8px;">
        <h2 style="color: #1E40AF; margin-bottom: 16px;">Application Update: ${jobTitle}</h2>
        <p>Hello ${candidateName},</p>
        <p>There is an update on your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <p>Your current status is now: <strong style="color: #2563EB; font-size: 16px;">${status}</strong></p>
        <div style="margin: 24px 0;">
          <a href="${ENV.CLIENT_URL}/candidate/applications" style="background-color: #0F172A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">View Application Status</a>
        </div>
        <p style="color: #64748B; font-size: 14px;">Best regards,<br/>The ${companyName} Recruiting Team & HireFlow ATS</p>
      </div>
    `;
    return emailService.sendEmail({
      to,
      subject: `Update on your application for ${jobTitle} at ${companyName}`,
      html,
    });
  },

  sendInterviewScheduledEmail: async (to, candidateName, jobTitle, companyName, interview) => {
    const formattedDate = new Date(interview.scheduledAt).toLocaleString();
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 8px;">
        <h2 style="color: #1E40AF; margin-bottom: 16px;">Interview Scheduled: ${jobTitle}</h2>
        <p>Hello ${candidateName},</p>
        <p>You have been invited for an interview with <strong>${companyName}</strong> for the position of <strong>${jobTitle}</strong>.</p>
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0;"><strong>Duration:</strong> ${interview.duration} minutes</p>
          <p style="margin: 4px 0;"><strong>Interview Type:</strong> ${interview.type}</p>
          ${interview.meetingLink ? `<p style="margin: 4px 0;"><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ''}
          ${interview.notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${interview.notes}</p>` : ''}
        </div>
        <div style="margin: 24px 0;">
          <a href="${ENV.CLIENT_URL}/candidate/interviews" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">View Interview Details</a>
        </div>
      </div>
    `;
    return emailService.sendEmail({
      to,
      subject: `Interview Scheduled for ${jobTitle} - ${companyName}`,
      html,
    });
  },
};
