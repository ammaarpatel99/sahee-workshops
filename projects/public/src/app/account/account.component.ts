import {Component, OnDestroy} from '@angular/core';
import {finalize, map, shareReplay, takeUntil} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {SignedInState, UserService} from '../services/user/user.service';
import {ConsentService} from '../services/consent/consent.service';
import {CleanRxjs} from '../helpers/clean-rxjs/clean-rxjs';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent extends CleanRxjs implements OnDestroy {
  /**
   * A form control for settings whether the user consents to general emails.
   */
  readonly consentToEmails = new FormControl();
  /**
   * An observable that emits whether the user's email is verified.
   */
  readonly emailNotVerified$ = this.getEmailNotVerified$();
  /**
   * An observable that emits a class to be put on the component container to make the content responsive.
   */
  readonly containerClass$ = this.getContainerClass$();


  /**
   * Updates user consent to general emails.
   */
  updateConsent(): void {
    if (
      this.consentToEmails.pristine ||
      this.consentToEmails.invalid ||
      this.consentToEmails.disabled
    ) throw new Error(`Can't change consent.`);
    this.consentToEmails.disable();
    this.consentService.updateConsent$(this.consentToEmails.value).pipe(
      finalize(() => {
        this.consentToEmails.markAsPristine();
        this.consentToEmails.enable();
      })
    ).subscribe();
  }


  /**
   * To be called when a used signs out.<br/>
   * Calls {@link UserService#signedOut$}.
   */
  signedOut(): Promise<void> {
    return this.userService.signedOut$().toPromise();
  }


  constructor(
    private readonly userService: UserService,
    private readonly consentService: ConsentService,
    private readonly breakpointObserver: BreakpointObserver
  ) {
    super();
    this.watchEmailConsent();
  }


  /**
   * Watch whether the user has consented to emails
   * and update {@link consentToEmails} appropriately.
   * @private
   */
  private watchEmailConsent(): void {
    this.consentService.emailConsent$.pipe(
      map(consent => {
        this.consentToEmails.reset(consent !== false);
        if (consent === null) this.consentToEmails.markAsDirty();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  /**
   * Provides value for {@link containerClass$}.
   * @private
   */
  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet
    ]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }


  /**
   * Provides the value for {@link emailNotVerified$}.
   * @private
   */
  private getEmailNotVerified$(): Observable<boolean> {
    return this.userService.userState$.pipe(
      map(userState => {
        return userState.signedInState === SignedInState.EMAIL_NOT_VERIFIED;
      })
    );
  }
}
