import {https} from 'firebase-functions';
import {CallableContext} from 'firebase-functions/lib/providers/https';
import {auth, firestore} from 'firebase-admin';
import {
  AdminWorkshopDoc,
  UserDoc,
  FIRESTORE_PATHS as PATHS
} from '../firebase-helpers';
import {sendEmail} from './send-email';
import {onCall} from '../function-builder';

const HttpsError = https.HttpsError;


export const send = onCall(async (data, context) => {
  const {workshopID, message} = await setup(data, context);

  return firestore().runTransaction(async transaction => {
    const workshop = await getWorkshop(workshopID, transaction);

    const userIDs = (
      await transaction.get(
        firestore().collection(PATHS.workshop.user.col(workshopID))
          .where('consentToEmails', '==', true)
      )
    ).docs.map(x => x.id);

    return sendEmailsToUsers(userIDs, workshop.name, message);
  });
});


export const promote = onCall(async (data, context) => {
  const {workshopID, message} = await setup(data, context);

  const workshop = await getWorkshop(workshopID);

  const signedUpUsers = (
    await firestore().collection(PATHS.workshop.user.col(workshopID)).get()
  ).docs.map(doc => doc.id);

  const emails = (
    await firestore().collection(PATHS.user.col).get()
  ).docs.map(doc => ({id: doc.id, ...doc.data() as UserDoc}))
    .filter(user => user.consentToEmails !== false && !signedUpUsers.includes(user.id) && user.email)
    .map(user => user.email as string);

  return sendEmailToUserEmails(emails, workshop.name, message);
});


async function setup(data: any, context: CallableContext): Promise<{workshopID: string, message: string}> {
  const uid = context.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'No user found.');

  const workshopID = data.workshopID;
  if (typeof workshopID !== 'string') throw new HttpsError('invalid-argument', 'Must provide workshopID.');

  const message = data.message;
  if (typeof message !== 'string') throw new HttpsError('invalid-argument', 'Must provide message.');

  const user = await auth().getUser(uid);
  if (user.customClaims?.admin !== true) throw new HttpsError('permission-denied', 'User must be an admin.');

  return {workshopID, message};
}


async function sendEmailsToUsers(userIDs: string[], workshopName: string, message: string): Promise<string[]> {
  const promises: Promise<auth.UserRecord>[] = [];
  for (const uid of userIDs) promises.push(auth().getUser(uid));
  const emailAddresses = (await Promise.all(promises)).map(user => user.email).filter(email => !!email) as string[];
  return await sendEmailToUserEmails(emailAddresses, workshopName, message);
}

async function sendEmailToUserEmails(emailAddresses: string[], workshopName: string, message: string): Promise<string[]> {
  await sendEmail({
    subject: workshopName,
    message,
    bcc: emailAddresses
  });
  return emailAddresses;
}


async function getWorkshop(workshopID: string, transaction?: firestore.Transaction): Promise<AdminWorkshopDoc> {
  const doc = firestore().doc(PATHS.workshop.doc(workshopID));

  let res;
  if (!transaction) res = doc.get();
  else res = transaction.get(doc);

  const workshop = (await res).data() as AdminWorkshopDoc | undefined;
  if (!workshop) throw new HttpsError('invalid-argument', `Couldn't find workshop with provided workshopID.`);
  return workshop;
}
