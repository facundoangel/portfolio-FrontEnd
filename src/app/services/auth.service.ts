import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  public createSession(userName: String, pass: String): Observable<any> {
    return this.http.post(
      'https://portfolio-backend-argentinapro.herokuapp.com/auth',
      { pass, userName },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        responseType: 'text',
      }
    );
  }

  public get logIn(): boolean {
    return sessionStorage.getItem('tk') !== null;
  }

  public closeseSession(): void {
    sessionStorage.removeItem('tk');
    sessionStorage.removeItem('id');
  }
}
