import {transporter} from "./transporter";
import {Address} from "nodemailer/lib/mailer";

export function sendEmail(subject: string, text: string, to?: string[], bcc?: string[]) {
  const from: Address = {name: 'Sahee Counselling', address: 'no-reply@sahee.co.uk'};
  const replyTo: Address = {name: 'Sajeda Patel', address: 'sajedapat@gmail.com'};

  return transporter.sendMail({subject, text, to: to || replyTo, bcc, replyTo, from});
}
