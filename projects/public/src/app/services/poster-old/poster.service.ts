import {Injectable} from '@angular/core';
import {AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask} from '@angular/fire/storage';
import {forkJoin, Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map, switchMap} from 'rxjs/operators';
import firebase from 'firebase/app';
import UploadMetadata = firebase.storage.UploadMetadata;


export interface PosterUrls {
  webp: string;
  std: string;
  original: string;
}


@Injectable({
  providedIn: 'root'
})
export class PosterService {
  // TODO: cache poster urls

  /**
   * Used to get all urls for posters for a workshop.
   * There is the original url, the urls for the poster in different sizes, and the different sizes in webp format.
   * The urls are provided as a string for srcset format
   * <br/>
   * If the build was not configured for production, the function won't actually try to fetch the url.
   * @param workshopID - The ID of the workshop to get the posters for.
   * @returns - An observable which when subscribed to gets the urls and emits them,
   * or null if their is no poster (which could be because there is no workshop).
   * It will emit once and then complete.
   */
  public getPosterUrls$(workshopID: string): Observable<PosterUrls> {
    if (!environment.production) return of({original: '', webp: '', std: ''});
    const refs = this.getRefs(workshopID);
    const original = PosterService.getPosterUrl$(refs.original);
    const std: Observable<string>[] = [];
    const webp: Observable<string>[] = [];
    const addSize = (size: number): (source: Observable<string>) => Observable<string> => {
      return source => source.pipe(
        map(s => s + ` ${size}w`)
      );
    };
    for (let i = 0; i < refs.sizes.length; i++) {
      std.push(
        PosterService
          .getPosterUrl$(refs.std[i])
          .pipe(addSize(refs.sizes[i])
        )
      );
      webp.push(
        PosterService
          .getPosterUrl$(refs.webp[i])
          .pipe(addSize(refs.sizes[i])
        )
      );
    }
    return forkJoin([original, forkJoin(std), forkJoin(webp)]).pipe(
      map(res => ({
        original: res[0],
        std: res[1].join(', '),
        webp: res[2].join(', ')
      }))
    );
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
   * Used to get the url for the poster of a workshop.
   * <br/>
   * If the build was not configured for production, the function won't actually try to fetch the url.
   * @param ref - The {@link AngularFireStorageReference} to get the url for.
   * @returns - An observable which when subscribed to gets the url and emits it,
   * or empty string if their is no poster (which could be because there is no workshop).
   * It will emit once and then complete.
   */
  private static getPosterUrl$(ref: AngularFireStorageReference): Observable<string> {
    const url$ = ref.getDownloadURL().pipe(
      map((url: string | null) => {
        return url || '';
      })
    );
    return environment.production ? url$ : of('');
  }

  /**
   * Get the {@link AngularFireStorageReference} for the poster of a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An {@link AngularFireStorageReference} for the poster.
   */
  private getRef(workshopID: string): AngularFireStorageReference {
    return this.storage.ref(`public/workshops/${workshopID}/poster`);
  }

  /**
   * Get the {@link AngularFireStorageReference AngularFireStorageReferences} for the posters of a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An object containing the {@link AngularFireStorageReference AngularFireStorageReferences},
   * including the original, the different sizes, and the sizes in webp format.
   * The width of the posters (except the original) is also given in the sizes array.
   */
  private getRefs(workshopID: string): {
    std: AngularFireStorageReference[];
    original: AngularFireStorageReference;
    sizes: number[];
    webp: AngularFireStorageReference[]
  } {
    const originalPath = `public/workshops/${workshopID}/poster`;
    const original = this.storage.ref(originalPath);
    const std: AngularFireStorageReference[] = [];
    const webp: AngularFireStorageReference[] = [];
    const sizes: number[] = [];
    for (const [ext, width] of [['-s', 300], ['-m', 600], ['-l', 1000], ['-xl', 2000]] as [string, number][]) {
      const stdPath = originalPath + ext;
      std.push(this.storage.ref(stdPath));
      webp.push(this.storage.ref(stdPath + '.webp'));
      sizes.push(width);
    }
    return {original, std, webp, sizes};
  }

  constructor(
    private readonly storage: AngularFireStorage
  ) { }
}
