import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { AuthService } from '../../services/auth.service';
import { Playlist } from 'src/app/models/playlist.model';
import { Router } from '@angular/router';
import { PlaylistComponent } from '../playlist/playlist.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private myTopTracksURL: string = 'api/myTopTracks';
  private myArtistsURL: string = 'api/myArtists';
  private myGenresURL: string = 'api/myGenres';
  private recommendedPlaylistURL: string = 'api/recommendplaylists';

  public playlists: Playlist[];
  private isStopped: boolean = true;
  private subscription: Subscription;

  constructor(
    private spotifyService: SpotifyService,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private flashMessagesService: FlashMessagesService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.subscription = this.authService.isLoggedInObs.subscribe((data) => {
      // console.log(data);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private async loadData() {
    try {
      await this.spotifyService.getInfo(this.myTopTracksURL);
      // console.log(myTopTracks);
      await this.spotifyService.getInfo(this.myArtistsURL);
      // console.log(myArtists);
      await this.spotifyService.getInfo(this.myGenresURL);
      // console.log(myGenres);
      this.spotifyService.getPlaylists(this.recommendedPlaylistURL).subscribe(
        (data: Playlist[]) => {
          this.playlists = data;
        },
        (err) => {
          if (err.error.noData === true) {
            this.flashMessagesService.show(
              'There is not enough data to make a recommendation at this time. Please try again later.',
              {
                cssClass: 'alert-danger',
                timeout: 5000,
              }
            );
            this.spinner.hide();
          } else {
            this.flashMessagesService.show(
              'An error occurred, please reload the page.',
              {
                cssClass: 'alert-danger',
                timeout: 3000,
              }
            );
            this.spinner.hide();
          }
        }
      );
    } catch (err) {
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
  }

  openPlaylist(playlist: Playlist) {
    // let route = this.router.config.find(
    //   (res) => res.component === PlaylistComponent
    // );
    // route.data = playlist;
    this.router.navigate(['/playlist', playlist.id]);
  }

  private loadMore() {
    let newData: Playlist[];
    this.spotifyService.getPlaylists(this.recommendedPlaylistURL).subscribe(
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

  onScroll() {
    if (this.isStopped) {
      this.spinner.show();
      this.isStopped = false;
      this.loadMore();
    }
  }
}
