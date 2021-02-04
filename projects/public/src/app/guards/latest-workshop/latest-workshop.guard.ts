import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {map, take} from 'rxjs/operators';
import {PublicWorkshopsService} from '../../services/public-workshops/public-workshops.service';

@Injectable({
  providedIn: 'root'
})
export class LatestWorkshopGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.publicWorkshopsService.workshops$.pipe(
      take(1),
      map(workshops => {
        if (workshops.length === 0) return this.router.parseUrl('/unknown');
        return this.router.parseUrl(`/${workshops[0].id}`);
      })
    );
  }

  constructor(
    private readonly router: Router,
    private readonly publicWorkshopsService: PublicWorkshopsService
  ) { }
}
