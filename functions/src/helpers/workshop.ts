import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";


export async function getAllWorkshopUsers(workshopID: string): Promise<string[]> {
  const docs = await admin.firestore().collection(`'workshops/${workshopID}/workshop-users`).listDocuments();
  return docs.map(doc => doc.id);
}

export async function getWorkshopDoc(
  workshopID: string, transaction?: FirebaseFirestore.Transaction
): Promise<AdminWorkshopDoc> {
  let workshopDoc: AdminWorkshopDoc | undefined;
  if (transaction) {
    workshopDoc = (await transaction.get(admin.firestore().doc(`workshops/${workshopID}`)))
      .data() as AdminWorkshopDoc | undefined;
  } else {
    workshopDoc = (await admin.firestore().doc(`workshops/${workshopID}`).get())
      .data() as AdminWorkshopDoc | undefined;
  }
  if (!workshopDoc) throw new functions.https.HttpsError('invalid-argument', 'no workshop with provided id');
  return workshopDoc;
}
