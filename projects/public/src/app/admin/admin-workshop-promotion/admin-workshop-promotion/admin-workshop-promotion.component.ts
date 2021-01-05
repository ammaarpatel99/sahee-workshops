import {Component, Input, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AdminWorkshop} from '../../../../../../../firestore-interfaces/workshops/workshop';
import {EmailService} from '../../../services/email/email.service';
import {filter, switchMap, take} from 'rxjs/operators';

@Component({
  selector: 'app-admin-workshop-promotion',
  templateUrl: './admin-workshop-promotion.component.html',
  styleUrls: ['./admin-workshop-promotion.component.scss']
})
export class AdminWorkshopPromotionComponent implements OnInit {
  @Input() workshop$: Observable<AdminWorkshop | undefined> = of(undefined);
  promotionEmail = '';

  sendPromotionEmail(): void {
    this.workshop$.pipe(
      take(1),
      filter(workshop => !!workshop),
      switchMap(workshop =>
        this.emailService.promote$(
          (workshop as AdminWorkshop).id, this.promotionEmail
        ))
    ).subscribe();
  }

  constructor(
    private emailService: EmailService
  ) { }

  ngOnInit(): void {
  }

}
