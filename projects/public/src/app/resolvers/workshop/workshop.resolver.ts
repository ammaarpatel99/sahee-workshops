import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {EMPTY, Observable, of} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {WorkshopsService} from '../../services/workshops/workshops.service';
import {Workshop} from '../../helpers/workshops';

@Injectable({
  providedIn: 'root'
})
export class WorkshopResolver implements Resolve< Observable<Readonly<Workshop>> > {

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise< Observable<Readonly<Workshop>> > {
    const id = route.paramMap.get('id');
    const redirect$ = this.getRedirect$();
    if (!id) return redirect$;
    const workshop$ = this.workshopsService.getWorkshop$(id).pipe(
      switchMap(workshop => workshop ? of(workshop) : redirect$)
    );
    await workshop$.pipe(take(1)).toPromise();
    return workshop$;
  }

  constructor(
    private readonly router: Router,
    private readonly workshopsService: WorkshopsService
  ) { }

  private getRedirect$(): Observable<never> {
    return of(undefined).pipe(
      switchMap(() => {
        this.router.navigateByUrl('/unknown').then();
        return EMPTY;
      })
    );
  }
}
