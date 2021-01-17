import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {WorkshopsService} from '../../services/workshops/workshops.service';
import {take} from 'rxjs/operators';
import {Workshop} from '../../helpers/workshops';

@Injectable({
  providedIn: 'root'
})
export class WorkshopDashboardResolver implements Resolve<Observable<Workshop[]>> {
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Observable<Workshop[]>> {
    const workshops$ = this.workshopsService.workshops$;
    await workshops$.pipe(take(1)).toPromise();
    return workshops$;
  }

  constructor(
    private readonly workshopsService: WorkshopsService
  ) { }
}
