import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {filter, finalize, map, switchMap, take, takeWhile, tap} from 'rxjs/operators';
import {AdminWorkshop} from '../../../../../../../firestore-interfaces';
import {from, Observable, of, Subject, Subscription} from 'rxjs';
import {PosterService} from '../../../services/poster/poster.service';
import {LoadingService} from '../../../services/loading/loading.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-admin-workshop-change-poster',
  templateUrl: './admin-workshop-change-poster.component.html',
  styleUrls: ['./admin-workshop-change-poster.component.scss']
})
export class AdminWorkshopChangePosterComponent implements OnInit, OnDestroy {
  @Input() workshop$: Observable<AdminWorkshop | undefined> = of(undefined);
  readonly poster = new FormControl(undefined, Validators.required);
  private readonly _posterUploadStatus$: Subject<number | null> = new Subject<number | null>();
  readonly posterUploadStatus$ = this._posterUploadStatus$.asObservable();
  private _posterUrl: string | null = null;
  private _posterFileName: string | null = null;

  get posterUrl(): string | null {
    return this._posterUrl;
  }

  get posterFileName(): string | null {
    return this._posterFileName;
  }

  async getPosterFile(event$: any): Promise<void> {
    if (!event$?.target?.files) return;
    const files: FileList = event$.target.files;
    const poster = files.item(0);
    if (!poster) return;
    this.poster.setValue(poster);
    this.poster.markAsDirty();
  }

  resetPoster(initialising: boolean = false): void {
    if (!initialising && (this.poster.disabled || this.poster.pristine)) {
      throw new Error(`Can't reset poster`);
    }
    if (!initialising) this.loadingService.startLoading();
    this.poster.reset();
    this.workshop$.pipe(
      take(1),
      finalize(() => {
        if (!initialising) this.loadingService.stopLoading();
      }),
      filter(workshop => !!workshop),
      map(workshop => (workshop as AdminWorkshop).id),
      switchMap(id => this.posterService.getPosterUrls$(id)),
      map(url => {
        if (url) this._posterUrl = url.original;
      })
    ).subscribe();
  }

  submitPoster(): void {
    if (this.poster.invalid || this.poster.disabled || this.poster.pristine) {
      throw new Error(`Can't submit poster.`);
    }
    const file = this.poster.value;
    if (!(file instanceof File)) {
      throw new Error(`Can't submit poster.`);
    }
    this.loadingService.startLoading();
    this.workshop$.pipe(
      take(1),
      finalize(() => {
        this._posterUploadStatus$.next(null);
        this.loadingService.stopLoading();
        this.resetPoster();
      }),
      filter(workshop => !!workshop),
      map(workshop => (workshop as AdminWorkshop).id),
      switchMap(id => this.posterService.uploadPoster$(id, file)),
      takeWhile(percentage => typeof percentage === 'number' && percentage >= 0 && percentage <= 100),
      tap(percentage => this._posterUploadStatus$.next(percentage))
    ).subscribe();
  }

  constructor(
    private readonly posterService: PosterService,
    private readonly loadingService: LoadingService
  ) {
    this.subscriptions.push(
      this.watchPoster$().subscribe(),
      this.disableWhenLoading$(this.loadingService.loading$).subscribe()
    );
  }

  disableWhenLoading$(loading$: Observable<boolean>): Observable<void> {
    return loading$.pipe(
      map(loading => {
        if (loading) this.poster.disable();
        else this.poster.enable();
      })
    );
  }

  watchPoster$(): Observable<void> {
    return this.poster.valueChanges.pipe(
      switchMap(poster => {
        if (!(poster instanceof File)) {
          this._posterFileName = null;
          return of(null);
        }
        this._posterFileName = poster.name;
        return from(this.posterService.getPosterFileUrl(poster));
      }),
      map(url => {
        this._posterUrl = url;
      })
    );
  }

  ngOnInit(): void {
    this.resetPoster(true);
  }

  private readonly subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    for (const s of this.subscriptions) if (!s.closed) s.unsubscribe();
  }

}
