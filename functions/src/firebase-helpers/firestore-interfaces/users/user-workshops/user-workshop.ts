import {Id} from '../../shared';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export interface UserWorkshopDoc {
  name: string;
  description: string;
  datetime: Timestamp;
  videoCallLink?: string;
  feedbackLink?: string;
  recordingLink?: string;
  consentToEmails: boolean;
}

export type UserWorkshopData = UserWorkshopDoc & Id;

export interface UserWorkshop extends UserWorkshopData {
  jsDate: Date;
}
