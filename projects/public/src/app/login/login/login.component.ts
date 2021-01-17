import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AuthProvider} from 'ngx-auth-firebaseui';
import {UserService} from '../../services/user/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Input() public redirect = true;
  @Output() public signIn = new EventEmitter<void>();
  public readonly providers: AuthProvider[] = [
    AuthProvider.EmailAndPassword,
    AuthProvider.Google
  ];

  public async onSignIn(): Promise<void> {
    if (this.redirect) await this.router.navigateByUrl(this.userService.redirectUrl());
    else this.signIn.emit();
  }

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) { }

}
