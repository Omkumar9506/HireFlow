import nodemailer from 'nodemailer';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';

let transporter;

const isEmailConfigured = Boolean(ENV.SMTP_USER && ENV.SMTP_PASSWORD);

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
  logger.info('SMTP transporter configured successfully with connection pooling');
} else {
  // Mock transporter for local development / testing
  transporter = {
    sendMail: async (options) => {
      logger.info(`[MOCK EMAIL SENT] To: ${options.to} | Subject: "${options.subject}"`);
      return { messageId: `mock-${Date.now()}` };
    },
  };
  logger.warn('SMTP credentials missing: mock console email transport active');
}

export { transporter, isEmailConfigured };
