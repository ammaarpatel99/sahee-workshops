import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {getAllWorkshopUsers} from "../helpers/workshop";

export const onDelete = functions.firestore.document('workshops/{id}').onDelete(
  async (change, context) => {
    const workshopID = context.params.id as string;
    const promises: Promise<any>[] = [];
    promises.push(admin.firestore().doc(`public-workshops/${workshopID}`).delete());
    const workshopUsers = await getAllWorkshopUsers(workshopID);
    for (const uid of workshopUsers) {
      promises.push(admin.firestore().doc(`workshops/${workshopID}/workshop-users/${uid}`).delete())
      promises.push(admin.firestore().doc(`users/${uid}/user-workshops/${workshopID}`).delete());
    }
    return Promise.all(promises);
  }
);
