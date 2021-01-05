import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {PATHS} from "../firebase-paths";


export async function getAllWorkshopUsers(workshopID: string): Promise<string[]> {
  const docs = await admin.firestore().collection(PATHS.workshopUsersCol(workshopID)).listDocuments();
  return docs.map(doc => doc.id);
}

export async function getWorkshopDoc(
  workshopID: string, transaction?: FirebaseFirestore.Transaction
): Promise<AdminWorkshopDoc> {
  let workshopDoc: AdminWorkshopDoc | undefined;
  const path = PATHS.workshopDoc(workshopID);
  if (transaction) {
    workshopDoc = (await transaction.get(admin.firestore().doc(path)))
      .data() as AdminWorkshopDoc | undefined;
  } else {
    workshopDoc = (await admin.firestore().doc(path).get())
      .data() as AdminWorkshopDoc | undefined;
  }
  if (!workshopDoc) throw new functions.https.HttpsError('invalid-argument', 'no workshop with provided id');
  return workshopDoc;
}
