import {AsyncSubject} from 'rxjs';
import {Injectable, OnDestroy} from '@angular/core';


/**
 * A class which can be extended to help manage long-lived or hot observables in a memory-safe manner.
 * <br/>
 * Helps implement the takeUntil pattern to complete observables.
 * <br/>
 * To use put takeUntil(this.destroy$) in appropriate observables, so they will complete when the class is destroyed.
 */
@Injectable()
export abstract class CleanRxjs implements OnDestroy {
  /**
   * Used to destroy long-lived or hot observables with the takeUntil structure when destroying component.
   * @private
   */
  protected readonly destroy$ = new AsyncSubject<true>();


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
