import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent implements OnInit {
  text: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private flashMessagesService: FlashMessagesService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.authService.validateLogin().subscribe((data) => {
      if (data.success === true) {
        this.text = 'Logging in...';
        sessionStorage.setItem('isLoggedIn', JSON.stringify(true));
        this.authService.setLoginState(
          JSON.parse(sessionStorage.getItem('isLoggedIn'))
        );
        this.router.navigate(['home']);
      } else {
        this.text = 'Rerouting...';
        sessionStorage.setItem('isLoggedIn', JSON.stringify(false));
        this.authService.setLoginState(
          JSON.parse(sessionStorage.getItem('isLoggedIn'))
        );
        this.flashMessagesService.show('Error logging in, please try again.', {
          cssClass: 'alert-danger',
          timeout: 2000,
        });
        setTimeout(() => {
          this.router.navigate(['welcome']);
        }, 2000);
      }
    }, 
    (err) => {
      this.text = 'Rerouting...';
      sessionStorage.setItem('isLoggedIn', JSON.stringify(false));
      this.authService.setLoginState(
        JSON.parse(sessionStorage.getItem('isLoggedIn'))
      );
      this.flashMessagesService.show('Error logging in, please try again.', {
        cssClass: 'alert-danger',
        timeout: 2000,
      });
      setTimeout(() => {
        this.router.navigate(['welcome']);
      }, 2000);
    }
    );
  }
}
