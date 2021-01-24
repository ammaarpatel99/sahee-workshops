import {https} from "firebase-functions";
import {PATHS} from "../../firebase-paths";
import {firestore, auth} from "firebase-admin";
import {AdminWorkshopDoc, WorkshopUserDoc, UserWorkshopDoc} from "../../../../firestore-interfaces";
import {sendEmail} from "../../email/send-email";
import {firestoreFn, onCall} from '../../function-builder';

const HttpsError = https.HttpsError;


export const register = onCall((data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", 'No user found.');
  const workshopID = data.workshopID;
  if (typeof workshopID !== 'string') throw new HttpsError("invalid-argument", 'No workshopID provided.');
  const consentToEmails = data.consentToEmails;
  if (typeof consentToEmails !== 'boolean') throw new HttpsError('invalid-argument', 'No consentToEmails provided.');

  return firestore().runTransaction(async transaction => {
    const workshop = (
      await transaction.get(
        firestore().doc(PATHS.workshopDoc(workshopID))
      )
    ).data() as AdminWorkshopDoc | undefined;
    if (!workshop) throw new HttpsError('invalid-argument', 'No workshop matching provided workshopID.');

    const userWorkshopPath = firestore().doc(PATHS.userWorkshopDoc(uid, workshopID));
    const userWorkshop = (
      await transaction.get(userWorkshopPath)
    ).exists;
    if (userWorkshop) throw new HttpsError('already-exists', 'User already registered.');

    delete workshop.newSignupEmail;
    const userWorkshopDoc: UserWorkshopDoc = {...workshop, consentToEmails};

    transaction
      .set(userWorkshopPath, userWorkshopDoc)
      .set(
        firestore().doc(PATHS.workshopUserDoc(workshopID, uid)),
        {consentToEmails}
      )
  });
})


const path = PATHS.usersCol + '/{uid}/' + PATHS.userWorkshopsColName + '/{workshopID}';


export const onCreate = firestoreFn.document(path).onCreate(
  async (snapshot, context) => {
    const uid = context.params.uid as string;
    const workshopID = context.params.workshopID as string;

    const w = (
      await firestore().doc(PATHS.workshopDoc(workshopID)).get()
    ).data() as AdminWorkshopDoc | undefined;
    if (!w) return;

    const emailAddress = (
      await auth().getUser(uid)
    ).email;
    if (emailAddress) {
      await sendEmail(w.name, w.newSignupEmail, [emailAddress]);
    }
  }
);


export const onUpdate = firestoreFn.document(path).onUpdate(
  (change, context) => {
    const oldConsent = change.before.data().consentToEmails;
    const consentToEmails = change.after.data().consentToEmails;
    if (oldConsent === consentToEmails) return;

    const uid = context.params.uid as string;
    const workshopID = context.params.workshopID as string;

    const workshopUserDoc: Partial<WorkshopUserDoc> = {consentToEmails};
    return firestore().doc(PATHS.workshopUserDoc(workshopID, uid)).update(workshopUserDoc);
  }
);


export const onDelete = firestoreFn.document(path).onDelete(
  (snapshot, context) => {
    const uid = context.params.uid as string;
    const workshopID = context.params.workshopID as string;

    return firestore().doc(PATHS.workshopUserDoc(workshopID, uid)).delete();
  }
);
