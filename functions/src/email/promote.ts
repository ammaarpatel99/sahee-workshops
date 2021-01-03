import * as functions from "firebase-functions";
import {extractStringParam} from "../helpers/helpers";
import {getAllWorkshopUsers, getWorkshopDoc} from "../helpers/workshop";
import * as admin from "firebase-admin";
import {UserDoc} from "../../../firestore-interfaces/users/user";
import {transporter} from "./transporter";
import {ensureIsAdmin} from "../helpers/admin";


export const promote = functions.https.onCall(async (data, context) => {
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
  const queryConsentingUsers = await admin.firestore().collection('users')
    .where('consentToEmails', '==', true);
  const consentingUsers = (await queryConsentingUsers.get()).docs
    .map(doc => ({id: doc.id, email: (doc.data() as UserDoc).email}))
    .filter(user => !!user.email) as {id: string, email: string}[];
  const signedupUsers = await getAllWorkshopUsers(workshopID);
  return consentingUsers.filter(user => !signedupUsers.includes(user.id)).map(user => user.email);
}
