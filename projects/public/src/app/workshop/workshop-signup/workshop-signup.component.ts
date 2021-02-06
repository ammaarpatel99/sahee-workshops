import {AfterViewInit, Component, Input, OnDestroy, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, take, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatHorizontalStepper} from '@angular/material/stepper';
import {ConsentService} from '../../services/consent/consent.service';
import {UserWorkshopsService} from '../../services/user-workshops/user-workshops.service';
import {CleanRxjs} from '../../helpers/clean-rxjs/clean-rxjs';


@Component({
  selector: 'app-workshop-signup',
  templateUrl: './workshop-signup.component.html',
  styleUrls: ['./workshop-signup.component.scss']
})
export class WorkshopSignupComponent extends CleanRxjs implements AfterViewInit, OnDestroy {
  /**
   * An observable that emits whether there is a user signed in or not.
   */
  readonly user$ = this.getUser$();

  /**
   * Internal field for {@link registered}.
   * @private
   */
  private _registered?: boolean;
  /**
   * Whether the user is registered for the workshop.
   * Should be false if there is no user.
   */
  get registered(): boolean {
    const val = this._registered;
    if (val === undefined) throw new Error(`No value for registered in signup component.`);
    return val;
  }


  /**
   * The ID of the workshop the user is registering/registered for.
   */
  @Input() workshopID?: string;

  /**
   * Internal field for {@link workshopID} that throws an error if it is null.
   */
  get _workshopID(): string {
    const id = this.workshopID;
    if (!id) throw new Error(`No workshop ID in signup component.`);
    return id;
  }


  /**
   * Whether the user has consented to emails for this workshop.<br/>
   * If they aren't registered, the value should be null.
   * @param val
   */
  @Input()
  set consent(val: boolean | null) {
    this._registered = val === null;
    const _val = val === null ? true : val;
    if (_val === this.emailConsent.value) return;
    this.emailConsent.setValue(val === null ? true : val);
    this.emailConsent.markAsPristine();
  }


  /**
   * Internal field for {@link stepper}.
   * @private
   */
  private _stepper?: MatHorizontalStepper;
  /**
   * The stepper in the component.
   * Referenced here so it can be manipulated in the component class.
   */
  @ViewChild('stepper')
  set stepper(stepper: MatHorizontalStepper) {
    this._stepper = stepper;
  }
  get stepper(): MatHorizontalStepper {
    const stepper = this._stepper;
    if (!stepper) throw new Error(`There is no reference to the horizontal stepper in the component class.`);
    return stepper;
  }


  /**
   * The form used for the user to submit their consent when registering or changing consent.
   */
  readonly form = new FormGroup({
    generalEmailConsent: new FormControl(true),
    emailConsent: new FormControl(true)
  });


  /**
   * The form control for general email consent. <br/>
   * The getter gets it from {@link form}.
   */
  get generalEmailConsent(): FormControl {
    const control = this.form.get('generalEmailConsent');
    if (!control || !(control instanceof FormControl)) throw new Error(`No general email consent form control.`);
    return control;
  }


  /**
   * The form control for email consent. <br/>
   * The getter gets it from {@link form}.
   */
  get emailConsent(): FormControl {
    const control = this.form.get('emailConsent');
    if (!control || !(control instanceof FormControl)) throw new Error(`No email consent form control.`);
    return control;
  }


  /**
   * Submit the form - {@link form}.
   * @param unregister - Whether the submission is to unregister from the workshop.
   */
  async submit(unregister: boolean = false): Promise<void> {
    if (
      this.form.disabled
      || (this.form.pristine && this.registered && !unregister)
    ) throw new Error(`Can't submit registration.`);
    this.form.disable();
    try {
      if (this.registered) {
        if (unregister) await this.unregister();
        else await this.changeConsent();
      } else {
        if (this.generalEmailConsent.enabled) await this.changeGeneralConsent();
        await this.register();
      }
      this.form.markAsPristine();
    } finally {
      this.form.enable();
    }
  }


  /**
   * Unregister the user from the workshop.
   * @private
   */
  private unregister(): Promise<void> {
    return this.workshopsService.unregister$(this._workshopID).toPromise();
  }


  /**
   * Change the user's general consent to emails.
   * @private
   */
  private changeGeneralConsent(): Promise<void> {
    return this.consentService.updateConsent$(this.generalEmailConsent.value).toPromise();
  }


  /**
   * Register the user for the workshop.
   * @private
   */
  private register(): Promise<void> {
    return this.workshopsService.register$(this._workshopID, this.emailConsent.value).toPromise();
  }


  /**
   * Change the user's consent to emails about the workshop.
   * @private
   */
  private changeConsent(): Promise<void> {
    return this.workshopsService.updateConsent$(this._workshopID, this.emailConsent.value).toPromise();
  }


  /**
   * Calls next on the stepper if the user is already signed in
   */
  async stepperNextIfAlreadySignedIn(): Promise<void> {
    const user = await this.user$.pipe(take(1)).toPromise();
    if (!user) return;
    this.stepper.next();
  }


  constructor(
    private readonly workshopsService: UserWorkshopsService,
    private readonly consentService: ConsentService,
    private readonly auth: AngularFireAuth
  ) {
    super();
    this.watchEmailConsent$();
  }


  /**
   * Watches the user's general email consent, and adjusts {@link generalEmailConsent} appropriately.<br/>
   * i.e. If the user has set their general email consent, the {@link generalEmailConsent} is disabled, and vice versa.
   * @private
   */
  private watchEmailConsent$(): void {
    this.consentService.emailConsent$.pipe(
      distinctUntilChanged((x, y) => x === y || (x !== null && y !== null)),
      map(consent => {
        const control = this.generalEmailConsent;
        if (consent === null) {
          control.setValue(true);
          control.enable();
        } else control.disable();
        control.markAsPristine();
      }),
      takeUntil(this.destroy$)
    );
  }


  /**
   * Provides the value for {@link user$}.
   * @private
   */
  private getUser$(): Observable<boolean> {
    return this.auth.user.pipe(
      map(user => !!user),
      takeUntil(this.destroy$),
      shareReplay(1)
    );
  }


  ngAfterViewInit(): void {
    this.stepperNextIfAlreadySignedIn().then();
  }
}
