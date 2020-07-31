import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authURL: string = 'http://localhost:3000/api/login';
  private validateURL: string = 'http://localhost:3000/api/verify';
  private logoutURL: string = 'http://localhost:3000/api/logout';

  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(JSON.parse(sessionStorage.getItem('isLoggedIn')));
  public isLoggedInObs: Observable<
    boolean
  > = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  setLoginState(state: boolean) {
    console.log(state);
    this.isLoggedInSubject.next(state);
  }

  authenticateUser() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http
      .get(this.authURL, { headers: headers })
      .pipe(map((res: any) => res));
  }

  logout() {
    let headers = new HttpHeaders();
    return this.http
      .get(this.logoutURL, { headers: headers })
      .pipe(map((res: any) => res));
  }

  validateLogin() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http
      .get(this.validateURL, { headers: headers })
      .pipe(map((res: any) => res));
  }
}
