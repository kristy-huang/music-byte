import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authURL: string = 'api/login';
  private validateURL: string = 'api/verify';
  private logoutURL: string = 'api/logout';

  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(JSON.parse(sessionStorage.getItem('isLoggedIn')));
  public isLoggedInObs: Observable<
    boolean
  > = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  setLoginState(state: boolean) {
    // console.log(state);
    this.isLoggedInSubject.next(state);
  }

  authenticateUser() {
    return this.http
      .get(this.authURL, { withCredentials: true })
      .pipe(map((res: any) => res));
  }

  logout() {
    let headers = new HttpHeaders();
    return this.http
      .get(this.logoutURL, { withCredentials: true, headers: headers })
      .pipe(map((res: any) => res));
  }

  validateLogin() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http
      .get(this.validateURL, { withCredentials: true, headers: headers })
      .pipe(map((res: any) => res));
  }
}
