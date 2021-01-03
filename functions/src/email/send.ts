import * as functions from "firebase-functions";
import {extractStringParam} from "../helpers/helpers";
import {getWorkshopDoc} from "../helpers/workshop";
import {transporter} from "./transporter";
import {ensureIsAdmin} from "../helpers/admin";
import * as admin from "firebase-admin";
import {auth} from "firebase-admin/lib/auth";
import UserRecord = auth.UserRecord;


export const send = functions.https.onCall(async (data, context) => {
  try {
    const uid = extractStringParam(context.auth?.uid, "unauthenticated", 'Missing user');
    await ensureIsAdmin(uid);
    const workshopID = extractStringParam(data?.workshopID, "invalid-argument", 'Missing workshopID');
    const emailText = extractStringParam(data?.email, "invalid-argument", 'Missing email');
    const workshopDoc = await getWorkshopDoc(workshopID);
    const subject = `[Sahee] ${workshopDoc.name}`;
    const userEmails = await getUserEmails(workshopID);
    return transporter.sendMail({to: userEmails.join(','), subject, text: emailText});
  } catch (e) {
    if (e instanceof functions.https.HttpsError) return e;
    else throw e;
  }
})

async function getUserEmails(workshopID: string): Promise<string[]> {
  const queryConsentingUsers = await admin.firestore().collection(`workshops/${workshopID}/workshop-users`)
    .where('consentToEmails', '==', true);
  const consentingUsers = (await queryConsentingUsers.get()).docs
    .map(doc => doc.id)
  const promises: Promise<UserRecord>[] = [];
  for (const uid of consentingUsers) promises.push(admin.auth().getUser(uid));
  const userRecords = await Promise.all(promises);
  return userRecords.map(r => r.email).filter(email => !!email) as string[];
}
