import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {extractStringParam} from "../helpers/helpers";

export const unregister = functions.https.onCall(async (data, context) => {
  try {
    const uid = extractStringParam(context.auth?.uid, 'unauthenticated', 'Missing user');
    const workshopID = extractStringParam(data?.workshopID, "invalid-argument", 'Missing workshopID');
    return await admin.firestore().runTransaction(async transaction => {
      return transaction.delete(admin.firestore().doc(`users/${uid}/user-workshops/${workshopID}`))
        .delete(admin.firestore().doc(`workshops/${workshopID}/workshops-users/${uid}`))
    });
  } catch (e) {
    if (e instanceof functions.https.HttpsError) return e;
    else throw e;
  }
})
