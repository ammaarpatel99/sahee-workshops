import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {filter, map, switchMap, take} from 'rxjs/operators';
import {AdminWorkshop} from '../../../../../../../firestore-interfaces/workshops/workshop';
import {Observable, of, Subscription} from 'rxjs';
import {AdminWorkshopsService} from '../../../services/admin-workshops/admin-workshops.service';
import {EmailService} from '../../../services/email/email.service';

@Component({
  selector: 'app-admin-workshop-message',
  templateUrl: './admin-workshop-message.component.html',
  styleUrls: ['./admin-workshop-message.component.scss']
})
export class AdminWorkshopMessageComponent implements OnInit, OnDestroy {
  @Input() workshop$: Observable<AdminWorkshop | undefined> = of(undefined);
  updateEmail = '';
  changeNewSignupEmail = false;
  currentNewSignupEmail = '';
  newSignupEmail = '';

  sendEmail(): void {
    if (this.changeNewSignupEmail) {
      this.workshop$.pipe(
        take(1),
        filter(workshop => !!workshop),
        map(workshop => (workshop as AdminWorkshop).id),
        switchMap(id => this.adminWorkshopsService.updateWorkshop(id, {newSignupEmail: this.newSignupEmail}))
      ).subscribe();
    }
    this.workshop$.pipe(
      take(1),
      filter(workshop => !!workshop),
      map(workshop => (workshop as AdminWorkshop).id),
      switchMap(workshopID => this.emailService.send$(workshopID, this.newSignupEmail))
    );
  }

  constructor(
    private adminWorkshopsService: AdminWorkshopsService,
    private emailService: EmailService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.update$().subscribe());
  }

  private update$(): Observable<void> {
    return this.workshop$.pipe(
      map(workshop => {
        this.changeNewSignupEmail = false;
        this.currentNewSignupEmail = workshop?.newSignupEmail || '';
        this.newSignupEmail = this.currentNewSignupEmail;
      })
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
