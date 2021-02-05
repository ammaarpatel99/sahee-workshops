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
    return this.ifValidWorkshop$(workshopID, this._promote$({workshopID, message}),
      `Failed send promotional email for workshop`);
  }


  /**
   * An observable that sends emails about a workshop to everyone registered for the workshop.
   * @param workshopID - The ID of the workshop.
   * @param message - The message to send.
   * @returns - An observable that emits the emails of people who the message was sent to, and then completes.
   */
  send$(workshopID: string, message: string): Observable<string[]> {
    return this.ifValidWorkshop$(workshopID, this._send$({workshopID, message}),
      `Failed send email about workshop`);
  }


  /**
   * An observable which switches to obs$ or throws an error with the message errMessage.<br/>
   * The error is thrown if {@link AdminWorkshopsService#workshop$} emits null.
   * @param workshopID - The ID of the workshop to test for.
   * @param obs$ - The observable to switch to.
   * @param errMessage - The error message.
   * @private
   */
  private ifValidWorkshop$<T>(workshopID: string, obs$: Observable<T>, errMessage: string): Observable<T> {
    return this.adminWorkshopsService.workshop$(workshopID).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(errMessage);
        return obs$;
      })
    );
  }


  constructor(
    private readonly functions: AngularFireFunctions,
    private readonly adminWorkshopsService: AdminWorkshopsService
  ) { }
}
