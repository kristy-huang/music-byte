import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SpotifyService } from '../../services/spotify.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Profile } from 'src/app/models/profile.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean;
  myProfile: Profile = new Profile('', null);
  welcomeMsg: string = 'Welcome';
  profileImg: string = null;
  private profileInfoURL: string = 'api/myProfile';
  private subscription: Subscription;

  constructor(
    private authService: AuthService,
    private spotifyService: SpotifyService,
    private router: Router,
    private flashMessagesService: FlashMessagesService
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.isLoggedInObs.subscribe((data) => {
      this.isLoggedIn = data;
    });
    this.getProfile();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getProfile() {
    this.spotifyService.getProfile(this.profileInfoURL).subscribe(
      (data: Profile) => {
        this.myProfile = data;
        // console.log(this.myProfile);
        if (this.myProfile.name != null && this.myProfile.name != '') {
          this.welcomeMsg = `Welcome, ${this.myProfile.name}`;
        }
        if (this.myProfile.images != null && this.myProfile.images != '') {
          this.profileImg = this.myProfile.images;
        }
      },
      (err) => {
        sessionStorage.setItem('isLoggedIn', JSON.stringify(false));
        this.authService.setLoginState(
          JSON.parse(sessionStorage.getItem('isLoggedIn'))
        );
        console.log(err);
      }
    );
  }

  onLogout() {
    this.authService.logout().subscribe(
      (data) => {
        //successfully logged out
        if (data.success === true) {
          sessionStorage.setItem('isLoggedIn', JSON.stringify(false));
          this.authService.setLoginState(
            JSON.parse(sessionStorage.getItem('isLoggedIn'))
          );
          sessionStorage.clear();
          this.router.navigate(['welcome']);
        } else {
          this.flashMessagesService.show(
            'Error logging out, please try again.',
            {
              cssClass: 'alert-danger',
              timeout: 2000,
            }
          );
        }
      },
      (err) => {
        console.log(`Error logging out: ${err}`);
        this.flashMessagesService.show('Error logging out, please try again.', {
          cssClass: 'alert-danger',
          timeout: 2000,
        });
      }
    );
  }
}
