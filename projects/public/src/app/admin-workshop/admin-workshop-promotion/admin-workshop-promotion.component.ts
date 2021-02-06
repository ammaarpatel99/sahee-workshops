import {Component, Input} from '@angular/core';
import {finalize, map} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import {EmailService} from '../../services/email/email.service';


interface SentEmail {
  message: string;
  emailAddresses: string[];
}


@Component({
  selector: 'app-admin-workshop-promotion',
  templateUrl: './admin-workshop-promotion.component.html',
  styleUrls: ['./admin-workshop-promotion.component.scss']
})
export class AdminWorkshopPromotionComponent {
  /**
   * Internal for {@link workshop}.
   * @private
   */
  private _workshopID: string | null = null;
  /**
   * The workshop that the user is trying to send a message for.
   */
  @Input()
  set workshopID(workshopID: string | null) {
    if (workshopID) this.promotionEmail.reset();
    this._workshopID = workshopID;
  }
  get workshop(): string | null {
    return this._workshopID;
  }


  /**
   * Gets {@link workshop}, but throws an error if it is null.
   */
  getWorkshopID(): string {
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
   * The form control for the promotional email.
   */
  readonly promotionEmail = new FormControl('', Validators.required);


  /**
   * Sends the promotional email from {@link promotionEmail}.
   */
  sendPromotionEmail(): Promise<void> {
    if (this.promotionEmail.disabled || this.promotionEmail.invalid) {
      throw new Error(`Can't send promotional email.`);
    }
    this.promotionEmail.disable();
    const workshopID = this.getWorkshopID();
    const message = this.promotionEmail.value;
    return this.emailService
      .promote$(workshopID, message)
      .pipe(
        map(res => {
          this._sentEmail = {message, emailAddresses: res};
        }),
        finalize(() => {
          this.promotionEmail.enable();
          this.promotionEmail.reset();
        })
      ).toPromise();
  }


  constructor(
    private readonly emailService: EmailService
  ) { }
}
