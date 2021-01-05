import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

export * as workshop from './workshop';
export * as admin from './admin';
export * as email from './email';

export const hello = functions.https.onCall((data, context) => {
  return "Hello World";
});
