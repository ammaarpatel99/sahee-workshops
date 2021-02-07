import {Injectable} from '@angular/core';
import {AngularFireStorage, AngularFireStorageReference} from '@angular/fire/storage';
import {forkJoin, Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map} from 'rxjs/operators';


export interface PosterUrls {
  webp: string;
  jpeg: string;
  original: string;
}


const FILE_SIZES: [string, number][] = [
  ['-s', 300],
  ['-m', 600],
  ['-l', 1000],
  ['-xl', 2000]
];


@Injectable({
  providedIn: 'root'
})
export class PosterService {
  /**
   * Gets the base path (excluding file extensions) for the posters for a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns the path in firebase storage as a string.
   */
  static path(workshopID: string): string {
    return `public/workshops/${workshopID}/poster`;
  }

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
  getPosterUrls$(workshopID: string): Observable<PosterUrls> {
    const refs = this.getRefs(workshopID);

    const original = PosterService
      .getPosterUrl$(refs.original)
      .pipe(map(url => url || ''));

    const jpeg: Observable<string>[] = [];
    const webp: Observable<string>[] = [];

    const addSize = (size: number): (source: Observable<string | null>) => Observable<string> => {
      return source => source.pipe(
        map(url => url ? `${url} ${size}w` : '')
      );
    };

    for (let i = 0; i < refs.sizes.length; i++) {
      jpeg.push(
        PosterService
          .getPosterUrl$(refs.jpeg[i])
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

    return forkJoin([original, forkJoin(jpeg), forkJoin(webp)]).pipe(
      map(res => ({
        original: res[0],
        jpeg: res[1].join(', '),
        webp: res[2].join(', ')
      }))
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
  private static getPosterUrl$(ref: AngularFireStorageReference): Observable<string | null> {
    return environment.production ? ref.getDownloadURL() : of(null);
  }


  /**
   * Get the {@link AngularFireStorageReference AngularFireStorageReferences} for the posters of a workshop.
   * @param workshopID - The ID of the workshop.
   * @returns - An object containing the {@link AngularFireStorageReference AngularFireStorageReferences},
   * including the original, the different sizes, and the sizes in webp format.
   * The width of the posters (except the original) is also given in the sizes array.
   */
  private getRefs(workshopID: string): {
    jpeg: AngularFireStorageReference[];
    original: AngularFireStorageReference;
    sizes: number[];
    webp: AngularFireStorageReference[];
  } {
    const originalPath = PosterService.path(workshopID);
    const original = this.storage.ref(originalPath + '.jpeg');

    const jpeg: AngularFireStorageReference[] = [];
    const webp: AngularFireStorageReference[] = [];
    const sizes: number[] = [];

    for (const [ext, width] of FILE_SIZES) {
      const path = originalPath + ext;
      jpeg.push(this.storage.ref(path + 'jpeg'));
      webp.push(this.storage.ref(path + '.webp'));
      sizes.push(width);
    }

    return {original, jpeg, webp, sizes};
  }


  constructor(
    private readonly storage: AngularFireStorage
  ) { }
}
