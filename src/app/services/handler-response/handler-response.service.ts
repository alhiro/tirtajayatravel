import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StatusCode } from './status-code.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromEvent, merge, Subscription, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Utils } from '@app/@shared/utility/utils';

@Injectable({
  providedIn: 'root',
})
export class HandlerResponseService {
  constructor(private utils: Utils, private router: Router, private snackbar: MatSnackBar) {}

  successResponse(response: { status: any; message: string }): any {
    switch (response.status) {
      case StatusCode.SUCCESS:
        // this.utils.showNotification('success', 'Sukses', response.message);
        break;
    }

    return response;
  }

  failedResponse(error: any): any {
    switch (error.status) {
      case StatusCode.UNAUTHORIZED:
        // go to login
        this.snackbar.open(error.error.message, '', {
          panelClass: 'snackbar-error',
          duration: 50000,
        });
        this.utils.clearAllLocalstorage();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
        break;

      case StatusCode.FORBIDDEN:
        // show dialog
        this.snackbar.open(error.error.message, '', {
          panelClass: 'snackbar-error',
          duration: 50000,
        });
        this.utils.clearAllLocalstorage();

        setTimeout(() => {
          this.router.navigate(['/page-not-authorized']);
        }, 3000);
        // this.utils.showNotification('GENERAL', 'FORBIDDEN');
        break;

      case StatusCode.BAD_REQUEST:
        // show dialog
        // this.utils.showNotification('GENERAL', 'BAD_REQUEST');
        if (error) {
          this.snackbar.open(error.error.message, '', {
            panelClass: 'snackbar-error',
            duration: 50000,
          });

          // console.log(error);

          // this.messageService.add({
          //   key: 'global',
          //   severity: 'error',
          //   summary: 'Error Message',
          //   detail: error.error.error.message,
          // });
        }
        break;

      case StatusCode.NOT_FOUND:
        // show dialog
        if (error) {
          this.snackbar.open(error.statusText, '', {
            panelClass: 'snackbar-error',
            duration: 50000,
          });
        }
        break;

      case StatusCode.GATEWAY_TIMEOUT:
        // show dialog
        if (error) {
          this.snackbar.open(error.statusText, '', {
            panelClass: 'snackbar-error',
            duration: 50000,
          });
        }
        break;

      case StatusCode.METHOD_NOT_ALLOWED:
        // show dialog
        this.snackbar.open('Method not allowed', '', {
          panelClass: 'snackbar-error',
          duration: 50000,
        });
        break;

      case StatusCode.SERVER_ERROR:
        // show dialog
        // this.utils.showNotification('GENERAL', 'SERVER_ERROR');
        this.snackbar.open('Internal Server Error ', '', {
          panelClass: 'snackbar-error',
          duration: 50000,
        });
        break;

      case StatusCode.ERR_INTERNET_DISCONNECTED:
        // show dialog
        this.snackbar.open('Disconnection from server ', '', {
          panelClass: 'snackbar-error',
          duration: 50000,
        });
        break;
    }

    return of(error);
  }

  checkNetworkStatus(): any {
    let statusNetwork: any = navigator.onLine;
    let statusNetwork$: Subscription = Subscription.EMPTY;
    statusNetwork$ = merge(of(null), fromEvent(window, 'online'), fromEvent(window, 'offline'))
      .pipe(map(() => navigator.onLine))
      .subscribe((status) => {
        statusNetwork = status;
      });
    if (!statusNetwork) {
      this.snackbar.open('Disconnection from server', 'Info', {
        panelClass: 'snackbar-error',
        duration: 50000,
      });
    }
    return statusNetwork;
  }
}
