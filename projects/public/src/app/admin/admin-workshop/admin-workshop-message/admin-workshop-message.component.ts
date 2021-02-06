import {Component, Input, OnDestroy} from '@angular/core';
import {finalize, map, takeUntil} from 'rxjs/operators';
import {AdminWorkshop} from '@firebase-helpers';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AdminWorkshopsService} from '../../services/admin-workshops/admin-workshops.service';
import {EmailService} from '../services/email/email.service';
import {CleanRxjs} from '../../../helpers/clean-rxjs/clean-rxjs';


interface SentEmail {
  message: string;
  emailAddresses: string[];
}


@Component({
  selector: 'app-admin-workshop-message',
  templateUrl: './admin-workshop-message.component.html',
  styleUrls: ['./admin-workshop-message.component.scss']
})
export class AdminWorkshopMessageComponent extends CleanRxjs implements OnDestroy {
  /**
   * Internal for {@link workshop}.
   * @private
   */
  private _workshop: AdminWorkshop | null = null;
  /**
   * The workshop that the user is trying to send a message for.
   */
  @Input()
  set workshop(workshop: AdminWorkshop | null) {
    if (workshop) this.reset();
    this._workshop = workshop;
  }
  get workshop(): AdminWorkshop | null {
    return this._workshop;
  }


  /**
   * Gets {@link workshop}, but throws an error if it is null.
   */
  getWorkshop(): AdminWorkshop {
    const workshop = this.workshop;
    if (!workshop) throw new Error(`No workshop to get.`);
    return workshop;
  }


  /**
   * Internal for {@link sentEmail}.
   * @private
   */
  private _sentEmail: SentEmail | null = null;
  /**
   * The most recently sent email's details.
   */
  get sentEmail(): SentEmail | null {
    return this._sentEmail;
  }


  /**
   * The form used to edit the message to send.
   */
  readonly form = new FormGroup({
    email: new FormControl('', Validators.required),
    editNewSignupEmail: new FormControl(false),
    newSignupEmail: new FormControl('', Validators.required)
  });


  /**
   * The email field from {@link form}.
   */
  get email(): FormControl {
    return this.getFormControl('email');
  }


  /**
   * The new signup email field from {@link form}.
   */
  get newSignupEmail(): FormControl {
    return this.getFormControl('newSignupEmail');
  }


  /**
   * The edit new signup email field from {@link form}.
   */
  get editNewSignupEmail(): FormControl {
    return this.getFormControl('editNewSignupEmail');
  }


  /**
   * A function to get the form control for a field from {@link form}.
   * If the form control doesn't exist, it throws an error.
   * @param field - The name of the field.
   * @private
   */
  private getFormControl(field: 'email' | 'editNewSignupEmail' | 'newSignupEmail'): FormControl {
    const control = this.form.get(field);
    if (!control || !(control instanceof FormControl)) {
      throw new Error(`No form control with name ${field}`);
    }
    return control;
  }


  /**
   * Resets the form.
   */
  reset(): void {
    if (this.form.pristine || this.form.disabled) {
      throw new Error(`Can't reset workshop message form.`);
    }
    this.form.reset();
    this.editNewSignupEmail.setValue(false);
    this.newSignupEmail.setValue(this.getWorkshop().newSignupEmail);
  }


  /**
   * Sends the email and updates the new signup email as appropriate.
   */
  async sendEmail(): Promise<void> {
    if (this.form.invalid || this.form.disabled) {
      throw new Error(`Can't send workshop email.`);
    }
    this.form.disable();
    const workshop = this.getWorkshop();

    if (this.editNewSignupEmail.value && this.newSignupEmail.dirty) {
      await this.adminWorkshopsService
        .update$(workshop.id, {newSignupEmail: this.newSignupEmail.value})
        .toPromise();
    }

    return this.emailService
      .send$(workshop.id, this.email.value)
      .pipe(
        map(res => {
          this._sentEmail = {message: this.email.value, emailAddresses: res};
        }),
        finalize(() => {
          this.form.enable();
          this.reset();
        })
      ).toPromise();
  }


  constructor(
    private readonly adminWorkshopsService: AdminWorkshopsService,
    private readonly emailService: EmailService
  ) {
    super();
    this.manageNewSignupEmailEnabledState();
  }


  /**
   * Enables and disabled {@link newSignupEmail} based on the value of {@link editNewSignupEmail}.
   * @private
   */
  private manageNewSignupEmailEnabledState(): void {
    this.editNewSignupEmail.valueChanges.pipe(
      map(val => {
        if (typeof val === 'boolean') {
          if (val) this.newSignupEmail.enable();
          else this.newSignupEmail.disable();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}
