import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export async function ensureIsAdmin(uid: string) {
  if ((await admin.auth().getUser(uid)).customClaims?.admin) return;
  throw new functions.https.HttpsError('permission-denied', 'user isn\'t admin');
}
