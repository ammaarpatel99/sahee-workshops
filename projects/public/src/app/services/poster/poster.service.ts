import { Injectable } from '@angular/core';
import {AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask} from '@angular/fire/storage';
import {Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {switchMap} from 'rxjs/operators';
import firebase from 'firebase/app';
import UploadMetadata = firebase.storage.UploadMetadata;

@Injectable({
  providedIn: 'root'
})
export class PosterService {

  /**
   * Used to get the url for the poster of a workshop.
   * <br/>
   * If the build was not configured for production, the function won't actually try to fetch the url.
   * @param workshopID - The ID of the workshop to get the poster for.
   * @returns - An observable which when subscribed to gets the url and emits it,
   * or null if their is no poster (which could be because there is no workshop).
   * It will emit once and then complete.
   */
  public getPosterUrl$(workshopID: string): Observable<string | null> {
    const url$ = this.getRef(workshopID).getDownloadURL();
    return environment.production ? url$ : of(null);
  }

  /**
   * Gets the URL of a provided image, using {@link FileReader#readAsDataURL}.
   * This allows a local image to be shown using a url.
   * @param file - The image to get a url for.
   * @returns - A promise which resolves to a url.
   */
  public getPosterFileUrl(file: File): Promise<string> {
    return new Promise((resolve: (value: string) => void): void => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Uploads a poster for a workshop into firebase storage.
   * <br/>
   * If the build was not configured for production,
   * the function won't upload the poster and will return an observable as if it has been completely uploaded.
   * @param workshopID - The ID of the workshop that the poster is for.
   * @param poster - The poster to be uploaded.
   * @returns - An observable which when subscribed to begins the upload and emits the percentage uploaded.
   * It is a {@link AngularFireUploadTask#percentageChanges} and it is unknown by the author of this whether it
   * ever completes or when and why it emits undefined.
   */
  public uploadPoster$(workshopID: string, poster: File): Observable<number | undefined> {
    return of(environment.production).pipe(
      switchMap(prod => {
        const meta: UploadMetadata = {
          cacheControl: 'max-age=360',
          contentType: poster.type,
          contentDisposition: 'inline'
        };
        if (prod) return this.getRef(workshopID).put(poster, meta).percentageChanges();
        return of(100);
      })
    );
  }

  /**
   * Get the {@link AngularFireStorageReference} for the poster of a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An {@link AngularFireStorageReference} for the poster.
   */
  private getRef(workshopID: string): AngularFireStorageReference {
    return this.storage.ref(`public/workshops/${workshopID}/poster`);
  }

  constructor(
    private readonly storage: AngularFireStorage
  ) { }
}
