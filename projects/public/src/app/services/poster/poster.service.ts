import { Injectable } from '@angular/core';
import {AngularFireStorage, AngularFireStorageReference} from '@angular/fire/storage';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PosterService {

  private static getPath(workshopID: string): string {
    return `public/workshops/${workshopID}/poster`;
  }

  private getRef(workshopID: string): AngularFireStorageReference {
    return this.storage.ref(PosterService.getPath(workshopID));
  }

  getPosterUrl$(workshopID: string): Observable<string | undefined> {
    const url$ = this.getRef(workshopID).getDownloadURL().pipe(
      map((url: string | null) => url || undefined)
    );
    return environment.production ? url$ : of(undefined);
  }

  getPosterFileUrl(file: File): Promise<string | undefined> {
    return new Promise((resolve: (value: string | undefined) => void): void => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve((reader.result as string | null) || undefined);
      };
      reader.readAsDataURL(file);
    });
  }

  async uploadPoster(workshopID: string, poster: File): Promise<void> {
    if (!environment.production) return;
    await this.storage.storage.ref(`public/workshops/${workshopID}/poster`).put(poster);
    /*return new Promise((resolve: () => void, reject) => {
      if (!environment.production) {
        resolve();
        return;
      }
      this.storage.storage.ref(`public/workshops/${workshopID}/poster`).put(poster).then(_ => resolve());
      /!*const task = this.storage.upload(PosterService.getPath(workshopID), poster);
      task.catch(e => reject(e));
      resolve();*!/
    });*/
  }

  constructor(
    private storage: AngularFireStorage
  ) { }
}
