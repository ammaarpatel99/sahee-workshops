import {Injectable, OnDestroy} from '@angular/core';
import {isUserWorkshop, Workshop} from '../../helpers/workshops';
import {Observable, of} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserWorkshopDoc, FIRESTORE_PATHS as PATHS, UserWorkshop, RegisterParam, RegisterRes, functions as f} from '@firebase-helpers';
import {AngularFireAuth} from '@angular/fire/auth';
import {first, map, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {PublicWorkshopsService} from '../public-workshops/public-workshops.service';
import {SignedInState, UserService} from '../user/user.service';
import {AngularFireFunctions} from '@angular/fire/functions';
import {CleanRxjs} from '../../helpers/clean-rxjs/clean-rxjs';


/**
 * A service for managing a user's workshop.
 * It can get workshops, register and unregister as well as change workshop settings.
 */
@Injectable({
  providedIn: 'root'
})
export class UserWorkshopsService extends CleanRxjs implements OnDestroy {
  /**
   * Used to store observables produced by {@link workshop$}.
   * Together with the usage of {@link shareReplay shareReplay(1)}, this reduces firestore requests.
   * @private
   */
  private readonly storedWorkshopObservables = new Map<string, Observable<Readonly<UserWorkshop> | null>>();
  /**
   * A function which calls the firebase function that registers a user for a workshop.
   * @private
   */
  private readonly _register$ = this.functions.httpsCallable<RegisterParam, RegisterRes>(f.register);


  /**
   * An observable that emits the workshop's data, or null if it doesn't exist.
   * It returns the user's data on the workshop if they are registered, otherwise it returns the public data.
   * @param workshopID - The ID of the workshop to fetch data on.
   * @returns - An observable that never completes and re-emits on changes.
   */
  workshop$(workshopID: string): Observable<Readonly<Workshop> | null>;
  /**
   * An observable that emits the user's data on the workshop,
   * or null if they aren't registered (or if it doesn't exist).
   * @param workshopID - The ID of the workshop to fetch data on.
   * @param userOnly - To specify that the workshop's public data shouldn't be returned
   * if the workshop exists but the user isn't registered. (defaults to false)
   * @returns - An observable that never completes and re-emits on changes.
   */
  workshop$(workshopID: string, userOnly: true): Observable<Readonly<UserWorkshop> | null>;
  workshop$(workshopID: string, userOnly?: true): Observable<Readonly<Workshop> | null> {
    // Get stored observable
    let obs$ = this.storedWorkshopObservables.get(workshopID);

    // If there is no stored observable, create one and store it.
    if (!obs$) {
      obs$ = this.auth.user.pipe(
        switchMap(user => {
          if (!user) return of(null);
          return this.firestore.doc<UserWorkshopDoc>(
            PATHS.user.workshop.doc({userID: user.uid, workshopID})
          ).valueChanges({idField: 'id'});
        }),
        map(workshop => {
          if (!workshop) return null;
          return {...workshop, jsDate: workshop.datetime.toDate()};
        }),
        takeUntil(this.destroy$),
        shareReplay(1)
      );
      this.storedWorkshopObservables.set(workshopID, obs$);
    }

    // return the observable if userOnly is true
    if (userOnly) return obs$;

    // switch to the public workshop if there is no user workshop
    return obs$.pipe(
      switchMap(workshop => {
        if (workshop) return of(workshop);
        return this.publicWorkshopsService.workshop$(workshopID);
      }),
      takeUntil(this.destroy$)
    );
  }


  /**
   * An observable that registers the current user for the workshop.
   * @param workshopID - The ID of the workshop.
   * @param consent - Whether the user consents to emails regarding the workshop.
   * @returns - An observable that emits once and then completes.
   */
  register$(workshopID: string, consent: boolean): Observable<void> {
    return this.workshop$(workshopID).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(`Can't register for workshop as workshop doesn't exist`);
        if (isUserWorkshop(workshop)) throw new Error(`Can't register for workshop as already registered.`);
        return this.userService.userState$;
      }),
      first(),
      switchMap(userState => {
        if (userState.signedInState === SignedInState.NO_USER) {
          throw new Error(`Can't register as there is no user signed in.`);
        }
        return this._register$({workshopID, consentToEmails: consent});
      })
    );
  }


  /**
   * An observable that updates user consent for emails regarding a workshop.
   * @param workshopID - The ID of the workshop.
   * @param consent - The user's new consent.
   * @returns - An observable that only emits once and then completes.
   */
  updateConsent$(workshopID: string, consent: boolean): Observable<void> {
    return this.workshop$(workshopID, true).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(`Can't update user consent regarding workshop as user isn't registered for workshop.`);
        if (workshop.consentToEmails === consent) {
          throw new Error(`Can't update user consent regarding workshop as provided consent is the same as current consent.`);
        }
        return this.auth.user;
      }),
      first(),
      switchMap(user => {
        if (!user) throw new Error(`Can't update user consent regarding workshop as there is no user.`);
        return this.firestore
          .doc<UserWorkshopDoc>(PATHS.user.workshop.doc({userID: user.uid, workshopID}))
          .update({consentToEmails: consent});
      })
    );
  }


  /**
   * An observable that unregisters a user from a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An observable that only emits once and then completes.
   */
  unregister$(workshopID: string): Observable<void> {
    return this.workshop$(workshopID, true).pipe(
      first(),
      switchMap(workshop => {
        if (!workshop) throw new Error(`Can't unregister from workshop as user isn't registered for workshop.`);
        return this.auth.user;
      }),
      first(),
      switchMap(user => {
        if (!user) throw new Error(`Can't unregister from workshop as there is no user.`);
        return this.firestore
          .doc<UserWorkshopDoc>(PATHS.user.workshop.doc({userID: user.uid, workshopID}))
          .delete();
      })
    );
  }


  constructor(
    private readonly firestore: AngularFirestore,
    private readonly auth: AngularFireAuth,
    private readonly publicWorkshopsService: PublicWorkshopsService,
    private readonly userService: UserService,
    private readonly functions: AngularFireFunctions
  ) { super(); }
}
