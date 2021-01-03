import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {PublicWorkshopDoc} from "../../../firestore-interfaces/public-workshops/public-workshop";
import {UserWorkshopDoc} from "../../../firestore-interfaces/users/user-workshops/user-workshop";
import {getAllWorkshopUsers} from "../helpers/workshop";

export const onUpdate = functions.firestore.document('workshops/{id}').onUpdate(
  async (change, context) => {
    const workshopID = context.params.id as string;
    const data = change.after.data() as AdminWorkshopDoc;
    const publicData = makePublicDoc(data);
    const userData = makeUserWorkshopDoc(publicData, data);
    const promises: Promise<any>[] = [];
    promises.push(admin.firestore().doc(`public-workshops/${workshopID}`).update(publicData));
    const workshopUsers = await getAllWorkshopUsers(workshopID);
    for (const uid of workshopUsers) {
      promises.push(admin.firestore().doc(`users/${uid}/user-workshops/${workshopID}`).update(userData));
    }
    return Promise.all(promises);
  }
);

function makePublicDoc(workshopDoc: AdminWorkshopDoc): PublicWorkshopDoc {
  return {name: workshopDoc.name, datetime: workshopDoc.datetime, description: workshopDoc.description};
}

function makeUserWorkshopDoc(
  publicWorkshopDoc: PublicWorkshopDoc, workshopDoc: AdminWorkshopDoc
): Omit<UserWorkshopDoc, 'consentToEmails'> {
  const userWorkshopDoc: Omit<UserWorkshopDoc, 'consentToEmails'> = {...publicWorkshopDoc};
  if (workshopDoc.videoCallLink) userWorkshopDoc.videoCallLink = workshopDoc.videoCallLink;
  if (workshopDoc.feedbackLink) userWorkshopDoc.feedbackLink = workshopDoc.feedbackLink;
  if (workshopDoc.recordingLink) userWorkshopDoc.recordingLink = workshopDoc.recordingLink;
  return userWorkshopDoc;
}
