import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const CORE_ADMIN_EMAILS: string[] = [
  'sajedapat@gmail.com',
  'ammaarpatel99"gmail.com',
];

export const restoreCoreAdmins = functions.https.onCall((data, context) => {
  const promises: Promise<void>[] = [];
  for (const adminEmail of CORE_ADMIN_EMAILS) {
    promises.push(restoreAdmin(adminEmail));
  }
  return Promise.all(promises);
})

async function restoreAdmin(adminEmail: string): Promise<void> {
  const user = await admin.auth().getUserByEmail(adminEmail);
  const uid = user.uid;
  const currentClaims = user.customClaims || {};
  const newClaims = {...currentClaims, admin: true};
  return admin.auth().setCustomUserClaims(uid, newClaims);
}
