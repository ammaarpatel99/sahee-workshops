import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {transporter} from "./transporter";


export const onNewSignup = functions.firestore.document(`workshops/{workshopID}/user-workshops/{uid}`).onCreate(
  async (snapshot, context) => {
    const workshopID = context.params.workshopID as string;
    const uid = context.params.uid as string;
    const userEmailAddress = (await admin.auth().getUser(uid)).email;
    if (!userEmailAddress) return;
    const workshopDoc = (await admin.firestore().doc(`workshops/${workshopID}`).get()).data() as AdminWorkshopDoc;
    const text = workshopDoc.newSignupEmail;
    const subject = `[Sahee] ${workshopDoc.name}`;
    await transporter.sendMail({to: userEmailAddress, subject, text});
  }
);
