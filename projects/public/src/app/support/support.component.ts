import { Component } from '@angular/core';
import {CleanRxjs} from '../helpers/clean-rxjs/clean-rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {distinctUntilChanged, finalize, map, shareReplay, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import {SupportService} from '../services/support/support.service';


@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent extends CleanRxjs {
  /**
   * An observable that emits a class to be put on the
   * component container to make the content responsive.
   */
  readonly containerClass$ = this.getContainerClass$();
  /**
   * Internal field for {@link requireEmail}.
   * @private
   */
  private _requireEmail = true;
  /**
   * Internal field for {@link emailPlaceholder}.
   * @private
   */
  private _emailPlaceholder = 'you@example.com';


  /**
   * Whether the form must require an email, or whether it is optional.
   */
  get requireEmail(): boolean {
    return this._requireEmail;
  }


  /**
   * The placeholder to display in the email field.
   */
  get emailPlaceholder(): string {
    return this._emailPlaceholder;
  }


  /**
   * The form holding the fields required for a support request.
   */
  readonly form = new FormGroup({
    message: new FormControl('', Validators.required),
    provideEmail: new FormControl(true),
    email: new FormControl('', [Validators.email, Validators.required])
  });


  /**
   * The message form control from {@link form}.<br/>
   * This is the message that will be sent in the support request.
   */
  get message(): FormControl {
    const control = this.form.get('message');
    if (!control || !(control instanceof FormControl)) {
      throw new Error(`Field message doesn't exist on form.`);
    }
    return control;
  }


  /**
   * The provideEmail form control from {@link form}<br/>
   * This is whether the user is providing an email to reply to.
   */
  get provideEmail(): FormControl {
    const control = this.form.get('provideEmail');
    if (!control || !(control instanceof FormControl)) {
      throw new Error(`Field provideEmail doesn't exist on form.`);
    }
    return control;
  }


  /**
   * The email form control from {@link form}.<br/>
   * This is the email to reply to.
   */
  get email(): FormControl {
    const control = this.form.get('email');
    if (!control || !(control instanceof FormControl)) {
      throw new Error(`Field email doesn't exist on form.`);
    }
    return control;
  }


  /**
   * Used to send the support request.
   */
  submit(): void {
    if (this.form.invalid || this.form.disabled) {
      throw new Error(`Can't submit support request.`);
    }
    this.form.disable();
    const email = this.provideEmail.value ? this.email.value : undefined;
    this.supportService
      .support$(this.message.value, email)
      .pipe(
        finalize(() => this.form.enable())
      ).subscribe();
  }


  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly auth: AngularFireAuth,
    private readonly supportService: SupportService
  ) {
    super();
    this.watchUserEmail();
  }


  /**
   * Used to watch the user's email and update
   * {@link form} and {@link requireEmail} appropriately.
   * @private
   */
  private watchUserEmail(): void {
    this.auth.user.pipe(
      map(user => user?.email || null),
      distinctUntilChanged(),
      map(email => {
        this._requireEmail = !email;
        this.provideEmail.reset(this.requireEmail);
        this.email.setValidators([
          Validators.email,
          email ? Validators.nullValidator : Validators.required
        ]);
        this._emailPlaceholder = email || 'you@example.com';
        this.email.reset('');
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  /**
   * Provides the value for {@link containerClass$}.
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
}
