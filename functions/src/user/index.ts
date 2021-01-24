import {firestoreFn} from "../function-builder";
import {PATHS} from "../firebase-paths";
import {firestore} from "firebase-admin";

export * as workshop from './workshop';


export const onDelete = firestoreFn.document(PATHS.usersCol + '/{uid}').onDelete(
  async (snapshot, context) => {
    const uid = context.params.uid as string;
    const userWorkshops = (
      await firestore().collection(PATHS.userWorkshopsCol(uid)).listDocuments()
    ).map(doc => doc.id);
    const batch = firestore().batch();
    for (const workshopID of userWorkshops) {
      batch.delete(firestore().doc(PATHS.userWorkshopDoc(uid, workshopID)))
        .delete(firestore().doc(PATHS.workshopUserDoc(workshopID, uid)))
    }
    await batch.commit();
  }
);
