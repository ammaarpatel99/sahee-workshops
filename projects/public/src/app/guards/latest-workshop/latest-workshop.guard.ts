import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {first, map} from 'rxjs/operators';
import {PublicWorkshopsService} from '../../services/public-workshops/public-workshops.service';


@Injectable({
  providedIn: 'root'
})
export class LatestWorkshopGuard implements CanActivate {
  /**
   * Returns an observable that either redirects to /id (where id is the id of the latest workshop),
   * or redirects to /unknown.<br/>
   * The latest workshop is determined by getting one emission from {@link publicWorkshopsService#workshops$},
   * and taking the first item from that array.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UrlTree> {
    return this.publicWorkshopsService.workshops$.pipe(
      first(),
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
