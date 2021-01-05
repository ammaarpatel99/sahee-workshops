import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {AdminWorkshopDoc} from "../../../firestore-interfaces/workshops/workshop";
import {PublicWorkshopDoc} from "../../../firestore-interfaces/public-workshops/public-workshop";
import {PATHS} from "../firebase-paths";


export const onCreate = functions.firestore.document(`${PATHS.workshopsCol}/{id}`).onCreate(
  async (snapshot, context) => {
    const workshopID = context.params.id as string;
    const data = snapshot.data() as AdminWorkshopDoc;
    const publicData: PublicWorkshopDoc = {name: data.name, description: data.description, datetime: data.datetime};
    await admin.firestore().doc(PATHS.publicWorkshopDoc(workshopID)).set(publicData);
  }
);
