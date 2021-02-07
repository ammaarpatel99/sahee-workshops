import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {finalize, map, share, takeWhile} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {PosterService} from '../../../services/poster/poster.service';
import {FormControl, Validators} from '@angular/forms';
import {UploadPosterService} from '../services/email/upload-poster/upload-poster.service';


@Component({
  selector: 'app-admin-workshop-change-poster',
  templateUrl: './admin-workshop-change-poster.component.html',
  styleUrls: ['./admin-workshop-change-poster.component.scss']
})
export class AdminWorkshopChangePosterComponent implements OnInit {
  /**
   * A {@link FormControl} used to store and track the uploaded poster.
   */
  readonly poster = new FormControl(undefined, Validators.required);

  /**
   * Internal for {@link posterUploadStatus$}.
   * @private
   */
  private _posterUploadStatus$?: Observable<number>;
  /**
   * An observable that emits how much of the poster is uploaded (as a percentage).
   * It is undefined if no poster is being uploaded.
   */
  get posterUploadStatus$(): Observable<number> | undefined {
    return this._posterUploadStatus$;
  }

  /**
   * Internal for {@link posterUrl}.
   * @private
   */
  private _posterUrl: string | null = null;
  /**
   * The url of the poster to display, or null if there is no poster to display.
   */
  get posterUrl(): string | null {
    return this._posterUrl;
  }

  /**
   * Internal for {@link posterFileName}.
   * @private
   */
  private _posterFileName: string | null = null;
  /**
   * The name of the file uploaded, or null if there is no file uploaded.
   */
  get posterFileName(): string | null {
    return this._posterFileName;
  }


  /**
   * The ID of the workshop that the component is managing the poster for.
   */
  @Input() workshopID?: string | null;
  /**
   * Gets ID of the workshop, from {@link workshopID}.
   * However if the value is falsey this will throw an error.
   * @private
   */
  private getWorkshopID(): string {
    const id = this.workshopID;
    if (!id) throw new Error(`No workshop ID passed in.`);
    return id;
  }


  /**
   * Get's the poster file from the upload event from the HTML input component.
   * @param event$ - The event emitted by the input component.
   */
  async getPosterFile(event$: any): Promise<void> {
    const files = event$?.target?.files;
    if (!files || !(files instanceof FileList)) {
      throw new Error(`Incorrect event$ passed after file upload.`);
    }
    const poster = files.item(0);
    if (!poster) return;

    this.poster.setValue(poster);
    this.poster.markAsDirty();
    this._posterFileName = poster.name;

    return this.uploadPosterService
      .getPosterFileUrl(poster)
      .then(url => {
        this._posterUrl = url;
      });
  }


  /**
   * Reset the poster.
   * This resets the input components and sets the url to the poster url from storage.
   */
  resetPoster(): Promise<void> {
    if (this.poster.disabled) {
      throw new Error(`Can't reset poster`);
    }

    const workshopID = this.getWorkshopID();
    this.poster.disable();
    this.poster.reset();
    this._posterUrl = null;
    this._posterFileName = null;

    return this.posterService
      .getPosterUrls$(workshopID)
      .pipe(
        map(url => {
          this._posterUrl = url.original;
        }),
        finalize(() => this.poster.enable())
      ).toPromise();
  }


  /**
   * Uploads the poster to storage, and then resets the component (i.e. calls {@link resetPoster}.<br/>
   * This also uses {@link posterUploadStatus$} to update the component to show how much is uploaded.
   */
  submitPoster(): void {
    if (this.poster.invalid || this.poster.disabled || this.poster.pristine) {
      throw new Error(`Can't submit poster.`);
    }
    const file = this.poster.value;
    if (!(file instanceof File)) {
      throw new Error(`Can't submit poster.`);
    }

    const workshopID = this.getWorkshopID();
    this.poster.disable();

    this._posterUploadStatus$ = this.uploadPosterService
      .uploadPoster$(workshopID, file)
      .pipe(
        takeWhile(percentage => typeof percentage === 'number' && percentage >= 0 && percentage <= 100),
        map(percentage => percentage as number),
        finalize(() => {
          this.poster.enable();
          this._posterUploadStatus$ = undefined;
          this.resetPoster();
        }),
        share()
      );
    this._posterUploadStatus$.subscribe();
  }


  constructor(
    private readonly posterService: PosterService,
    private readonly uploadPosterService: UploadPosterService
  ) {}


  ngOnInit(): void {
    this.resetPoster();
  }
}
