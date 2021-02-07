import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {Workshop} from '../../helpers/workshops';
import {UserWorkshopsService} from '../../services/user-workshops/user-workshops.service';
import {GeneralWorkshopResolver} from '../../helpers/workshop-resolver/general-workshop-resolver';


@Injectable({
  providedIn: 'root'
})
export class WorkshopResolver implements Resolve< Observable<Readonly<Workshop>> > {
  private readonly generalWorkshopResolver =
    new GeneralWorkshopResolver<UserWorkshopsService, Workshop>
    (this.router, '/unknown', this.userWorkshopsService);


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<Readonly<Workshop>>> {
    return this.generalWorkshopResolver.resolve(route, state);
  }


  constructor(
    private readonly router: Router,
    private readonly userWorkshopsService: UserWorkshopsService
  ) { }
}
