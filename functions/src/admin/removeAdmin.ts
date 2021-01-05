import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {extractStringParam} from "../helpers/helpers";
import {ensureIsAdmin} from "../helpers/admin";

export const removeAdmin = functions.https.onCall(async (data, context) => {
  try {
    const uid = extractStringParam(context.auth?.uid, "unauthenticated", 'Missing user');
    await ensureIsAdmin(uid);
    const newAdmin = extractStringParam(data?.uid, "invalid-argument", 'Missing uid for old admin');
    const claims = (await admin.auth().getUser(newAdmin)).customClaims || {};
    claims.admin = null;
    await admin.auth().setCustomUserClaims(newAdmin, claims);
    return {uid: newAdmin};
  } catch (e) {
    if (e instanceof functions.https.HttpsError) return e;
    throw e;
  }
})
