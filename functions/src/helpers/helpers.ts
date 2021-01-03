import * as functions from 'firebase-functions';
import {FunctionsErrorCode} from "firebase-functions/lib/providers/https";

/**
 * @throws functions.https.HttpError('invalid-argument', errorMessage)
 */
export function extractStringParam(param: any, errorCode: FunctionsErrorCode, errorMessage: string): string {
  if (!param || typeof param !== "string") throw new functions.https.HttpsError(errorCode, errorMessage);
  return param;
}

/**
 * @throws functions.https.HttpError('invalid-argument', errorMessage)
 */
export function extractBooleanParam(param: any, errorCode: FunctionsErrorCode, errorMessage: string): boolean {
  if (!param || typeof param !== "boolean") throw new functions.https.HttpsError(errorCode, errorMessage);
  return param;
}
