import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {environment} from '../../../../../../environments/environment';
import {switchMap} from 'rxjs/operators';
import {AngularFireStorage, AngularFireUploadTask} from '@angular/fire/storage';
import {UploadMetadata} from '@angular/fire/storage/interfaces';
import {PosterService} from '../../../../../services/poster/poster.service';


@Injectable({
  providedIn: 'root'
})
export class UploadPosterService {
  /**
   * Gets the URL of a provided image, using {@link FileReader#readAsDataURL}.
   * This allows a local image to be shown using a url.
   * @param file - The image to get a url for.
   * @returns - A promise which resolves to a url.
   */
  getPosterFileUrl(file: File): Promise<string> {
    return new Promise((resolve: (value: string) => void, reject: (reason?: any) => void): void => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') resolve(result);
        else reject(new Error(`Result of readAsDataUrl isn't a string.`));
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
  uploadPoster$(workshopID: string, poster: File): Observable<number | undefined> {
    return of(environment.production).pipe(
      switchMap(prod => {
        const meta: UploadMetadata = {
          contentType: poster.type,
          contentDisposition: 'inline'
        };
        if (!prod) return of(100);
        return this.storage
          .ref(PosterService.path(workshopID))
          .put(poster, meta)
          .percentageChanges();
      })
    );
  }


  constructor(
    private readonly storage: AngularFireStorage
  ) { }
}
