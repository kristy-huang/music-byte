import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {
  isNotLoggedIn: boolean;
  private subscription: Subscription;

  constructor(
    private authService: AuthService,
    private flashMessagesService: FlashMessagesService
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.isLoggedInObs.subscribe((data) => {
      console.log(data);
      this.isNotLoggedIn = !data;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLogin() {
    this.authService.authenticateUser().subscribe(
      (data) => {
        if (data.success === true) {
          window.location.href = data.url;
        } else if (data.success != true) {
          this.flashMessagesService.show(
            'An error occurred, please try again.',
            {
              cssClass: 'alert-danger',
              timeout: 3000,
            }
          );
        }
      },
      (err) => {
        this.flashMessagesService.show('An error occurred, please try again.', {
          cssClass: 'alert-danger',
          timeout: 3000,
        });
        console.error(`Error occurred: ${err}`);
      }
    );
  }
}
