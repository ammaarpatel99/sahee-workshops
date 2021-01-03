import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import {Id} from '../_shared';

export interface PublicWorkshopDoc {
  name: string;
  description: string;
  datetime: Timestamp;
}

export type PublicWorkshopData = PublicWorkshopDoc & Id;

export interface PublicWorkshop extends PublicWorkshopData {
  jsDate: Date;
}
