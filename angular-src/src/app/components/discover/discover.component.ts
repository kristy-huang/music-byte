import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { Playlist } from 'src/app/models/playlist.model';
import { PlaylistComponent } from '../playlist/playlist.component';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css'],
})
export class DiscoverComponent implements OnInit {
  private randomPlaylistURL: string =
    'http://localhost:3000/api/randomPlaylists';
  private searchURL: string = 'http://localhost:3000/api/search';
  public playlists: Playlist[];
  private isStopped: boolean = true;
  public searchStr: string;
  public searchRes: Playlist[];

  //TODO: make discover page work without having to log in

  constructor(
    private spotifyService: SpotifyService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private flashMessagesService: FlashMessagesService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.spotifyService.getPlaylists(this.randomPlaylistURL).subscribe(
      (data: Playlist[]) => {
        this.playlists = data;
      },
      (err) => {
        if (err.status === 401) {
          sessionStorage.setItem('isLoggedIn', JSON.stringify(false));
          this.authService.setLoginState(
            JSON.parse(sessionStorage.getItem('isLoggedIn'))
          );
          this.router.navigate(['/welcome']);
        } else {
          this.flashMessagesService.show(
            'An error occurred, please reload the page.',
            {
              cssClass: 'alert-danger',
              timeout: 3000,
            }
          );
          this.spinner.hide();
          console.log(`Error loading data: ${err.message}`);
        }
      }
    );
  }

  searchPlaylist(): void {
    this.spotifyService
      .getPlaylists(`${this.searchURL}?searchStr=${this.searchStr}`)
      .subscribe((data: Playlist[]) => {
        this.searchRes = data;
      });
  }

  openPlaylist(playlist: Playlist): void {
    // let route = this.router.config.find(
    //   (res) => res.component === PlaylistComponent
    // );
    // route.data = playlist;
    this.router.navigate(['/playlist', playlist.id]);
  }

  private loadMore(): void {
    let newData: Playlist[];
    this.spotifyService.getPlaylists(this.randomPlaylistURL).subscribe(
      (data: Playlist[]) => {
        newData = data;
        this.playlists = this.playlists.concat(newData);
        this.spinner.hide();
        this.isStopped = true;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onScroll(): void {
    if (this.isStopped) {
      this.spinner.show();
      this.isStopped = false;
      this.loadMore();
    }
  }
}
