import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  playlistImgs = [];

  constructor(
    private spotifyService: SpotifyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getFeaturedPlaylist();
  }

  getFeaturedPlaylist() {
    this.spotifyService.getFeaturedPlaylist().subscribe((data) => {
      for (let i = 0; i < 5; i++) {
        this.playlistImgs[i] = data.playlists.items[i].images[0].url;
        // console.log(this.playlistImg[i]);
      }
      console.log(data.playlists.items);
    });
  }
}
