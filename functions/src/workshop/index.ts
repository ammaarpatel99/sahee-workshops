import {firestoreFn} from '../function-builder';
import {firestore} from 'firebase-admin';
import {
  AdminWorkshopDoc,
  PublicWorkshopDoc,
  UserWorkshopDoc,
  FIRESTORE_PATHS as PATHS
} from '../firebase-helpers';


const firestoreFnPath = PATHS.workshop.col + '/{workshopID}';


export const onCreate = firestoreFn.document(firestoreFnPath).onCreate(
  async (snapshot, context) => {
    const workshopID = context.params.workshopID as string;

    const w = snapshot.data() as AdminWorkshopDoc;
    const publicWorkshopDoc: PublicWorkshopDoc = {
      name: w.name, description: w.description, datetime: w.datetime,
    };

    await firestore().doc(PATHS.publicWorkshop.doc(workshopID)).set(publicWorkshopDoc);
  }
);


export const onUpdate = firestoreFn.document(firestoreFnPath).onUpdate(
  async (change, context) => {
    const workshopID = context.params.workshopID as string;

    const _w = change.before.data() as AdminWorkshopDoc;
    const w = change.after.data() as AdminWorkshopDoc;

    const publicWorkshopDoc: Partial<PublicWorkshopDoc> | null
      = getChangedValues(w, _w, ['name', 'description', 'datetime']);

    const userWorkshopDoc: Partial<UserWorkshopDoc> | null
      = getChangedValues(w, _w,
      ['name', 'datetime', 'description', 'recordingLink', 'videoCallLink', 'feedbackLink']);

    const users = (
      await firestore().collection(PATHS.workshop.user.col(workshopID)).listDocuments()
    ).map(doc => doc.id);

    const batch = firestore().batch();
    if (publicWorkshopDoc) {
      batch.update(
        firestore().doc(PATHS.publicWorkshop.doc(workshopID)),
        publicWorkshopDoc
      );
    }
    if (userWorkshopDoc) {
      for (const userID of users) {
        batch.update(
          firestore().doc(PATHS.user.workshop.doc({userID, workshopID})),
          userWorkshopDoc
        );
      }
    }
    await batch.commit();
  }
);


export const onDelete = firestoreFn.document(firestoreFnPath).onDelete(
  async (snapshot, context) => {
    const workshopID = context.params.workshopID as string;

    const workshopUsers = (
      await firestore().collection(PATHS.workshop.user.col(workshopID)).listDocuments()
    ).map(doc => doc.id);

    const batch = firestore().batch();
    for (const userID of workshopUsers) {
      batch.delete(firestore().doc(PATHS.workshop.user.doc({workshopID, userID})))
        .delete(firestore().doc(PATHS.user.workshop.doc({userID, workshopID})));
    }
    batch.delete(firestore().doc(PATHS.publicWorkshop.doc(workshopID)));
    await batch.commit();
  }
);


function getChangedValues<T, K extends keyof T>(newObj: T, oldObj: T, keys: K[]): Partial<T> | null {
  let res: Partial<T> | null = null;
  for (const k of keys) {
    if (newObj[k] !== oldObj[k]) {
      if (!res) res = {};
      res[k] = newObj[k];
    }
  }
  return res;
}
