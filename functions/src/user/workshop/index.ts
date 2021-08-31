import {https} from 'firebase-functions';
import {firestore, auth} from 'firebase-admin';
import {
  AdminWorkshopDoc,
  WorkshopUserDoc,
  UserWorkshopDoc,
  FIRESTORE_PATHS as PATHS
} from '../../firebase-helpers';
import {sendEmail} from '../../email/send-email';
import {firestoreFn, onCall} from '../../function-builder';

const HttpsError = https.HttpsError;


export const register = onCall((data, context) => {
  const userID = context.auth?.uid;
  if (!userID) throw new HttpsError('unauthenticated', 'No user found.');

  const workshopID = data.workshopID;
  if (typeof workshopID !== 'string') throw new HttpsError('invalid-argument', 'No workshopID provided.');

  const consentToEmails = data.consentToEmails;
  if (typeof consentToEmails !== 'boolean') throw new HttpsError('invalid-argument', 'No consentToEmails provided.');

  return firestore().runTransaction(async transaction => {
    const workshop = (
      await transaction.get(
        firestore().doc(PATHS.workshop.doc(workshopID))
      )
    ).data() as AdminWorkshopDoc | undefined;
    if (!workshop) throw new HttpsError('invalid-argument', 'No workshop matching provided workshopID.');

    const userWorkshopPath = firestore().doc(PATHS.user.workshop.doc({userID, workshopID}));
    const userWorkshop = (
      await transaction.get(userWorkshopPath)
    ).exists;
    if (userWorkshop) throw new HttpsError('already-exists', 'User already registered.');

    const _userWorkshopDoc: UserWorkshopDoc & {newSignupEmail?: string} = {...workshop, consentToEmails};
    delete _userWorkshopDoc.newSignupEmail;
    const userWorkshopDoc: UserWorkshopDoc = _userWorkshopDoc;

    transaction
      .set(userWorkshopPath, userWorkshopDoc)
      .set(
        firestore().doc(PATHS.workshop.user.doc({workshopID, userID})),
        {consentToEmails}
      );
  });
});


const path = PATHS.user.col + '/{uid}/' + PATHS.user.workshop.colName + '/{workshopID}';


export const onCreate = firestoreFn.document(path).onCreate(
  async (snapshot, context) => {
    const uid = context.params.uid as string;

    const workshopID = context.params.workshopID as string;

    const w = (
      await firestore().doc(PATHS.workshop.doc(workshopID)).get()
    ).data() as AdminWorkshopDoc | undefined;
    if (!w) return;

    const emailAddress = (
      await auth().getUser(uid)
    ).email;
    if (emailAddress) {
      await sendEmail({
        subject: w.name,
        message: w.newSignupEmail,
        to: emailAddress
      });
    }
  }
);


export const onUpdate = firestoreFn.document(path).onUpdate(
  (change, context) => {
    const oldConsent = change.before.data().consentToEmails;
    const consentToEmails = change.after.data().consentToEmails;
    if (oldConsent === consentToEmails) return;

    const userID = context.params.uid as string;

    const workshopID = context.params.workshopID as string;

    const workshopUserDoc: Partial<WorkshopUserDoc> = {consentToEmails};
    return firestore().doc(PATHS.workshop.user.doc({workshopID, userID})).update(workshopUserDoc);
  }
);


export const onDelete = firestoreFn.document(path).onDelete(
  (snapshot, context) => {
    const userID = context.params.uid as string;

    const workshopID = context.params.workshopID as string;

    return firestore().doc(PATHS.workshop.user.doc({workshopID, userID})).delete();
  }
);
