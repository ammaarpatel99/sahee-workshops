import {Component, Input, OnInit} from '@angular/core';
import {UserWorkshopsService} from '../../services/user-workshops/user-workshops.service';
import {Observable, of} from 'rxjs';
import {PublicWorkshop} from '../../../../../../firestore-interfaces/public-workshops/public-workshop';
import {UserService} from '../../services/user/user.service';
import {filter, switchMap, switchMapTo, take} from 'rxjs/operators';

@Component({
  selector: 'app-workshop-signup',
  templateUrl: './workshop-signup.component.html',
  styleUrls: ['./workshop-signup.component.scss']
})
export class WorkshopSignupComponent implements OnInit {
  @Input() workshop$: Observable<Readonly<PublicWorkshop> | undefined> = of(undefined);
  emailConsent$ = this.userService.emailConsent$;
  relatedEmailConsent = true;
  thisEmailConsent = true;

  register(): void {
    this.emailConsent$.pipe(
      take(1),
      filter(consent => consent === null),
      switchMapTo(this.userService.setEmailConsent$(this.relatedEmailConsent))
    ).subscribe();
    this.workshop$.pipe(
      take(1),
      filter(workshop => !!workshop),
      switchMap(workshop =>
        this.userWorkshopsService.register$((workshop as PublicWorkshop).id, this.thisEmailConsent)
      )
    ).subscribe();
  }

  constructor(
    private userWorkshopsService: UserWorkshopsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
  }

}
