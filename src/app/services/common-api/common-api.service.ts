import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { HandlerResponseService } from '../handler-response/handler-response.service';
import { environment } from 'src/environments/environment';
import { Utils } from '@app/@shared/utility/utils';

@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  headers: HttpHeaders | undefined;
  bodyUrl: URLSearchParams | undefined;
  apiURL: string = environment.serverUrl;

  constructor(private http: HttpClient, private handlerResponseService: HandlerResponseService, private utils: Utils) {}

  getHeaders(headers?: any): HttpHeaders {
    const headerObj: any = {
      Authorization: this.utils.getToken(),
    };
    if (headers) {
      headers.forEach((value: string, key: string) => {
        headerObj[key] = value;
      });
    }

    return (this.headers = new HttpHeaders(headerObj));
  }

  getSearchParams(body: any): URLSearchParams {
    const bodyUrl = new Map();
    const newBody: any = {};

    // tslint:disable-next-line: forin
    for (const param in body) {
      if (Array.isArray(body[param])) {
        body[param].forEach((value: any, key: string) => {
          // tslint:disable-next-line: forin
          for (const item in value) {
            const obj =
              typeof value[item] === 'boolean' ? `${param}[${key}][${item}]` : `${param}[${key}][${item}][value]`;
            bodyUrl.set(obj, value[item]);
          }
        });
      } else {
        bodyUrl.set(param, body[param]);
      }
    }

    bodyUrl.forEach((value: any, key: string) => {
      newBody[key] = value;
    });

    return (this.bodyUrl = new URLSearchParams(newBody));
  }

  get(url: string, params?: any, reqOpts?: any, maxRetry?: number, reqTimeout?: number): boolean | Observable<any> {
    if (this.checkConnection()) {
      if (!reqOpts) {
        reqOpts = {
          params: new HttpParams(),
        };
      }

      if (params) {
        reqOpts.params = new HttpParams();

        // tslint:disable-next-line: forin
        for (const reqParams in params) {
          reqOpts.params = reqOpts.params.set(reqParams, params[reqParams]);
        }
      }

      if (this.utils.getToken()) {
        reqOpts.headers = this.getHeaders(reqOpts.headers);
      }

      // console.log("reqOpts")
      // console.log(reqOpts)

      return this.http.get<any>(this.setConnection() + url, reqOpts).pipe(
        timeout(reqTimeout ? reqTimeout : 300000),
        retry(maxRetry ? maxRetry : 0),
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {
          this.handlerResponseService.failedResponse(error);

          if (error.status === 0) {
            return of(error);
          }

          throw error;
        })
      ) as Observable<any>;
    } else {
      return false;
    }
  }

  // tslint:disable-next-line: max-line-length
  post(
    url: string,
    body: any,
    reqOpts?: any,
    searchParam?: any,
    isNeedError?: boolean,
    maxRetry?: number,
    reqTimeout?: number
  ): boolean | Observable<any> {
    if (this.checkConnection()) {
      if (!reqOpts) {
        reqOpts = {
          params: new HttpParams(),
        };
      }

      if (this.utils.getToken()) {
        reqOpts.headers = this.getHeaders(reqOpts.headers);
      }
      console.log(reqOpts);

      if (searchParam) {
        const bodyUrl = this.getSearchParams(searchParam).toString();
        body = body ? body.concat(bodyUrl) : bodyUrl;
      }

      return this.http.post<any>(this.setConnection() + url, body, reqOpts).pipe(
        timeout(reqTimeout ? reqTimeout : 300000),
        retry(maxRetry ? maxRetry : 0),
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {
          this.handlerResponseService.failedResponse(error);

          if (error.status === 0) {
            return of(error);
          }

          if (isNeedError) {
            return of(error);
          } else {
            throw error;
          }
        })
      );
    } else {
      return false;
    }
  }

  // tslint:disable-next-line: max-line-length
  patch(
    url: string,
    body: any,
    reqOpts?: any,
    params?: any,
    isNeedError?: boolean,
    maxRetry?: number,
    reqTimeout?: number
  ): boolean | Observable<any> {
    if (this.checkConnection()) {
      if (!reqOpts) {
        reqOpts = {
          params: new HttpParams(),
        };
      }

      if (params) {
        reqOpts.params = new HttpParams();
        // tslint:disable-next-line: forin
        for (const reqParams in params) {
          reqOpts.params = reqOpts.params.set(reqParams, params[reqParams]);
        }
      }

      if (this.utils.getToken()) {
        reqOpts.headers = this.getHeaders(reqOpts.headers);
      }
      console.log(reqOpts);

      return this.http.patch<any>(this.setConnection() + url, body, reqOpts).pipe(
        timeout(reqTimeout ? reqTimeout : 300000),
        retry(maxRetry ? maxRetry : 0),
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {
          this.handlerResponseService.failedResponse(error);

          if (error.status === 0) {
            return of(error);
          }

          if (isNeedError) {
            return of(error);
          } else {
            throw error;
          }
        })
      );
    } else {
      return false;
    }
  }

  put(url: string, body: any, reqOpts?: any, maxRetry?: number, reqTimeout?: number): boolean | Observable<any> {
    if (this.checkConnection()) {
      if (!reqOpts) {
        reqOpts = {
          params: new HttpParams(),
        };
      }

      if (this.utils.getToken()) {
        reqOpts.headers = this.getHeaders();
      }

      return this.http.put<any>(this.setConnection() + url, body, reqOpts).pipe(
        timeout(reqTimeout ? reqTimeout : 300000),
        retry(maxRetry ? maxRetry : 0),
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {
          this.handlerResponseService.failedResponse(error);

          if (error.status === 0) {
            return of(error);
          }

          throw error;
        })
      );
    } else {
      return false;
    }
  }

  delete(
    url: string,
    bodyData?: any,
    reqOpts?: any,
    maxRetry?: number,
    reqTimeout?: number
  ): boolean | Observable<any> {
    if (this.checkConnection()) {
      if (reqOpts) {
        reqOpts.withCredentials = true;
      } else {
        reqOpts = {
          withCredentials: true,
        };
      }

      if (this.utils.getToken()) {
        reqOpts.body = bodyData;
        reqOpts.headers = this.getHeaders();
      }

      return this.http.delete<any>(this.setConnection() + url, reqOpts).pipe(
        timeout(reqTimeout ? reqTimeout : 300000),
        retry(maxRetry ? maxRetry : 0),
        catchError((error: any, caught: Observable<HttpEvent<any>>) => {
          this.handlerResponseService.failedResponse(error);

          if (error.status === 0) {
            return of(error);
          }

          throw error;
        })
      );
    } else {
      return false;
    }
  }

  checkConnection(): boolean {
    return navigator.onLine;
    // return true;
  }

  setConnection(): string {
    if (this.utils.getMode() == 'offline') {
      // use dev api
      return this.apiURL;
    } else {
      // use prod api
      return this.apiURL;
    }
  }
}
