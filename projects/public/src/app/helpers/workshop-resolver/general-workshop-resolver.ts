import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {EMPTY, from, Observable, of} from 'rxjs';
import {mapTo, switchMap, switchMapTo, take} from 'rxjs/operators';


type WorkshopService<Workshop> = {workshop$: (id: string) => Observable<Readonly<Workshop> | null>};


export class GeneralWorkshopResolver<Service extends WorkshopService<Return>, Return> implements Resolve< Observable<Readonly<Return>> >{
  /**
   * Gets the workshop observable for the route.
   * If there is no workshop, redirects to ../unknown.<br/>
   * The observable passed to the route will also redirect if there is no workshop.
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<Readonly<Return>>> {
    const id = route.paramMap.get('id');
    const redirect$ = this.getRedirect$();
    if (!id) return redirect$;
    const workshop$ = this.service.workshop$(id).pipe(
      switchMap(workshop => workshop ? of(workshop) : redirect$)
    );
    return workshop$.pipe(
      // Don't use first() as if there is no workshop there will be no emission so first() will error
      take(1),
      mapTo(workshop$)
    );
  }


  /**
   * Used to redirect to ../unknown. It never emits and completes after the redirect.
   * @private
   */
  private getRedirect$(): Observable<never> {
    return from(
      this.router.navigate(['..', 'unknown'], {relativeTo: this.route})
    ).pipe(
      switchMapTo(EMPTY)
    );
  }


  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly service: Service
  ) { }
}
