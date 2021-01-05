import {Component, OnInit} from '@angular/core';
import {AuthProvider} from 'ngx-auth-firebaseui';
import {UserService} from '../../services/user/user.service';
import {Router} from '@angular/router';
import {filter, switchMap, take} from 'rxjs/operators';
import {from, of} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  readonly providers: AuthProvider[] = [
    AuthProvider.EmailAndPassword,
    AuthProvider.Google
  ];
  readonly goBackUrl: string;

  onSignIn(): void {
    this.userService.emailVerified$.pipe(
      take(2),
      filter(verified => verified !== undefined),
      take(1),
      switchMap(verified => verified ? from(this.router.navigateByUrl(this.goBackUrl)) : of(undefined))
    ).subscribe();
  }

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.goBackUrl = this.userService.redirectUrl;
    console.log(this.goBackUrl);
  }

  ngOnInit(): void {
  }

}
