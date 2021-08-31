import firebase from 'firebase/app';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserWorkshop, PublicWorkshop} from '@firebase-helpers';
import Timestamp = firebase.firestore.Timestamp;


export function addJSDates<T extends {datetime: Timestamp}>(): (source: Observable<T[]>) => Observable<(T & {jsDate: Date})[]> {
  return source => source.pipe(
    map(workshops => {
      const data: (T & {jsDate: Date})[] = [];
      for (const w of workshops) data.push({...w, jsDate: w.datetime.toDate()});
      return data;
    })
  );
}


export function orderByDate<T extends {jsDate: Date}>(): (source: Observable<T[]>) => Observable<T[]> {
  return source => source.pipe(
    map(workshops => workshops.sort((a, b) => b.jsDate.getTime() - a.jsDate.getTime()))
  );
}


export function isUserWorkshop(workshop: Readonly<UserWorkshop> | Readonly<PublicWorkshop>): workshop is Readonly<UserWorkshop> {
  return (workshop as Readonly<UserWorkshop>).consentToEmails !== undefined;
}

export type Workshop = PublicWorkshop | UserWorkshop;
