import {Component, Input, OnInit} from '@angular/core';
import {map, switchMap, take, takeWhile, tap} from 'rxjs/operators';
import {AdminWorkshop} from '../../../../../../../firestore-interfaces/workshops/workshop';
import {environment} from '../../../../environments/environment';
import {from, Observable, of} from 'rxjs';
import {PosterService} from '../../../services/poster/poster.service';

@Component({
  selector: 'app-admin-workshop-change-poster',
  templateUrl: './admin-workshop-change-poster.component.html',
  styleUrls: ['./admin-workshop-change-poster.component.scss']
})
export class AdminWorkshopChangePosterComponent implements OnInit {
  @Input() workshop$: Observable<AdminWorkshop | undefined> = of(undefined);
  posterFile: File | undefined;
  posterUrl: string | undefined;
  posterEdited = false;

  getPosterFile(event$: any): void {
    if (!event$?.target?.files) return;
    const files: FileList = event$.target.files;
    this.posterFile = files.item(0) || undefined;
    if (!this.posterEdited) this.posterEdited = true;
    if (!this.posterFile) {
      this.posterUrl = undefined;
      return;
    }
    this.posterService.getPosterFileUrl(this.posterFile).then(url => this.posterUrl = url);
  }

  resetPoster(): void {
    this.posterFile = undefined;
    this.posterEdited = false;
    this.workshop$.pipe(
      take(1),
      tap(workshop => {
        if (!workshop) this.posterUrl = undefined;
      }),
      takeWhile(workshop => !!workshop),
      map(workshop => (workshop as AdminWorkshop).id),
      switchMap(id => this.posterService.getPosterUrl$(id)),
      tap(url => {
        this.posterUrl = url;
      })
    ).subscribe();
  }

  submitPoster(): void {
    this.posterEdited = false;
    this.workshop$.pipe(
      take(2),
      takeWhile(workshop => !!workshop),
      take(1),
      map(workshop => (workshop as AdminWorkshop).id),
      switchMap(id => {
        const file = this.posterFile;
        if (!file || !environment.production) return of(undefined);
        return from(this.posterService.uploadPoster(id, file));
      }),
      tap(_ => this.resetPoster())
    ).subscribe();
  }

  constructor(
    private posterService: PosterService
  ) { }

  ngOnInit(): void {
    this.resetPoster();
  }

}
