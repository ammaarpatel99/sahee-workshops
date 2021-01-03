import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import {Id} from '../_shared';

export interface AdminWorkshopDoc {
  name: string;
  description: string;
  datetime: Timestamp;
  videoCallLink?: string;
  feedbackLink?: string;
  recordingLink?: string;
  newSignupEmail: string;
}

export type AdminWorkshopData = AdminWorkshopDoc & Id;

export interface AdminWorkshop extends AdminWorkshopData {
  jsDate: Date;
}
