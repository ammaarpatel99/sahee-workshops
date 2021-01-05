import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../services/user/user.service';
import {map} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  currentConsentToEmails = true;
  consentToEmails = true;

  changeConsent(): void {
    this.userService.setEmailConsent$(this.consentToEmails).subscribe();
  }

  signIn(): Promise<void> {
    return this.userService.signIn();
  }

  constructor(
    private userService: UserService
  ) {
    this.subscriptions.push(
      this.userService.emailConsent$.pipe(
      map(consent => {
        this.currentConsentToEmails = !!consent;
        this.consentToEmails = this.currentConsentToEmails;
      })
    ).subscribe()
    );
  }

  ngOnInit(): void {
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
