import {https} from 'firebase-functions';
import {auth} from 'firebase-admin';
import {sendEmail} from '../email/send-email';
import {onCall} from '../function-builder';

const HttpsError = https.HttpsError;


export const issue = onCall(async (data, context) => {
  const message = data.message;
  if (typeof message !== 'string' || !message) throw new HttpsError('invalid-argument', 'Missing feedback message.');

  let email = data.email;
  if (!email || typeof email !== 'string') {
    const uid = context.auth?.uid;
    if (uid) {
      email = (await auth().getUser(uid)).email;
    }
    if (!email || typeof email !== 'string') {
      throw new HttpsError('invalid-argument', 'No email provided.');
    }
  }

  await sendEmail({
    subject: `Error/Issue Report`,
    message,
    to: `ammaarpatel99@gmail.com`,
    replyTo: email,
    cc: `sajedapat@gmail.com`
  });
});
