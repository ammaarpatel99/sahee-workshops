import {https} from 'firebase-functions';
import {initializeApp, auth} from 'firebase-admin';
import {sendEmail} from './email/send-email';
import {onCall} from './function-builder';

const HttpsError = https.HttpsError;


initializeApp();


export * as workshop from './workshop';
export * as user from './user';
export * as email from './email';
export * as admin from './admin';
export * as poster from './poster';


export const feedback = onCall(async (data, context) => {
  const message = data.message;
  if (typeof message !== 'string' || !message) throw new HttpsError('invalid-argument', 'Missing feedback message.');

  const uid = context.auth?.uid;
  let email: string | undefined;
  if (!!uid) {
    email = (await auth().getUser(uid)).email;
  }
  if (!email) {
    email = data.email;
    if (typeof email !== 'string' || !email) throw new HttpsError('invalid-argument', 'No email provided.');
  }

  await sendEmail({
    subject: `Error/Issue Report`,
    message,
    to: `ammaarpatel99@gmail.com`,
    replyTo: email,
    cc: `sajedapat@gmail.com`
  });
});
