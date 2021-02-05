import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AdminWorkshop, AdminWorkshopDoc} from '../../../../../../../functions/src/firebase-helpers/firestore-interfaces';
import {Observable, of, ReplaySubject, Subscription} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {finalize, map, switchMap, switchMapTo, take, tap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import {LoadingService} from '../../../services/loading/loading.service';
import {AdminWorkshopsService} from '../../../services/admin-workshops/admin-workshops.service';

type WorkshopDetails = Exclude<keyof AdminWorkshop, 'id'|'datetime' >;

const DISPLAY_FIELDS: {
  title: string; name: WorkshopDetails, type: 'text'|'datetime-local'|'text-area'; required: boolean; tooltip: string;
}[] = [
  {title: 'Name', name: 'name', type: 'text', required: true, tooltip: 'The displayed name of the workshop.'},
  {title: 'Description', name: 'description', type: 'text-area', required: true, tooltip: 'The displayed description of the workshop.'},
  {title: 'Date and Time', name: 'jsDate', type: 'datetime-local', required: true, tooltip: 'The date and time of the workshop.'},
  {title: 'New Sign-up Email', name: 'newSignupEmail', required: true, type: 'text-area',
    tooltip: `The email sent out to people when they sign up for this workshop.`},
  {title: 'Video Call Link', name: 'videoCallLink', type: 'text', required: false,
    tooltip: `The link to the video call (i.e. a zoom link).`},
  {title: 'Feedback Link', name: 'feedbackLink', type: 'text', required: false,
    tooltip: `A link to a feedback form for the workshop (i.e. a Google Form).`},
  {title: 'Recording Link', name: 'recordingLink', type: 'text', required: false,
    tooltip: `A link to a recording of the workshop that can be embedded in the site. For youtube, go to the video page, click share
    and then embed, and then copy the link (not the whole block of code, just the link in the speech marks next to src=).`}
];

@Component({
  selector: 'app-admin-workshop-details-form',
  templateUrl: './admin-workshop-details-form.component.html',
  styleUrls: ['./admin-workshop-details-form.component.scss']
})
export class AdminWorkshopDetailsFormComponent implements OnInit, OnDestroy {
  readonly displayFields = DISPLAY_FIELDS;
  private readonly _editing$ = new ReplaySubject<boolean>(1);
  readonly editing$ = this._editing$.asObservable();
  readonly loading$: Observable<boolean>;
  /**
   * An observable that produces a Workshop instance when editing said workshop, and undefined
   * when creating a new workshop. The observable should be multicast and have a buffer (i.e.
   * a ReplaySubject(1) or an observable piped through shareReplay(1)).
   */
  @Input() workshop$!: Observable<AdminWorkshop|undefined>;

  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    jsDate: new FormControl('', Validators.required),
    videoCallLink: new FormControl(),
    feedbackLink: new FormControl(),
    recordingLink: new FormControl(),
    newSignupEmail: new FormControl('', Validators.required)
  });

  getFormControl(field: WorkshopDetails): FormControl {
    return this.form.get(field) as FormControl;
  }

  getFormFieldAppearance(field: WorkshopDetails): MatFormFieldAppearance {
    return this.getFormControl(field).pristine ? 'fill' : 'standard';
  }

  getFieldErrorMessage(field: WorkshopDetails): string {
    const control = this.getFormControl(field);
    if (control.hasError('required')) return 'This field is required';
    else return '';
  }

  async resetWorkshopDetailsForm(initialising: boolean = false): Promise<void> {
    if (!initialising && (this.form.pristine || this.form.disabled)) {
      throw new Error(`Can't reset workshop details form.`);
    }
    if (!initialising) this.loadingService.startLoading();
    try {
      const workshop = await this.workshop$.pipe(take(1)).toPromise();
      if (!workshop) {
        this.form.reset();
        this._editing$.next(true);
        return;
      }
      this.form.reset({...workshop, jsDate: workshop.jsDate.toISOString().slice(0, -1)});
      this._editing$.next(false);
    } finally {
      if (!initialising) this.loadingService.stopLoading();
    }
  }

  edit(): void {
    this._editing$.next(true);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.form.pristine || this.form.disabled) {
      throw new Error(`Can't submit workshop details form.`);
    }
    this.loadingService.startLoading();
    try {
      const currentWorkshop = await this.workshop$.pipe(take(1)).toPromise();
      if (!currentWorkshop) {
        await this.createWorkshop();
      } else {
        await this.updateWorkshop(currentWorkshop.id);
      }
    } finally {
      this.loadingService.stopLoading();
    }
  }

  async delete(): Promise<void> {
    if (this.form.enabled) {
      throw new Error(`Can't delete workshop details.`);
    }
    this.loadingService.startLoading();
    const currentWorkshop = await this.workshop$.pipe(take(1)).toPromise();
    if (!currentWorkshop) {
      this.loadingService.stopLoading();
      return;
    }
    this.adminWorkshopsService.delete$(currentWorkshop.id).pipe(
      finalize(() => this.loadingService.stopLoading()),
      switchMapTo(this.router.navigate(['..'], {relativeTo: this.route}))
    ).subscribe();
  }

  private async updateWorkshop(workshopID: string): Promise<void> {
    const data: Partial<AdminWorkshopDoc> = {};
    const getValue = (name: WorkshopDetails): string | undefined => {
      if (this.getFormControl(name).dirty) return this.getFormControl(name).value;
      return undefined;
    };
    const setValue = (name: Exclude<WorkshopDetails, 'jsDate'>): void => {
      const value = getValue(name);
      if (value !== undefined) data[name] = value;
    };
    const fields: Exclude<WorkshopDetails, 'jsDate'>[] =
      ['name', 'description', 'newSignupEmail', 'videoCallLink', 'feedbackLink', 'recordingLink'];
    for (const field of fields) setValue(field);
    const datetime = getValue('jsDate');
    if (datetime) data.datetime = Timestamp.fromDate(new Date(datetime));
    return this.adminWorkshopsService.update$(workshopID, data).toPromise();
  }

  private async createWorkshop(): Promise<void> {
    const data: AdminWorkshopDoc = {
      name: this.getFormControl('name').value,
      description: this.getFormControl('description').value,
      datetime: Timestamp.fromDate(new Date(this.getFormControl('jsDate').value)),
      newSignupEmail: this.getFormControl('newSignupEmail').value
    };
    const setValue = (field: Exclude<WorkshopDetails, 'jsDate'>): void => {
      const value = this.getFormControl(field).value;
      if (value) data[field] = value;
    };
    setValue('videoCallLink');
    setValue('recordingLink');
    setValue('feedbackLink');
    const id = await this.adminWorkshopsService.create$(data).toPromise();
    await this.router.navigate(['..', id], {relativeTo: this.route});
  }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly adminWorkshopsService: AdminWorkshopsService,
    private readonly loadingService: LoadingService
  ) {
    this.loading$ = this.loadingService.loading$;
    this.subscriptions.push(
      this.manageFormEnabledState$().subscribe(),
      this.disableFormWhenLoading$().subscribe()
    );
  }

  private manageFormEnabledState$(): Observable<void> {
    return this.editing$.pipe(
      map((editing: boolean): void => {
        if (editing) this.form.enable();
        else this.form.disable();
      })
    );
  }

  private disableFormWhenLoading$(): Observable<void> {
    return this.loading$.pipe(
      switchMap(loading => {
        if (loading) {
          this.form.disable();
          return of(undefined);
        }
        return this.editing$.pipe(
          take(1),
          map(editing => this._editing$.next(editing))
        );
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.watchWorkshopAndUpdateForm$().subscribe()
    );
  }

  private watchWorkshopAndUpdateForm$(): Observable<void> {
    return this.workshop$.pipe(
      tap(async _ => {
        await this.resetWorkshopDetailsForm(true);
      }),
      map(_ => {})
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
