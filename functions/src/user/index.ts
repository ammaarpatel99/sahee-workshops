import {firestoreFn} from '../function-builder';
import {firestore} from 'firebase-admin';
import {FIRESTORE_PATHS as PATHS} from '@firebase-helpers';

export * as workshop from './workshop';


export const onDelete = firestoreFn.document(PATHS.user.col + '/{uid}').onDelete(
  async (snapshot, context) => {
    const userID = context.params.uid as string;

    const userWorkshops = (
      await firestore().collection(PATHS.user.workshop.col(userID)).listDocuments()
    ).map(doc => doc.id);

    const batch = firestore().batch();
    for (const workshopID of userWorkshops) {
      batch.delete(firestore().doc(PATHS.user.workshop.doc({userID, workshopID})))
        .delete(firestore().doc(PATHS.workshop.user.doc({workshopID, userID})));
    }
    await batch.commit();
  }
);
