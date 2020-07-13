import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  featuredPlaylistURL: string = 'http://localhost:3000/api/featuredPlaylist';
  playlistImgURL: string = 'http://localhost:3000/api/playlistImg';

  constructor(private http: HttpClient) {}

  getFeaturedPlaylist() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http
      .get(this.featuredPlaylistURL, { headers: headers })
      .pipe(map((res: any) => res));
  }
}
