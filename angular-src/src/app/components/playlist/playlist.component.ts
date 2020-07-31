import { Component, OnInit } from '@angular/core';
import { Playlist } from 'src/app/models/playlist.model';
import { Track } from 'src/app/models/track.model';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpotifyService } from '../../services/spotify.service';
// import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css'],
})
export class PlaylistComponent implements OnInit {
  private tracksURL: string = 'http://localhost:3000/api/tracks';
  private selectedPlaylistURL: string =
    'http://localhost:3000/api/selectedPlaylist';
    
  clickedPlaylist: Observable<Playlist>;
  tracks: Observable<Track[]>;
  private playlistId: string;

  //TODO: add audio, try to extract the tracks from the playlist response 
  //instead of making another request to get the tracks. This may increase speed
  //BUGS: when a description contains links, it is not displayed properly. Eg:
  //instead of being displayed as a hyperlink, it is displayed as the url

  constructor(
    private activatedRoute: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {
    this.activatedRoute.params.subscribe(
      (params) => (this.playlistId = params.id)
    );
  }

  ngOnInit(): void {
    // this.clickedPlaylist = this.activatedRoute.data.pipe(
    //   map((res: Playlist) => {
    //     let playlist = new Playlist(
    //       res.name,
    //       res.id,
    //       res.owner,
    //       res.description,
    //       res.external_urls,
    //       res.tracks,
    //       res.images
    //     );
    //     // console.log(playlist);
    //     this.loadTracks(playlist.id);
    //     return playlist;
    //   })
    // );
    this.loadPlaylist();
    this.loadTracks();
  }

  loadPlaylist(): void {
    this.clickedPlaylist = this.spotifyService.getPlaylist(
      `${this.selectedPlaylistURL}?playlistId=${this.playlistId}`
    );
  }

  loadTracks(): void {
    this.tracks = this.spotifyService.getTracks(
      `${this.tracksURL}?playlistId=${this.playlistId}`
    );
  }
}
