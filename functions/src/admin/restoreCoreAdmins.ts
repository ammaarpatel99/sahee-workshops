import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const CORE_ADMIN_EMAILS: string[] = [
  'sajedapat@gmail.com',
  'ammaarpatel99@gmail.com',
];

export const restoreCoreAdmins = functions.https.onCall(async () => {
  const promises: Promise<string|null>[] = [];
  for (const adminEmail of CORE_ADMIN_EMAILS) {
    promises.push(restoreAdmin(adminEmail));
  }
  const coreAdmins = await Promise.all(promises);
  return coreAdmins.filter(email => email !== null);
})

async function restoreAdmin(adminEmail: string): Promise<string|null> {
  try {
    const user = await admin.auth().getUserByEmail(adminEmail);
    const uid = user.uid;
    const currentClaims = user.customClaims || {};
    const newClaims = {...currentClaims, admin: true};
    await admin.auth().setCustomUserClaims(uid, newClaims);
    return adminEmail;
  } catch (e) {
    return null;
  }
}
