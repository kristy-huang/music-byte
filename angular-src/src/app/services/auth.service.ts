import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authURL: string = 'http://localhost:3000/api/login';
  validateURL: string = 'http://localhost:3000/api/callback';

  constructor(private http: HttpClient) { }

  authenticateUser() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(
      this.authURL, {headers: headers}).pipe(map((res: any) => res));
  }

  validateLogin() {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.get(this.validateURL, {headers: headers}).pipe(map((res: any) => res));
  }
}
