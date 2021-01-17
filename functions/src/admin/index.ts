import {https} from 'firebase-functions';
import {auth} from "firebase-admin";
import {CallableContext} from "firebase-functions/lib/providers/https";

const onCall = https.onCall;
const HttpsError = https.HttpsError;


const CORE_ADMIN_EMAILS = [
  `sajedapat@gmail.com`,
  `ammaarpatel99@gmail.com`,
];


export const make = onCall((data, context) => {
  return editClaims(data, context, grantAdminClaimsFn);
});

export const remove = onCall((data, context) => {
  return editClaims(data, context, claims => {
    if (claims?.admin !== true) return null;
    delete claims.admin;
    return claims;
  });
});

export const restore = onCall(async () => {
  const promises: Promise<string | null>[] = [];
  for (const emailAddress of CORE_ADMIN_EMAILS) {
    promises.push(new Promise<string | null>((resolve, reject) => {
      editClaimsByEmail(emailAddress, grantAdminClaimsFn)
        .then(() => resolve(emailAddress))
        .catch(e => {
          if (e instanceof HttpsError) resolve(null);
          else reject(e);
        })
    }))
  }
  return (
    await Promise.all(promises)
  ).filter(x => x !== null) as string[];
})

function grantAdminClaimsFn(claims: {[p: string]: any} | undefined): {[p: string]: any} | null {
  if (claims?.admin === true) return null;
  const newClaims = claims || {};
  newClaims.admin = true;
  return newClaims;
}

async function editClaims(
  data: any, context: CallableContext,
  claimsFn: (claims: {[p: string]: any} | undefined) => {[p: string]: any} | null
): Promise<void> {
  const uid = context.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", 'No user found.');
  const user = await auth().getUser(uid);
  if (user.customClaims?.admin !== true)
    throw new HttpsError('permission-denied', 'User must be an admin.');
  const emailAddress = data.emailAddress;
  if (typeof emailAddress !== "string") throw new HttpsError('invalid-argument', 'Must provide emailAddress.');
  return editClaimsByEmail(emailAddress, claimsFn);
}

async function editClaimsByEmail(
  emailAddress: string,
  claimsFn: (claims: {[p: string]: any} | undefined) => {[p: string]: any} | null
): Promise<void> {
  let user;
  try {
    user = await auth().getUserByEmail(emailAddress);
  } catch (e) {
    throw new HttpsError('invalid-argument', 'No user with provided emailAddress.', e);
  }
  const claims = claimsFn(user.customClaims);
  if (!claims) return;
  return auth().setCustomUserClaims(user.uid, claims);
}
