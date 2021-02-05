import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Router} from '@angular/router';
import {SignedInState, UserService} from '../../services/user/user.service';
import {CleanRxjs} from '../../helpers/clean-rxjs/clean-rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {LinkMenuItem} from 'ngx-auth-firebaseui';


type EmailIssue = 'email' | 'verification' | 'consent' | null;


@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss']
})
export class MainToolbarComponent extends CleanRxjs implements OnDestroy {
  /**
   * Whether to display a toggle for the sidenav drawer.
   * Defaults to false.
   */
  @Input() displayDrawerToggle = false;
  /**
   * Emits when the user clicked the sidenav drawer toggle.
   */
  @Output() toggleDrawer = new EventEmitter<void>();
  /**
   * The title to display in the toolbar.
   */
  @Input() title?: string;
  /**
   * Whether a user is signed in.
   * It is used to decide whether to display the sign in button or the account button
   */
  private _signedIn = false;
  /**
   * What issue to display under the main toolbar.
   * Null is used to not display an issue.
   * @private
   */
  private _emailIssue: EmailIssue = null;
  /**
   * A flag to hold whether the user has dismissed the warning about their email.
   * @private
   */
  private _dismissedEmailIssue = false;


  /**
   * Links to be displayed in the menu from the account button.
   * This is in addition to the sign out button.
   */
  readonly accountBtnLinks: LinkMenuItem[] = [
    {text: 'Account', callback: () => this.router.navigateByUrl('/account')}
  ];


  /**
   * Get {@link _signedIn}.
   */
  get signedIn(): boolean {
    return this._signedIn;
  }


  /**
   * Get {@link _emailIssue}.
   */
  get emailIssue(): EmailIssue {
    return this._emailIssue;
  }


  /**
   * Get {@link _dismissedEmailIssue}.
   */
  get dismissedEmailIssue(): boolean {
    return this._dismissedEmailIssue;
  }


  /**
   * Dismiss email issue warning by setting {@link _dismissedEmailIssue}.
   */
  dismissEmailIssue(): void {
    this._dismissedEmailIssue = true;
  }


  /**
   * Redirects to the home page.
   * The location is dependent on the current location.
   * Specifically, if the user is in the admin portal, then the redirect is to /admin,
   * otherwise the redirect is to /.
   */
  redirectToHomePage(): Promise<void> {
    const url = this.router.url;
    let redirectUrl = '/';
    if (url.startsWith('/admin')) redirectUrl = '/admin';
    return new Promise<void>((resolve, reject) => {
      this.router.navigateByUrl(redirectUrl)
        .then(value => {
          if (value) resolve();
          else reject(new Error(`Couldn't redirect to home page.`));
        })
        .catch(reject);
    });
  }


  /**
   * If the current page isn't the sign in page,
   * then redirect to the sign in page by calling {@link UserService#signIn$}.
   */
  signIn(): Promise<void> | void {
    if (this.router.url === UserService.SIGN_IN_URL) return;
    return this.userService.signIn$().toPromise();
  }


  /**
   * To be called after signing out.<br/>
   * Calls {@link UserService#signedOut$}.
   */
  signedOut(): Promise<void> {
    return this.userService.signedOut$().toPromise();
  }


  constructor(
    private readonly router: Router,
    private readonly userService: UserService
  ) {
    super();
    this.watchUserState();
  }


  /**
   * Watches {@link UserService#userState$} and adapts internal state appropriately.
   * @private
   */
  private watchUserState(): void {
    this.userService.userState$.pipe(
      map(userState => {
        this._signedIn = userState.signedInState !== SignedInState.NO_USER;
        switch (userState.signedInState) {
          case SignedInState.NO_EMAIL:
            this._emailIssue = 'email';
            break;
          case SignedInState.EMAIL_NOT_VERIFIED:
            this._emailIssue = 'verification';
            break;
          case SignedInState.CONSENT_NOT_SET:
            this._emailIssue = 'consent';
            break;
          default:
            this._emailIssue = null;
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

}
