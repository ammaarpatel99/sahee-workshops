import { Injectable } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {functions as f, PromotionalEmailParam, PromotionalEmailRes, SendEmailParam, SendEmailRes} from '@firebase-helpers';
import {Observable} from 'rxjs';
import {first, switchMap} from 'rxjs/operators';
import {AdminWorkshopsService} from '../admin-workshops/admin-workshops.service';


/**
 * A service used for sending emails.
 */
@Injectable({
  providedIn: 'root'
})
export class EmailService {
  /**
   * A function that calls the firebase function for sending promotional emails.
   * @private
   */
  private readonly _promote$ = this.functions.httpsCallable<PromotionalEmailParam, PromotionalEmailRes>(f.email.promote);
  /**
   * A function that calls the firebase function for sending emails to those registered for a workshop.
   */
  private readonly _send$ = this.functions.httpsCallable<SendEmailParam, SendEmailRes>(f.email.send);


  /**
   * An observable that sends emails promoting a workshop.
   * It sends emails to everyone who has consented to emails and not signed up to the workshop.
   * @param workshopID - The ID of the workshop.
   * @param message - The promotional message to send.
   * @returns - An observable that emits emails of the people the email was sent to, and then completes.
   */
  promote$(workshopID: string, message: string): Observable<string[]> {
    return this.adminWorkshopsService.workshop$(workshopID).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(`Can't promote workshop as either user isn't admin or workshop doesn't exist.`);
        return this._promote$({workshopID, message});
      })
    );
  }


  /**
   * An observable that sends emails about a workshop to everyone registered for the workshop.
   * @param workshopID - The ID of the workshop.
   * @param message - The message to send.
   * @returns - An observable that emits the emails of people who the message was sent to, and then completes.
   */
  send$(workshopID: string, message: string): Observable<string[]> {
    return this.adminWorkshopsService.workshop$(workshopID).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(`Can't send email about workshop as either user isn't admin or workshop doesn't exist.`);
        return this._send$({workshopID, message});
      })
    );
  }


  constructor(
    private readonly functions: AngularFireFunctions,
    private readonly adminWorkshopsService: AdminWorkshopsService
  ) { }
}
