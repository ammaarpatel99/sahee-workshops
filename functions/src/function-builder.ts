import {region} from 'firebase-functions';

const functions = region('europe-west2');

export const onCall = functions.https.onCall;
export const firestoreFn = functions.firestore;
export const storageFn = functions.storage.object;
