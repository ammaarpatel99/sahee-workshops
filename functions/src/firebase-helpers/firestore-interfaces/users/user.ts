import {Id} from '../shared';
import firebase from 'firebase/app';
import UserInfo = firebase.UserInfo;

export interface UserDoc extends UserInfo {
  consentToEmails?: boolean;
}

export type User = UserDoc & Id;
