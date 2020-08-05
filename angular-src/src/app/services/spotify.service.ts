import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Playlist } from '../models/playlist.model';
import { Track } from '../models/track.model';
import { Profile } from '../models/profile.model';

@Injectable()
export class SpotifyService {
  constructor(private http: HttpClient) {}

  getPlaylists(url: string): Observable<Playlist[]> {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(url, { withCredentials: true, headers: headers }).pipe(
      map((res: any) => {
        let results = res.map((item) => {
          return new Playlist(
            item.name,
            item.id,
            item.owner,
            item.description,
            item.external_urls,
            item.tracks,
            item.images
          );
        });
        return results;
      })
    );
  }

  getPlaylist(url: string): Observable<Playlist> {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(url, { withCredentials: true, headers: headers }).pipe(
      map((res: any) => {
        return new Playlist(
          res.name,
          res.id,
          res.owner,
          res.description,
          res.external_urls,
          res.tracks,
          res.images
        );
      })
    );
  }

  getTracks(url: string): Observable<Track[]> {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(url, { withCredentials: true, headers: headers }).pipe(
      map((res: any) => {
        let results = res.map((item) => {
          return new Track(
            item.name,
            item.id,
            item.artists,
            item.duration_ms,
            item.external_urls,
            item.preview_url,
            false
          );
        });
        // console.log(results);
        return results;
      })
    );
  }

  getProfile(url: string): Observable<Profile> {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(url, { withCredentials: true, headers: headers }).pipe(
      map((res: any) => {
        return new Profile(res.name, res.images);
      })
    );
  }

  getInfo(url: string): Promise<Object> {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(url, { withCredentials: true, headers: headers }).toPromise();
  }
}
