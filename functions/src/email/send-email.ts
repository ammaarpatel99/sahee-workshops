import {transporter} from './transporter';
import {Address} from 'nodemailer/lib/mailer';
import {SentMessageInfo} from 'nodemailer';


export interface EmailOptions {
  readonly subject: string;
  readonly message: string;
  readonly replyTo?: string | Address;
  readonly to?: (string | Address)[] | string | Address;
  readonly bcc?: (string | Address)[] | string | Address;
  readonly cc?: (string | Address)[] | string | Address;
}


const SAHEE_CONTACT: Address = {name: 'Sajeda Patel', address: 'sajedapat@gmail.com'};


export function sendEmail(emailOptions: EmailOptions): Promise<SentMessageInfo> {
  return transporter.sendMail({
    subject: `[SAHEE] ${(emailOptions.subject)}`,
    text: emailOptions.message,
    to: emailOptions.to || SAHEE_CONTACT,
    bcc: emailOptions.bcc,
    replyTo: emailOptions.replyTo || SAHEE_CONTACT,
    from: {name: 'Sahee Counselling', address: 'no-reply@sahee.co.uk'},
    cc: emailOptions.cc
  });
}
