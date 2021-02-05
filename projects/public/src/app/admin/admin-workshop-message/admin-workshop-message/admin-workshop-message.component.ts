import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {distinctUntilChanged, filter, finalize, map, switchMap, take} from 'rxjs/operators';
import {AdminWorkshop} from '../../../../../../../functions/src/firebase-helpers/firestore-interfaces';
import {forkJoin, Observable, of, Subscription} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoadingService} from '../../../services/loading/loading.service';
import {AdminWorkshopsService} from '../../../services/admin-workshops/admin-workshops.service';
import {EmailService} from '../../../services/email/email.service';

@Component({
  selector: 'app-admin-workshop-message',
  templateUrl: './admin-workshop-message.component.html',
  styleUrls: ['./admin-workshop-message.component.scss']
})
export class AdminWorkshopMessageComponent implements OnInit, OnDestroy {
  @Input() workshop$: Observable<AdminWorkshop | undefined> = of(undefined);
  private _sentEmail: {message: string; emailAddresses: string[]}|null = null;

  readonly form = new FormGroup({
    email: new FormControl('', Validators.required),
    editNewSignupEmail: new FormControl(false),
    newSignupEmail: new FormControl('', Validators.required)
  });
  readonly email: FormControl = this.form.get('email') as FormControl;
  readonly newSignupEmail: FormControl = this.form.get('newSignupEmail') as FormControl;
  readonly editNewSignupEmail: FormControl = this.form.get('editNewSignupEmail') as FormControl;

  get sentEmail(): { message: string; emailAddresses: string[] } | null {
    return this._sentEmail;
  }

  reset(): void {
    if (this.form.pristine || this.form.disabled) {
      throw new Error(`Can't reset workshop message form.`);
    }
    this.loadingService.startLoading();
    this.form.reset();
    this.editNewSignupEmail.setValue(false);
    this.workshop$.pipe(
      take(1),
      finalize(() => this.loadingService.stopLoading()),
      filter(workshop => !!workshop),
      map(workshop => (workshop as AdminWorkshop).newSignupEmail),
      map(newSignupEmail => this.newSignupEmail.setValue(newSignupEmail))
    ).subscribe();
  }

  sendEmail(): void {
    if (this.form.pristine || this.form.invalid || this.form.disabled) {
      throw new Error(`Can't send workshop email.`);
    }
    this.loadingService.startLoading();
    this.workshop$.pipe(
      take(1),
      finalize(() => {
        this.form.markAsPristine();
        this.loadingService.stopLoading();
      }),
      filter(workshop => !!workshop),
      map(workshop => (workshop as AdminWorkshop).id),
      switchMap(id => {
        const sendEmail$ = this.emailService.send$(id, this.email.value);
        let updateNewSignupEmail$: Observable<void> = of(undefined);
        if (this.editNewSignupEmail.value && this.newSignupEmail.dirty) {
          updateNewSignupEmail$ = this.adminWorkshopsService
            .update$(id, {newSignupEmail: this.newSignupEmail.value});
        }
        return forkJoin([updateNewSignupEmail$, sendEmail$]);
      }),
      map(res => {
        this._sentEmail = {message: this.email.value, emailAddresses: res[1]};
      })
    ).subscribe();
  }

  constructor(
    private readonly adminWorkshopsService: AdminWorkshopsService,
    private readonly emailService: EmailService,
    private readonly loadingService: LoadingService
  ) {
    this.subscriptions.push(
      this.disableWhenLoading$(this.loadingService.loading$).subscribe(),
      this.manageNewSignupEmailEnabledState$().subscribe()
    );
  }

  private disableWhenLoading$(loading$: Observable<boolean>): Observable<void> {
    return loading$.pipe(
      map(loading => {
        if (loading) this.form.disable();
        else {
          this.form.enable();
          if (!this.editNewSignupEmail.value) this.newSignupEmail.disable();
        }
      })
    );
  }

  private manageNewSignupEmailEnabledState$(): Observable<void> {
    return this.editNewSignupEmail.valueChanges.pipe(
      map(val => {
        if (typeof val === 'boolean') {
          if (val) this.newSignupEmail.enable();
          else this.newSignupEmail.disable();
        }
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.watchNewSignupEmail$().subscribe()
    );
  }

  private watchNewSignupEmail$(): Observable<void> {
    return this.workshop$.pipe(
      filter(workshop => !!workshop),
      map(workshop => (workshop as AdminWorkshop).newSignupEmail),
      distinctUntilChanged(),
      map(newSignupEmail => {
        this.newSignupEmail.reset(newSignupEmail);
        this.editNewSignupEmail.setValue(false);
      })
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
