import {transporter} from './transporter';
import {Address} from 'nodemailer/lib/mailer';
import {SentMessageInfo} from 'nodemailer';
import {CONTACT_EMAIL, NO_REPLY_EMAIL} from './secret-emails';


export interface EmailOptions {
  readonly subject: string;
  readonly message: string;
  readonly replyTo?: string | Address;
  readonly to?: (string | Address)[] | string | Address;
  readonly bcc?: (string | Address)[] | string | Address;
  readonly cc?: (string | Address)[] | string | Address;
}


export function sendEmail(emailOptions: EmailOptions): Promise<SentMessageInfo> {
  return transporter.sendMail({
    subject: `[SAHEE] ${(emailOptions.subject)}`,
    text: emailOptions.message,
    to: emailOptions.to || CONTACT_EMAIL,
    bcc: emailOptions.bcc,
    replyTo: emailOptions.replyTo || CONTACT_EMAIL,
    from: NO_REPLY_EMAIL,
    cc: emailOptions.cc
  });
}
