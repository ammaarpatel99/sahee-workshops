import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {PublicWorkshopDoc} from "../../../firestore-interfaces/public-workshops/public-workshop";


export const onCreate = functions.firestore.document('workshops/{id}').onCreate(
  (snapshot, context) => {
    const workshopID = context.params.id as string;
    const data = snapshot.data() as AdminWorkshopDoc;
    const publicData: PublicWorkshopDoc = {name: data.name, description: data.description, datetime: data.datetime};
    return admin.firestore().doc(`public-workshops/${workshopID}`).set(publicData);
  }
);
