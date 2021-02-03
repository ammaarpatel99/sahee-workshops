import {Component, OnDestroy} from '@angular/core';
import {finalize, map, shareReplay} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {LoadingService} from '../../services/loading/loading.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {UserService} from '../../services/user/user.service';
import {ConsentService} from '../../services/consent/consent.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnDestroy {
  readonly consentToEmails = new FormControl();
  readonly emailNotVerified$: Observable<boolean>;
  readonly containerClass$: Observable<'wide-container' | 'thin-container'>;

  changeConsent(): void {
    if (this.consentToEmails.pristine || this.consentToEmails.invalid || this.consentToEmails.disabled) {
      throw new Error(`Can't change consent.`);
    }
    this.loadingService.startLoading();
    this.consentService.updateConsent$(this.consentToEmails.value).pipe(
      finalize(() => {
        this.consentToEmails.markAsPristine();
        this.loadingService.stopLoading();
      })
    ).subscribe();
  }

  signedOut(): Promise<void> {
    return this.userService.signedOut$().toPromise();
  }

  constructor(
    private readonly userService: UserService,
    private readonly consentService: ConsentService,
    private readonly loadingService: LoadingService,
    private readonly auth: AngularFireAuth,
    private readonly breakpointObserver: BreakpointObserver
  ) {
    this.emailNotVerified$ = this.getEmailNotVerified$();
    this.containerClass$ = this.getContainerClass$();
    this.subscriptions.push(
      this.disableWhenLoading$(this.loadingService.loading$).subscribe(),
      this.watchEmailConsent$().subscribe()
    );
  }

  private disableWhenLoading$(loading$: Observable<boolean>): Observable<void> {
    return loading$.pipe(
      map(loading => {
        if (loading) this.consentToEmails.disable();
        else this.consentToEmails.enable();
      })
    );
  }

  private watchEmailConsent$(): Observable<void> {
    return this.consentService.emailConsent$.pipe(
      map(consent => {
        this.consentToEmails.reset(consent);
      })
    );
  }

  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      shareReplay(1)
    );
  }

  private getEmailNotVerified$(): Observable<boolean> {
    return this.auth.user.pipe(
      map(user => {
        if (!user) return false;
        return !user.emailVerified;
      })
    );
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
