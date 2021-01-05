import { Injectable } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';
import {filter, switchMap, take} from 'rxjs/operators';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly promoteFn = this.functions.httpsCallable<{uid: string, workshopID: string, email: string}, void>('email-promote');
  private readonly sendFn = this.functions.httpsCallable<{uid: string, workshopID: string, email: string}, void>('email-send');

  promote$(workshopID: string, email: string): Observable<void> {
    return this.auth.user.pipe(
      take(1),
      filter(user => !!user),
      switchMap(user => this.promoteFn({workshopID, email, uid: (user as firebase.User).uid}))
    );
  }

  send$(workshopID: string, email: string): Observable<void> {
    return this.auth.user.pipe(
      take(1),
      filter(user => !!user),
      switchMap(user => this.sendFn({workshopID, email, uid: (user as firebase.User).uid}))
    );
  }

  constructor(
    private functions: AngularFireFunctions,
    private auth: AngularFireAuth
  ) { }
}
