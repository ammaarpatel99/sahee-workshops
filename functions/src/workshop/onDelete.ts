import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {getAllWorkshopUsers} from "../helpers/workshop";
import {PATHS} from "../firebase-paths";

export const onDelete = functions.firestore.document(`${PATHS.workshopsCol}/{id}`).onDelete(
  async (change, context) => {
    const workshopID = context.params.id as string;
    const promises: Promise<any>[] = [];
    promises.push(admin.firestore().doc(PATHS.publicWorkshopDoc(workshopID)).delete());
    const workshopUsers = await getAllWorkshopUsers(workshopID);
    for (const uid of workshopUsers) {
      promises.push(
        admin.firestore().doc(PATHS.workshopUserDoc(workshopID, uid)).delete(),
        admin.firestore().doc(PATHS.userWorkshopDoc(uid, workshopID)).delete()
      );
    }
    await Promise.all(promises);
  }
);
