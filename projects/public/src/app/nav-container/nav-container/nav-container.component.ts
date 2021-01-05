import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {SidenavService} from '../../services/sidenav/sidenav.service';
import {UserService} from '../../services/user/user.service';
import {LinkMenuItem} from 'ngx-auth-firebaseui';
import {Router} from '@angular/router';

@Component({
  selector: 'app-nav-container',
  templateUrl: './nav-container.component.html',
  styleUrls: ['./nav-container.component.scss']
})
export class NavContainerComponent {
  readonly user$ = this.userService.user$;
  readonly email$ = this.userService.email$;
  readonly emailVerified$ = this.userService.emailVerified$;
  readonly links: LinkMenuItem[] = [
    {text: 'Account', callback: () => this.router.navigateByUrl('/account')}
  ];

  async signIn(): Promise<void> {
    await this.userService.signIn();
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public linksService: SidenavService,
    private userService: UserService,
    private router: Router
  ) {}

}
