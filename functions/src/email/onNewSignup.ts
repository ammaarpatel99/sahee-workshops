import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {transporter, replyTo, from} from "./transporter";
import {PATHS} from "../firebase-paths";


export const onNewSignup = functions.firestore.document(`${PATHS.workshopsCol}/{workshopID}/workshop-users/{uid}`).onCreate(
  async (snapshot, context) => {
    const workshopID = context.params.workshopID as string;
    const uid = context.params.uid as string;
    await sendNewSignupEmail(uid, workshopID);
  }
);

export async function sendNewSignupEmail(uid: string, workshopID: string): Promise<void> {
  const user = await admin.auth().getUser(uid);
  const userEmailAddress = user.email;
  if (!userEmailAddress) return;
  const workshopDoc = (await admin.firestore().doc(PATHS.workshopDoc(workshopID)).get()).data() as AdminWorkshopDoc;
  const text = workshopDoc.newSignupEmail;
  const subject = `[Sahee] ${workshopDoc.name}`;
  await transporter.sendMail({ from, to: userEmailAddress, subject, text, replyTo});
}
