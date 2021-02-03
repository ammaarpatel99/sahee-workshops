import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {WorkshopsService} from '../../../services/workshops/workshops.service';
import {FormControl, FormGroup} from '@angular/forms';
import {LoadingService} from '../../../services/loading/loading.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {isUserWorkshop} from '../../../helpers/workshops';
import {MatHorizontalStepper} from '@angular/material/stepper';
import {ConsentService} from '../../../services/consent/consent.service';

@Component({
  selector: 'app-workshop-signup',
  templateUrl: './workshop-signup.component.html',
  styleUrls: ['./workshop-signup.component.scss']
})
export class WorkshopSignupComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper: MatHorizontalStepper | undefined;
  @Input() workshopID: string | undefined;
  // readonly loading$: Observable<boolean>;
  registered = false;
  readonly user$: Observable<boolean>;

  readonly form = new FormGroup({
    generalEmailConsent: new FormControl(true),
    emailConsent: new FormControl(true)
  });

  formControl(name: 'generalEmailConsent' | 'emailConsent'): FormControl {
    return this.form.get(name) as FormControl;
  }

  async submit(unregister: boolean = false): Promise<void> {
    if (
      this.form.disabled
      || (this.form.invalid && !unregister)
      || this.workshopID === undefined
      || this.registered === undefined
      || (this.form.pristine && this.registered && !unregister)
    ) throw new Error(`Can't submit registration.`);
    // whether to edit general consent must be evaluated here as all controls are disabled when loading
    const editGeneralConsent = this.formControl('generalEmailConsent').enabled;
    this.loadingService.startLoading();
    try {
      const workshopID = this.workshopID;
      if (this.registered) {
        if (unregister) await this.unregister(workshopID);
        else await this.changeConsent(workshopID);
      } else {
        if (editGeneralConsent) await this.changeGeneralConsent();
        await this.register(workshopID);
      }
      this.form.markAsPristine();
    } finally {
      this.loadingService.stopLoading();
    }
  }

  private unregister(workshopID: string): Promise<void> {
    return this.workshopsService.unregister$(workshopID).toPromise();
  }

  private changeGeneralConsent(): Promise<void> {
    return this.consentService.updateConsent$(this.formControl('generalEmailConsent').value).toPromise();
  }

  private register(workshopID: string): Promise<void> {
    return this.workshopsService.register$(workshopID, this.formControl('emailConsent').value).toPromise();
  }

  private changeConsent(workshopID: string): Promise<void> {
    return this.workshopsService.changeConsent$(workshopID, this.formControl('emailConsent').value).toPromise();
  }

  async stepperNextIfAlreadySignedIn(): Promise<void> {
    const user = await this.user$.pipe(take(1)).toPromise();
    if (user && !!this.stepper) this.stepper.next();
  }

  constructor(
    private readonly workshopsService: WorkshopsService,
    private readonly consentService: ConsentService,
    private readonly loadingService: LoadingService,
    auth: AngularFireAuth
  ) {
    this.subscriptions.push(
      this.watchEmailConsent$().subscribe(),
      this.disableFormWhenLoading$(this.loadingService.loading$).subscribe()
    );
    this.user$ = auth.user.pipe(map(user => !!user));
  }

  private watchEmailConsent$(): Observable<void> {
    return this.consentService.emailConsent$.pipe(
      map(consent => {
        const control = this.formControl('generalEmailConsent');
        if (consent === undefined) control.enable();
        else control.disable();
        control.setValue(consent !== false);
        control.markAsPristine();
      })
    );
  }

  private disableFormWhenLoading$(loading$: Observable<boolean>): Observable<void> {
    return loading$.pipe(
      map(loading => {
        if (loading) this.form.disable();
        else {
          this.form.enable();
          this.watchEmailConsent$().pipe(take(1)).subscribe();
        }
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(this.getWorkshop$().subscribe());
  }

  private getWorkshop$(): Observable<void> {
    if (!this.workshopID) throw new Error(`No workshop passed into workshop signup component.`);
    return this.workshopsService.getWorkshop$(this.workshopID).pipe(
      map(workshop => {
        if (!workshop) throw new Error(`No valid workshop id provided to signup component.`);
        const control = this.formControl('emailConsent');
        if (!isUserWorkshop(workshop)) {
          this.registered = false;
          control.setValue(true);
        } else {
          this.registered = true;
          control.setValue(workshop.consentToEmails);
        }
        control.markAsPristine();
      })
    );
  }

  ngAfterViewInit(): void {
    this.stepperNextIfAlreadySignedIn().then();
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
