import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {UserWorkshopDoc} from "../../../firestore-interfaces/users/user-workshops/user-workshop";
import {WorkshopUserDoc} from "../../../firestore-interfaces/workshops/workshop-users/workshop-user";
import {getWorkshopDoc} from "../helpers/workshop";
import {extractBooleanParam, extractStringParam} from "../helpers/helpers";
import {PATHS} from "../firebase-paths";

export const register = functions.https.onCall(async (data, context) => {
  const uid = extractStringParam(context.auth?.uid, 'unauthenticated', 'Missing user');
  const workshopID = extractStringParam(data?.workshopID, "invalid-argument", 'Missing workshopID');
  const consentToEmails = extractBooleanParam(data?.consentToEmails, "invalid-argument", 'Missing consentToEmails');
  return await admin.firestore().runTransaction(async transaction => {
    const workshopDoc = await getWorkshopDoc(workshopID, transaction);
    const userWorkshopDoc = makeUserWorkshopDoc(workshopDoc, consentToEmails);
    const workshopUserDoc: WorkshopUserDoc = {consentToEmails};
    return transaction
      .set(admin.firestore().doc(PATHS.userWorkshopDoc(uid, workshopID)), userWorkshopDoc)
      .set(admin.firestore().doc(PATHS.workshopUserDoc(workshopID, uid)), workshopUserDoc)
  });
})

function makeUserWorkshopDoc(workshopDoc: AdminWorkshopDoc, consentToEmails: boolean): UserWorkshopDoc {
  const userWorkshopDoc: UserWorkshopDoc = {
    name: workshopDoc.name, description: workshopDoc.description, datetime: workshopDoc.datetime, consentToEmails,
  };
  if (workshopDoc.recordingLink) userWorkshopDoc.recordingLink = workshopDoc.recordingLink;
  if (workshopDoc.feedbackLink) userWorkshopDoc.feedbackLink = workshopDoc.feedbackLink;
  if (workshopDoc.videoCallLink) userWorkshopDoc.videoCallLink = workshopDoc.videoCallLink;
  return userWorkshopDoc;
}
