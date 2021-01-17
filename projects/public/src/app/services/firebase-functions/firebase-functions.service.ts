import { Injectable } from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseFunctionsService {
  private readonly makeAdminFn = this.functions.httpsCallable<{emailAddress: string}, void>('admin-make');
  private readonly removeAdminFn = this.functions.httpsCallable<{emailAddress: string}, void>('admin-remove');
  private readonly restoreAdminsFn = this.functions.httpsCallable<void, string[]>('admin-restore');
  private readonly promotionEmailFn = this.functions.httpsCallable<{workshopID: string, message: string}, string[]>('email-promote');
  private readonly sendEmailFn = this.functions.httpsCallable<{workshopID: string, message: string}, string[]>('email-send');
  private readonly registerFn = this.functions
    .httpsCallable<{workshopID: string; consentToEmails: boolean}, void>('user-workshop-register');
  private readonly feedbackFn = this.functions.httpsCallable<{message: string; email?: string}, void>('feedback');

  /**
   * Calls a firebase function that grants admin privileges to a user, identified by their email address.
   * @param emailAddress - The email address of the user.
   * @returns - An observable which when subscribed to calls the firebase function. It only emits once and then completes.
   */
  public makeAdmin$(emailAddress: string): Observable<void> {
    return this.makeAdminFn({emailAddress});
  }

  /**
   * Calls a firebase function that removes admin privileges to a user, identified by their email address.
   * @param emailAddress - The email address of the user.
   * @returns - An observable which when subscribed to calls the firebase function. It only emits once and then completes.
   */
  public removeAdmin$(emailAddress: string): Observable<void> {
    return this.removeAdminFn({emailAddress});
  }

  /**
   * Calls a firebase function that grants admin privileges to a pre-defined set of users (which is set on the back-end).
   * @returns - An observable which when subscribed to calls the firebase function
   * and then emits the email addresses of the users that were granted admin privileges (even if the had them before).
   * It only emits once and then completes.
   */
  public restoreAdmins$(): Observable<string[]> {
    return this.restoreAdminsFn();
  }

  /**
   * Calls a firebase function that promotes a workshop
   * by sending an email to all users on the system who have consented to such emails
   * and aren't registered for the workshop.
   * @param workshopID - The ID of the workshop to promote.
   * @param message - The message to send in the emails.
   * @returns - An observable which when subscribed to calls the firebase function
   * and then emits the email addresses of the users that the email was sent to.
   * It only emits once and then completes.
   */
  public sendPromotionalEmail$(workshopID: string, message: string): Observable<string[]> {
    return this.promotionEmailFn({workshopID, message});
  }

  /**
   * Calls a firebase function that sends emails about a workshop
   * to all users on the system who have registered for the workshop
   * and have consented to such emails.
   * @param workshopID - The ID of the workshop to send emails about.
   * @param message - The message to send in the emails.
   * @returns - An observable which when subscribed to calls the firebase function
   * and then emits the email addresses of the users that the email was sent to.
   * It only emits once and then completes.
   */
  public sendEmail$(workshopID: string, message: string): Observable<string[]> {
    return this.sendEmailFn({workshopID, message});
  }

  /**
   * Calls a firebase function which registers a user to a workshop.
   * @param workshopID - The ID of the workshop to register to.
   * @param consentToEmails - Whether the user consents to emails about the workshop.
   * @returns - An observable which when subscribed to calls the firebase function.
   * It only emits once and then completes.
   */
  public register$(workshopID: string, consentToEmails: boolean): Observable<void> {
    return this.registerFn({workshopID, consentToEmails});
  }

  /**
   * Calls a firebase function which allows the user to send feedback.
   * @param message - The message to send.
   * @param email - An email to reply to. Only required when the user isn't authenticated or doesn't have an email.
   * @returns - An observable which when subscribed to calls the firebase function.
   * It only emits once and then completes.
   */
  public feedback$(message: string, email?: string): Observable<void> {
    return this.feedbackFn({message, email});
  }

  constructor(
    private readonly functions: AngularFireFunctions
  ) { }
}
