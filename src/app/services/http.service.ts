import { Injectable } from '@angular/core';
import { CommonApiService } from './common-api/common-api.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private commonApi: CommonApiService, private http: HttpClient) {}

  public apiUrl: string = environment.serverUrl;

  private createCompleteRoute(route: string, envAddress: string) {
    return `${envAddress}${route}`;
  }

  private generateHeaders(value: any, token: string, type = '') {
    const head: any = {};

    if (value) {
      Object.assign(head, { Authorization: 'Bearer ' + token });
    }

    if (type) {
      Object.assign(head, { 'Content-Type': type });
    }

    return {
      headers: new HttpHeaders(head),
    };
  }

  // public delete(route: string, token) {
  //     return this.http.delete(
  //         this.createCompleteRoute(route, this.apiUrl),
  //         this.generateHeaders(true, token)
  //     );
  // }

  // loginGoogle(body: any): Observable<any> {
  //   return this.commonApi.postIdentity(
  //     'accounts:signInWithPassword?key=' + environment.firebaseConfig.apiKey,
  //     body
  //   ) as Observable<any>;
  // }

  login(body: any): Observable<any> {
    return this.http.post('/auth/login', body) as Observable<any>;
  }

  registerUser(body: any): Observable<any> {
    return this.commonApi.post('/auth/register-user', body) as Observable<any>;
  }
}
