import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {UserWorkshopDoc} from "../../../firestore-interfaces/users/user-workshops/user-workshop";
import {WorkshopUserDoc} from "../../../firestore-interfaces/workshops/workshop-users/workshop-user";
import {extractBooleanParam, extractStringParam} from "../helpers/helpers";

export const changeConsent = functions.https.onCall((data, context) => {
  try {
    const uid = extractStringParam(context.auth?.uid, 'unauthenticated', 'Missing user');
    const workshopID = extractStringParam(data?.workshopID, "invalid-argument", 'Missing workshopID');
    const consentToEmails = extractBooleanParam(data?.consentToEmails, "invalid-argument", 'Missing consentToEmails');
    return admin.firestore().runTransaction(async transaction => {
      return transaction
        .update(admin.firestore().doc(`users/${uid}/user-workshops/${workshopID}`), {consentToEmails} as Partial<UserWorkshopDoc>)
        .update(admin.firestore().doc(`workshops/${workshopID}/workshops-users/${uid}`), {consentToEmails} as Partial<WorkshopUserDoc>)
    });
  } catch (e) {
    if (e instanceof functions.https.HttpsError) return e;
    throw e;
  }
})
