import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  authenticateUser() {
    let corsHeaders = new HttpHeaders();
    corsHeaders.append('Content-Type', 'application/json');
    return this.http.get(
      'http://localhost:3000/user/login', {headers: corsHeaders}).pipe(map((res: any) => res));
  }
}
