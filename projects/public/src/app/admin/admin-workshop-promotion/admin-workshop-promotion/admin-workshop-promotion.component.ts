import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {AdminWorkshop} from '../../../../../../../firestore-interfaces';
import {EmailService} from '../../../services/email/email.service';
import {filter, finalize, map, switchMap, take} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import {LoadingService} from '../../../services/loading/loading.service';

@Component({
  selector: 'app-admin-workshop-promotion',
  templateUrl: './admin-workshop-promotion.component.html',
  styleUrls: ['./admin-workshop-promotion.component.scss']
})
export class AdminWorkshopPromotionComponent implements OnInit, OnDestroy {
  @Input() workshop$: Observable<AdminWorkshop | undefined> = of(undefined);
  readonly promotionEmail = new FormControl('', Validators.required);
  sentEmail: {message: string; emailAddresses: string[]} | null = null;

  sendPromotionEmail(): void {
    if (this.promotionEmail.pristine || this.promotionEmail.disabled || this.promotionEmail.invalid) {
      throw new Error(`Can't send promotional email.`);
    }
    this.loadingService.startLoading();
    this.workshop$.pipe(
      take(1),
      finalize(() => this.loadingService.stopLoading()),
      filter(workshop => !!workshop),
      switchMap(workshop =>
        this.emailService.promote$(
          (workshop as AdminWorkshop).id, this.promotionEmail.value
        )
      ),
      map(emailAddresses => {
        this.sentEmail = {
          emailAddresses,
          message: this.promotionEmail.value
        };
        this.promotionEmail.reset('');
      })
    ).subscribe();
  }

  constructor(
    private readonly emailService: EmailService,
    private readonly loadingService: LoadingService
  ) {
    this.subscriptions.push(
      this.disableWhenLoading$(this.loadingService.loading$).subscribe()
    );
  }

  private disableWhenLoading$(loading$: Observable<boolean>): Observable<void> {
    return loading$.pipe(
      map(loading => {
        if (loading) this.promotionEmail.disable();
        else this.promotionEmail.enable();
      })
    );
  }

  ngOnInit(): void { }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
