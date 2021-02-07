import {Component, Input} from '@angular/core';
import {AdminWorkshop, AdminWorkshopDoc} from '@firebase-helpers';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatFormFieldAppearance} from '@angular/material/form-field';
import {map, switchMap, switchMapTo} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import {AdminWorkshopsService} from '../../services/admin-workshops/admin-workshops.service';


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
export class AdminWorkshopDetailsFormComponent {
  /**
   * The fields of a workshop that can be edited, and details for displaying them.
   */
  readonly displayFields = DISPLAY_FIELDS;


  /**
   * Internal field for {@link editing}.
   * @private
   */
  private _editing = false;
  /**
   * Whether the form is in editing mode or not.
   */
  get editing(): boolean {
    return this._editing;
  }
  set editing(editing: boolean) {
    if (editing) this.form.enable();
    else this.form.disable();
    this._editing = editing;
  }


  /**
   * Internal field for {@link workshop}.
   * @private
   */
  private _workshop: AdminWorkshop | null = null;
  /**
   * The workshop being edited, or null if the form is being used to create one.
   */
  @Input()
  set workshop(workshop: AdminWorkshop | null) {
    this._workshop = workshop;
    this.resetWorkshopDetailsForm(true);
  }
  get workshop(): AdminWorkshop | null {
    return this._workshop;
  }


  /**
   * The form for editing the details of the workshop.
   */
  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    jsDate: new FormControl('', Validators.required),
    videoCallLink: new FormControl(),
    feedbackLink: new FormControl(),
    recordingLink: new FormControl(),
    newSignupEmail: new FormControl('', Validators.required)
  });


  /**
   * A getter for form controls in {@link form}.
   * @param field - The name of the form control to get.
   */
  getFormControl(field: WorkshopDetails): FormControl {
    const control = this.form.get(field);
    if (!control || !(control instanceof FormControl)) {
      throw new Error(`There is no form control with name: ${field}.`);
    }
    return control;
  }


  /**
   * How to display the form field.
   * @param field - The name of the field.
   * @returns - The value of MatFormField appearance.
   */
  getFormFieldAppearance(field: WorkshopDetails): MatFormFieldAppearance {
    return this.getFormControl(field).pristine ? 'fill' : 'standard';
  }


  /**
   * The error message for a field from {@link form}.
   * @param field - The name of the field.
   * @returns - The error message to display.
   */
  getFieldErrorMessage(field: WorkshopDetails): string {
    const control = this.getFormControl(field);
    if (control.hasError('required')) return 'This field is required';
    else return '';
  }


  /**
   * Resets the form. If the form is disabled, this throws an error.
   * @param force - A boolean flag that defaults to false.
   * If it set to true it resets the form regardless of its state.
   */
  resetWorkshopDetailsForm(force: boolean = false): void {
    if (!force && this.form.disabled) {
      throw new Error(`Can't reset workshop details form.`);
    }
    this.form.disable();
    try {
      if (!this.workshop) {
        this.form.reset();
        this.editing = true;
        return;
      }
      this.form.reset({...this.workshop, jsDate: this.workshop.jsDate.toISOString().slice(0, -1)});
      this.editing = false;
    } catch (e) {
      if (!force) this.form.enable();
      throw e;
    }
  }


  /**
   * Submits the form. This means either creating or the workshop or updating it.
   */
  async submit(): Promise<void> {
    if (this.form.invalid || this.form.pristine || this.form.disabled) {
      throw new Error(`Can't submit workshop details form.`);
    }
    this.form.disable();
    try {
      if (!this.workshop) {
        await this.createWorkshop();
      } else {
        await this.updateWorkshop(this.workshop.id);
      }
    } finally {
      this.form.enable();
    }
  }


  /**
   * Deletes the workshop.
   */
  delete(): Promise<void> {
    if (this.form.enabled) {
      throw new Error(`Can't delete workshop details.`);
    }
    if (!this.workshop) throw new Error(`Can't delete the workshop as it doesn't exist.`);
    return this.adminWorkshopsService.delete$(this.workshop.id).pipe(
      switchMapTo(this.router.navigate(['..'], {relativeTo: this.route})),
      map(res => {
        if (!res) throw new Error(`Couldn't navigate away after deleting workshops.`);
      })
    ).toPromise();
  }


  /**
   * Updates the workshop.
   * @param workshopID - The ID of the workshop to update.
   * @private
   */
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


  /**
   * Creates a workshop using the data from {@link form}.
   * @private
   */
  private createWorkshop(): Promise<void> {
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

    return this.adminWorkshopsService.create$(data).pipe(
      switchMap(id => this.router.navigate(['..', id], {relativeTo: this.route})),
      map(res => {
        if (!res) throw new Error(`Couldn't navigate away after creating workshop.`);
      })
    ).toPromise();
  }


  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly adminWorkshopsService: AdminWorkshopsService
  ) { }
}
