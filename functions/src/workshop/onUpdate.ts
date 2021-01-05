import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {PublicWorkshopDoc} from "../../../firestore-interfaces/public-workshops/public-workshop";
import {UserWorkshopDoc} from "../../../firestore-interfaces/users/user-workshops/user-workshop";
import {getAllWorkshopUsers} from "../helpers/workshop";
import {PATHS} from "../firebase-paths";

export const onUpdate = functions.firestore.document(`${PATHS.workshopsCol}/{id}`).onUpdate(
  async (change, context) => {
    const workshopID = context.params.id as string;
    const data = change.after.data() as AdminWorkshopDoc;
    const publicData = makePublicDoc(data);
    const userData = makeUserWorkshopDoc(publicData, data);
    const promises: Promise<any>[] = [];
    promises.push(admin.firestore().doc(PATHS.publicWorkshopDoc(workshopID)).update(publicData));
    const workshopUsers = await getAllWorkshopUsers(workshopID);
    for (const uid of workshopUsers) {
      promises.push(admin.firestore().doc(PATHS.userWorkshopDoc(uid, workshopID)).update(userData));
    }
    await Promise.all(promises);
  }
);

function makePublicDoc(workshopDoc: AdminWorkshopDoc): PublicWorkshopDoc {
  return {name: workshopDoc.name, datetime: workshopDoc.datetime, description: workshopDoc.description};
}

function makeUserWorkshopDoc(
  publicWorkshopDoc: PublicWorkshopDoc, workshopDoc: AdminWorkshopDoc
): Omit<UserWorkshopDoc, 'consentToEmails'> {
  const userWorkshopDoc: Omit<UserWorkshopDoc, 'consentToEmails'> = {...publicWorkshopDoc};
  if (workshopDoc.videoCallLink !== undefined) userWorkshopDoc.videoCallLink = workshopDoc.videoCallLink;
  if (workshopDoc.feedbackLink !== undefined) userWorkshopDoc.feedbackLink = workshopDoc.feedbackLink;
  if (workshopDoc.recordingLink !== undefined) userWorkshopDoc.recordingLink = workshopDoc.recordingLink;
  return userWorkshopDoc;
}
