import {Component, Input, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PublicWorkshop} from '../../../../../../firestore-interfaces/public-workshops/public-workshop';
import {UserService} from '../../services/user/user.service';
import {filter, switchMap, switchMapTo, take, tap} from 'rxjs/operators';
import {WorkshopsService} from '../../services/workshops/workshops.service';

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
  registering = false;

  async signIn(): Promise<void> {
    await this.userService.signIn();
  }

  register(): void {
    this.registering = true;
    this.emailConsent$.pipe(
      take(1),
      filter(consent => consent === null),
      switchMapTo(this.userService.setEmailConsent$(this.relatedEmailConsent))
    ).subscribe();
    this.workshop$.pipe(
      filter(workshop => !!workshop),
      take(1),
      switchMap(workshop =>
        this.workshopsService.register$((workshop as PublicWorkshop).id, this.thisEmailConsent)
      )
    ).subscribe(_ => this.registering = false);
  }

  constructor(
    private workshopsService: WorkshopsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
  }

}
