import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AdminWorkshop} from '@firebase-helpers';
import {AdminWorkshopsService} from '../../services/admin-workshops/admin-workshops.service';
import {GeneralWorkshopResolver} from '../../../helpers/workshop-resolver/general-workshop-resolver';


@Injectable({
  providedIn: 'root'
})
export class AdminWorkshopResolver implements Resolve< Observable<Readonly<AdminWorkshop>> > {
  private readonly generalWorkshopResolver =
    new GeneralWorkshopResolver<AdminWorkshopsService, AdminWorkshop>
    (this.router, '/admin/unknown', this.adminWorkshopsService);


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<Readonly<AdminWorkshop>>> {
    return this.generalWorkshopResolver.resolve(route, state);
  }


  constructor(
    private readonly router: Router,
    private readonly adminWorkshopsService: AdminWorkshopsService
  ) { }
}
