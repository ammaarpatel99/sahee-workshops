import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable, Subscription} from 'rxjs';
import {finalize, map, shareReplay, take} from 'rxjs/operators';
import {LoadingService} from '../../services/loading/loading.service';
import {Router} from '@angular/router';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {SupportService} from '../../services/support/support.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit, OnDestroy {
  readonly containerClass$: Observable<'wide-container' | 'thin-container'>;
  readonly form = new FormGroup({
    message: new FormControl('', Validators.required),
    email: new FormControl()
  });

  get message(): FormControl {
    return this.form.get('message') as FormControl;
  }

  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  submit(): void {
    if (this.form.pristine || this.form.invalid || this.form.disabled) {
      throw new Error(`Can't submit feedback.`);
    }
    this.loadingService.startLoading();
    this.emailService.support$(this.message.value, this.email.enabled ? this.email.value : undefined).pipe(
      finalize(() => this.loadingService.stopLoading())
    ).subscribe(() => this.router.navigateByUrl('/'));
  }

  constructor(
    private readonly auth: AngularFireAuth,
    private readonly loadingService: LoadingService,
    private readonly emailService: SupportService,
    private readonly router: Router,
    private readonly breakpointObserver: BreakpointObserver
  ) {
    this.containerClass$ = this.getContainerClass$();
    this.subscriptions.push(
      this.watchUserForEmail$().subscribe(),
      this.disableWhileLoading$(this.loadingService.loading$).subscribe()
    );
  }

  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      shareReplay(1)
    );
  }

  private disableWhileLoading$(loading$: Observable<boolean>): Observable<void> {
    return loading$.pipe(
      map(loading => {
        if (loading) this.form.disable();
        else {
          this.form.enable();
          this.watchUserForEmail$().pipe(take(1)).subscribe();
        }
      })
    );
  }

  private watchUserForEmail$(): Observable<void> {
    return this.auth.user.pipe(
      map(user => {
        if (user?.email) {
          this.email.setValidators(null);
          this.email.disable();
        } else {
          this.email.setValidators([Validators.email, Validators.required]);
          this.email.enable();
        }
        this.email.updateValueAndValidity();
      })
    );
  }

  ngOnInit(): void {
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
