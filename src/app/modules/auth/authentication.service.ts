import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { Credentials, CredentialsService } from './credentials.service';
import { AuthModel } from './models/auth.model';
import { HttpService } from '@app/services/http.service';
import { Utils } from '@app/@shared';
import { environment } from '@env/environment';
import { CommonApiService } from '@app/services/common-api/common-api.service';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

// const API_USERS_URL = `${environment.serverUrl}/auth/login`;

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private credentialsService: CredentialsService,
    private httpService: HttpService,
    private utils: Utils,
    private commonApi: CommonApiService
  ) {}

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  loginOld(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    const data = {
      userName: context.username,
      authToken: '123456',
      refreshToken: '',
      expiresIn: '',
    };
    this.credentialsService.setCredentials(data, context.remember);
    return of(data);
  }

  login(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    const loginForm = {
      username: context.username,
      password: context.password,
    };

    return this.httpService.login(loginForm).pipe(
      map((result) => {
        if (!result) {
          return result;
        }

        const token = result.data;
        const decoded = this.utils.decodeJwt(token!.token);

        const auth = new AuthModel();
        auth.userName = decoded.username;
        auth.level = token!.level;
        auth.authToken = token!.token;
        auth.refreshToken = token!.refresh_token;
        auth.expiresIn = token!.expired_reset_token;

        this.credentialsService.setCredentials(auth, context.remember);
        return auth;
      })
    );
  }

  loginz(context: LoginContext): Observable<any> {
    const loginForm = {
      username: context.username,
      password: context.password,
    };
    return this.commonApi.post('/auth/login', loginForm) as Observable<any>;
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    return of(true);
  }
}
