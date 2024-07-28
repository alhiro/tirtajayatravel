import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '@env/environment';
import { Logger, UntilDestroy, untilDestroyed } from '@shared';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';

const log = new Logger('Login');

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  version: string | null = environment.version;
  error: string | undefined;
  hasError!: boolean;
  loginForm!: FormGroup;
  isLoading = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private handlerResponseService: HandlerResponseService
  ) {
    const credentialsKey = 'credentials';
    sessionStorage.removeItem(credentialsKey);
    localStorage.removeItem(credentialsKey);

    this.initForm();
  }

  ngOnInit() {}

  login() {
    this.isLoading = true;
    this.hasError = false;
    const loginSubscr = this.authenticationService
      .login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        (user: any) => {
          if (user) {
            log.debug(`${user.userName} successfully logged in`);
            this.router.navigate([this.route.snapshot.queryParams['redirect'] || '/'], { replaceUrl: true });
          } else {
            log.debug(`Login error: ${user}`);
            this.isLoading = false;
            this.hasError = true;
            // this.error = user.message;
          }
        },
        (error) => {
          console.log(error);
          this.handlerResponseService.failedResponse(error);
        }
      );
    this.unsubscribe.push(loginSubscr);
  }

  // login() {
  //   this.isLoading = true;
  //   const login$ = this.authenticationService.login(this.loginForm.value);
  //   login$
  //     .pipe(
  //       finalize(() => {
  //         this.loginForm.markAsPristine();
  //         this.isLoading = false;
  //       }),
  //       untilDestroyed(this)
  //     )
  //     .subscribe(
  //       (credentials) => {
  //         log.debug(`${credentials.username} successfully logged in`);
  //         this.router.navigate([this.route.snapshot.queryParams['redirect'] || '/'], { replaceUrl: true });
  //       },
  //       (error) => {
  //         log.debug(`Login error: ${error}`);
  //         this.error = error;
  //       }
  //     );
  // }

  private initForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      remember: true,
    });
  }
}
