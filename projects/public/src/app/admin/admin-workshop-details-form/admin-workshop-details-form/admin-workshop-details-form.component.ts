import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AdminWorkshop, AdminWorkshopDoc} from '../../../../../../../firestore-interfaces/workshops/workshop';
import {from, Observable, ReplaySubject, Subscription} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {map, switchMap, take, takeWhile, tap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {AdminWorkshopsService} from '../../../services/admin-workshops/admin-workshops.service';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

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
  /**
   * An observable that produces a Workshop instance when editing said workshop, and undefined
   * when creating a new workshop. The observable should be multicast and have a buffer (i.e.
   * a ReplaySubject(1) or an observable piped through shareReplay(1)).
   */
  @Input() workshop$!: Observable<AdminWorkshop|undefined>;

  readonly workshopDetailsForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    jsDate: new FormControl('', Validators.required),
    videoCallLink: new FormControl(),
    feedbackLink: new FormControl(),
    recordingLink: new FormControl(),
    newSignupEmail: new FormControl('', Validators.required)
  });

  getFormControl(field: WorkshopDetails): FormControl {
    return this.workshopDetailsForm.get(field) as FormControl;
  }

  getFormFieldAppearance(field: WorkshopDetails): MatFormFieldAppearance {
    return this.getFormControl(field).pristine ? 'fill' : 'standard';
  }

  getFieldErrorMessage(field: WorkshopDetails): string {
    const control = this.getFormControl(field);
    if (control.hasError('required')) return 'This field is required';
    else return '';
  }

  async resetWorkshopDetailsForm(): Promise<void> {
    const workshop = await this.workshop$.pipe(take(1)).toPromise();
    if (!workshop) {
      this.workshopDetailsForm.reset();
      this._editing$.next(true);
      return;
    }
    this.workshopDetailsForm.reset({...workshop, jsDate: workshop.jsDate.toISOString().slice(0, -1)});
    this._editing$.next(false);
  }

  edit(): void {
    this._editing$.next(true);
  }

  async submit(): Promise<void> {
    if (this.workshopDetailsForm.invalid || this.workshopDetailsForm.pristine) return;
    const currentWorkshop = await this.workshop$.pipe(take(1)).toPromise();
    if (!currentWorkshop) {
      return this.createWorkshop();
    } else {
      return this.updateWorkshop();
    }
  }

  private async updateWorkshop(): Promise<void> {
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
    return this.workshop$.pipe(
      takeWhile(workshop => !!workshop),
      take(1),
      map(workshop => (workshop as AdminWorkshop).id),
      switchMap(id => from(this.adminWorkshopsService.updateWorkshop(id, data)))
    ).toPromise();
  }

  private async createWorkshop(): Promise<void> {
    const data: AdminWorkshopDoc = {
      name: this.getFormControl('name').value,
      description: this.getFormControl('description').value,
      datetime: Timestamp.fromDate(new Date(this.getFormControl('jsDate').value)),
      newSignupEmail: this.getFormControl('newSignupEmail').value
    };
    const getValue = (field: Exclude<WorkshopDetails, 'jsDate'>): void => {
      const value = this.getFormControl(field).value;
      if (value) data[field] = value;
    };
    getValue('videoCallLink');
    getValue('recordingLink');
    getValue('feedbackLink');
    const id = await this.adminWorkshopsService.createWorkshop(data);
    await this.router.navigate(['..', id], {relativeTo: this.route});
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminWorkshopsService: AdminWorkshopsService
  ) {
    this.subscriptions.push(this.manageFormEnabledState$().subscribe());
  }

  private manageFormEnabledState$(): Observable<void> {
    return this.editing$.pipe(
      map((editing: boolean): void => {
        if (editing) this.workshopDetailsForm.enable();
        else this.workshopDetailsForm.disable();
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(this.watchWorkshopAndUpdateForm$().subscribe());
  }

  private watchWorkshopAndUpdateForm$(): Observable<void> {
    return this.workshop$.pipe(
      tap(async _ => {
        await this.resetWorkshopDetailsForm();
      }),
      map(_ => {})
    );
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
