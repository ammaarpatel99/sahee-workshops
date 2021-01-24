import {https} from 'firebase-functions';
import {CallableContext} from "firebase-functions/lib/providers/https";
import {auth, firestore} from "firebase-admin";
import {PATHS} from "../firebase-paths";
import {AdminWorkshopDoc, UserDoc} from "../../../firestore-interfaces";
import {sendEmail} from "./send-email";
import {onCall} from '../function-builder';

const HttpsError = https.HttpsError;


export const send = onCall(async (data, context) => {
  const {workshopID, message} = await setup(data, context);

  return firestore().runTransaction(async transaction => {
    const workshop = await getWorkshop(workshopID, transaction);

    const userIDs = (
      await transaction.get(
        firestore().collection(PATHS.workshopUsersCol(workshopID))
          .where('consentToEmails', '==', true)
      )
    ).docs.map(x => x.id);

    return sendEmailsToUsers(userIDs, workshop.name, message);
  });
});


export const promote = onCall(async (data, context) => {
  const {workshopID, message} = await setup(data, context);

  const consentingUsers =
    (await firestore().collection(PATHS.usersCol).get()).docs
    .map(doc => ({id: doc.id, ...doc.data() as UserDoc}))
    .filter(user => user.consentToEmails !== false)
    .map(user => user.id);

  return firestore().runTransaction(async transaction => {
    const workshop = await getWorkshop(workshopID, transaction);

    const signedUpUsers = (
      await transaction.get(
        firestore().collection(PATHS.workshopUsersCol(workshopID))
          .where('consentToEmails', '==', true)
      )
    ).docs.map(x => x.id);

    const userIDs = consentingUsers.filter(id => !signedUpUsers.includes(id));

    return sendEmailsToUsers(userIDs, workshop.name, message);
  });
});


async function setup(data: any, context: CallableContext): Promise<{workshopID: string, message: string}> {
  const uid = context.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", 'No user found.');
  const workshopID = data.workshopID;
  if (typeof workshopID !== "string") throw new HttpsError('invalid-argument', 'Must provide workshopID.');
  const message = data.message;
  if (typeof message !== "string") throw new HttpsError('invalid-argument', 'Must provide message.');

  const user = await auth().getUser(uid);
  if (user.customClaims?.admin !== true) throw new HttpsError('permission-denied', 'User must be an admin.');

  return {workshopID, message};
}


async function sendEmailsToUsers(userIDs: string[], workshopName: string, message: string): Promise<string[]> {
  const promises: Promise<auth.UserRecord>[] = [];
  for (const uid of userIDs) promises.push(auth().getUser(uid));
  const emailAddresses = (await Promise.all(promises)).map(user => user.email).filter(email => !!email) as string[];
  await sendEmail(workshopName, message, undefined, emailAddresses);
  return emailAddresses;
}


async function getWorkshop(workshopID: string, transaction: firestore.Transaction): Promise<AdminWorkshopDoc> {
  const workshop = (
    await transaction.get(firestore().doc(PATHS.workshopDoc(workshopID)))
  ).data() as AdminWorkshopDoc | undefined;
  if (!workshop) throw new HttpsError('invalid-argument', `Couldn't find workshop with provided workshopID.`);
  return workshop;
}
