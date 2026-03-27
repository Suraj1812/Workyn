import nodemailer from 'nodemailer';

import { logger } from './logger.js';

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendWorkspaceInviteEmail = async ({ to, inviterName, workspaceName, inviteUrl }) => {
  const mailer = getTransporter();

  if (!mailer) {
    logger.warn('SMTP transport not configured. Invitation email skipped.', { to, workspaceName });
    return {
      delivered: false,
      inviteUrl,
    };
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Join ${workspaceName} on Workyn`,
    text: `${inviterName} invited you to join ${workspaceName} on Workyn. Open this link to accept: ${inviteUrl}`,
  });

  return {
    delivered: true,
    inviteUrl,
  };
};
