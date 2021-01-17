import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, switchMapTo, take} from 'rxjs/operators';
import {FirebaseFunctionsService} from '../firebase-functions/firebase-functions.service';
import {AdminService} from '../admin/admin.service';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  /**
   * Used to send a promotional email using {@link FirebaseFunctionsService#sendPromotionalEmail$}.
   * <br/>
   * Requires user to be admin, as assessed by {@link AdminService#isAdmin$}.
   * Outside of production it doesn't send the emails and returns no email addresses (an empty array).
   * @param workshopID - The ID for the workshop to promote.
   * @param message - The message to send in the email.
   * @returns - An observable which when subscribed to sends the emails and emits the emails addresses that it was sent to.
   * It emits once and then completes.
   */
  public promote$(workshopID: string, message: string): Observable<string[]> {
    return this.adminService.isAdmin$.pipe(
      take(1),
      map(isAdmin => {
        if (isAdmin !== true) throw new Error(`User isn't admin so can't send promotional emails.`);
      }),
      this.switchIfProduction(this.functions.sendPromotionalEmail$(workshopID, message), of([]))
    );
  }

  /**
   * Used to send an email using {@link FirebaseFunctionsService#sendEmail$}.
   * <br/>
   * Requires user to be admin, as assessed by {@link AdminService#isAdmin$}.
   * Outside of production it doesn't send the emails and returns no email addresses (an empty array).
   * @param workshopID - The ID for the workshop to send emails about.
   * @param message - The message to send in the email.
   * @returns - An observable which when subscribed to sends the emails and emits the emails addresses that it was sent to.
   * It emits once and then completes.
   */
  public send$(workshopID: string, message: string): Observable<string[]> {
    return this.adminService.isAdmin$.pipe(
      take(1),
      map(isAdmin => {
        if (isAdmin !== true) throw new Error(`User isn't admin so can't send emails.`);
      }),
      this.switchIfProduction(this.functions.sendEmail$(workshopID, message), of([]))
    );
  }

  public feedback$(message: string, email?: string): Observable<void> {
    return EmailService.switchIfProduction$(this.functions.feedback$(message, email), of());
  }

  constructor(
    private readonly functions: FirebaseFunctionsService,
    private readonly adminService: AdminService
  ) { }

  /**
   * An observable operator that switches to different observables depending on if the application is built in production configuration.
   * @param obs$ - Observable to switch to if in production.
   * @param fallback$ - Observable to switch to if not in production.
   * @returns - RxJS operator.
   */
  private switchIfProduction<T>(obs$: Observable<T>, fallback$: Observable<T>): (source: Observable<any>) => Observable<T> {
    return source => source.pipe(
      switchMapTo(EmailService.switchIfProduction$(obs$, fallback$))
    );
  }

  private static switchIfProduction$<T>(obs$: Observable<T>, fallback$: Observable<T>): Observable<T> {
    return environment.production ? obs$ : fallback$;
  }

}
