import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  await transporter.sendMail({
    from: config.email.user,
    to,
    subject,
    text
  });
};