import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AuthProvider} from 'ngx-auth-firebaseui';
import {UserService} from '../services/user/user.service';


const AUTH_PROVIDERS: AuthProvider[] = [
  AuthProvider.EmailAndPassword,
  AuthProvider.Google
];


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  /**
   * Whether to redirect after signing in.
   */
  @Input() redirect = true;
  /**
   * Emits after signing in.
   */
  @Output() signIn = new EventEmitter<void>();
  /**
   * The sign in providers that are supported.
   */
  readonly providers: AuthProvider[] = AUTH_PROVIDERS;


  /**
   * A function to be called after signing in.<br/>
   * It emits on {@link signIn} and if {@link redirect} is true,
   * it calls {@link userService#signedIn$}.
   */
  async onSignIn(): Promise<void> {
    this.signIn.emit();
    if (this.redirect) {
      return this.userService.signedIn$().toPromise();
    }
  }


  constructor(
    private readonly userService: UserService
  ) { }
}
