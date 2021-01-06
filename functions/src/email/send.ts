import * as functions from "firebase-functions";
import {extractStringParam} from "../helpers/helpers";
import {getWorkshopDoc} from "../helpers/workshop";
import {from, replyTo, transporter} from "./transporter";
import {ensureIsAdmin} from "../helpers/admin";
import * as admin from "firebase-admin";
import {auth} from "firebase-admin/lib/auth";
import UserRecord = auth.UserRecord;
import {PATHS} from "../firebase-paths";


export const send = functions.https.onCall(async (data, context) => {
  try {
    const uid = extractStringParam(context.auth?.uid, "unauthenticated", 'Missing user');
    await ensureIsAdmin(uid);
    const workshopID = extractStringParam(data?.workshopID, "invalid-argument", 'Missing workshopID');
    const emailText = extractStringParam(data?.email, "invalid-argument", 'Missing email');
    const workshopDoc = await getWorkshopDoc(workshopID);
    const subject = `[Sahee] ${workshopDoc.name}`;
    const userEmails = await getUserEmails(workshopID);
    await transporter.sendMail({from, bcc: userEmails, subject, text: emailText, replyTo, to: replyTo});
    return userEmails;
  } catch (e) {
    if (e instanceof functions.https.HttpsError) return e;
    else throw e;
  }
})

async function getUserEmails(workshopID: string): Promise<string[]> {
  const queryConsentingUsers = await admin.firestore().collection(PATHS.workshopUsersCol(workshopID))
    .where('consentToEmails', '==', true);
  const consentingUsers = (await queryConsentingUsers.get()).docs
    .map(doc => doc.id)
  const promises: Promise<UserRecord>[] = [];
  for (const uid of consentingUsers) promises.push(admin.auth().getUser(uid));
  const userRecords = await Promise.all(promises);
  return userRecords.map(r => r.email).filter(email => !!email) as string[];
}
