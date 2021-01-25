import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import {filter, map, shareReplay, take} from 'rxjs/operators';
import {SidenavService} from '../../services/sidenav/sidenav.service';
import {UserService} from '../../services/user/user.service';
import {LinkMenuItem} from 'ngx-auth-firebaseui';
import {NavigationEnd, Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import {LoadingService} from '../../services/loading/loading.service';
import {MatSidenav} from '@angular/material/sidenav';

@Component({
  selector: 'app-nav-container',
  templateUrl: './nav-container.component.html',
  styleUrls: ['./nav-container.component.scss']
})
export class NavContainerComponent {
  public readonly emailIssues$: Observable<'email' | 'verification' | null>;
  public readonly isHandset$: Observable<boolean>;
  public readonly accountBtnLinks: LinkMenuItem[] = [
    {text: 'Account', callback: () => this.router.navigateByUrl('/account')}
  ];
  public readonly sidenavLinks$: Observable<{name: string, link: string}[]>;
  public readonly user$: Observable<boolean>;
  public readonly loading$: Observable<boolean>;
  public readonly title$: Observable<'Workshops' | ``>;
  public readonly adminTheme$: Observable<'admin-theme' | ''>;
  public dismissedEmailWarning = false;

  public async signIn(): Promise<void> {
    await this.userService.signIn();
  }

  public async signedOut(): Promise<void> {
    await this.userService.signedOut();
  }

  public closeDrawer(drawer: MatSidenav): void {
    this.isHandset$.pipe(
      take(1),
      map(isHandset => {
        if (isHandset) drawer.close();
      })
    ).subscribe();
  }

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly auth: AngularFireAuth,
    linksService: SidenavService,
    loadingService: LoadingService
  ) {
    this.emailIssues$ = this.getEmailIssues$();
    this.isHandset$ = this.observeIsHandset$();
    this.sidenavLinks$ = linksService.links$;
    this.user$ = this.getUser$();
    this.loading$ = loadingService.loading$;
    this.title$ = this.getTitle$();
    this.adminTheme$ = this.getAdminTheme$();
  }

  private getUser$(): Observable<boolean> {
    return this.auth.user.pipe(
      map(user => !!user)
    );
  }

  private observeIsHandset$(): Observable<boolean> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      map(res => res.matches),
      shareReplay(1)
    );
  }

  private getTitle$(): Observable<'Workshops' | ``> {
    return this.breakpointObserver.observe([Breakpoints.HandsetPortrait]).pipe(
      map(res => res.matches),
      map(matches => matches ? `` : 'Workshops'),
      shareReplay(1)
    );
  }

  private getEmailIssues$(): Observable<'email' | 'verification' | null> {
    return this.auth.user.pipe(
      map(user => {
        if (!user) return null;
        if (!user.email) return 'email';
        if (!user.emailVerified) return 'verification';
        return null;
      })
    );
  }

  private getAdminTheme$(): Observable<'admin-theme' | ''> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects.startsWith('/admin') ? 'admin-theme' : ''),
      shareReplay(1)
    );
  }

}
