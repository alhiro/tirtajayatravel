import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalComponent, ModalConfig, ModalFullComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { EmployeeyModel } from '@app/pages/master/employee/models/employee.model';
import { CarService } from '@app/pages/master/car/car.service';
import { NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Utils } from '@app/@shared';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { PackageService } from '@app/pages/booking/package/package.service';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}
@Component({
  selector: 'app-monitoring-package',
  templateUrl: './monitoring-package.component.html',
  styleUrls: ['./monitoring-package.component.scss'],
})
export class MonitoringPackageComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public username!: string;
  public city_id!: number;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];
  public category: any;

  public city: any;
  public level: any;

  public toggledRows = new Set<number>();
  public isCreate = false;
  public isCreateSP = false;

  public data: any;
  public dataLength!: number;

  public modelEmployee: any;
  public modelCar: any;
  public searching = false;
  public searchingRecipient = false;
  public searchingEmployee = false;
  public searchingCar = false;
  public searchFailed = false;
  public searchFailedRecipient = false;
  public searchFailedEmployee = false;
  public searchFailedCar = false;

  public configuration: Config = { ...DefaultConfig };
  public configurationDetail: Config = { ...DefaultConfig };
  @Input() cssClass!: '';
  currentTab = 'Malang';
  currentDisplay: boolean = false;

  public searchGlobal: any;

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: '',
  };
  public params = {
    limit: 10,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: '',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;

  isLoading = false;

  get f() {
    return this.form.controls;
  }

  minDate: any;
  bookdate!: NgbDateStruct;
  booktime: NgbTimeStruct = { hour: 0, minute: 0, second: 0 };

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private handlerResponseService: HandlerResponseService,
    private utils: Utils,
    private packageService: PackageService
  ) {
    this.levelrule = this.utils.getLevel();
    this.city_id = this.utils.getCity();
    this.username = this.utils.getUsername();
    if (this.levelrule === 2 && this.city_id == 1) {
      this.currentTab = 'Malang';
    } else if (this.levelrule === 2 && this.city_id == 2) {
      this.currentTab = 'Surabaya';
    }

    // set min selected date
    const minDate = this.utils.indonesiaDateFormat(new Date());
    this.minDate = {
      year: minDate.getFullYear(),
      month: minDate.getMonth() + 1,
      day: minDate.getDate(),
    };
    var getDate = new Date(minDate);
    this.formatDateNow(getDate);
  }

  ngOnInit() {
    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: '',
      endDate: '',
      city: this.currentTab,
      status: this.pagination.status,
    };

    this.dataListGosend(this.params);

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = true;

    this.columnsPackage = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'level', title: 'Level' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'book_date', title: 'Book Date' },
      { key: 'created_at', title: 'Created At' },
      { key: 'status_package', title: 'Status Package' },
    ];
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;

    if (this.currentTab === 'Malang') {
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
        city: this.currentTab,
        status: '',
      };
      this.dataListGosend(this.params);
    } else if (this.currentTab === 'Surabaya') {
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
        city: this.currentTab,
        status: '',
      };
      this.dataListGosend(this.params);
    }
  }

  setCurrentDisplay() {
    this.currentDisplay = !this.currentDisplay;
  }

  eventEmitted($event: { event: string; value: any }): void {
    console.log($event.event);
    if ($event.event === 'onPagination') {
      this.parseEvent($event);
    }
  }

  private parseEvent(obj: EventObject): void {
    this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    this.pagination = { ...this.pagination };
    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
      city: this.currentTab,
      status: this.pagination.status,
    }; // see https://github.com/typicode/json-server
    this.dataListGosend(this.params);
  }

  private dataListGosend(params: ExtendedPaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .search(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError((err) => {
          this.configuration.isLoading = false;
          this.handlerResponseService.failedResponse(err);
          return of([]);
        })
      )
      .subscribe((response: any) => {
        this.data = response.data;
        this.dataLength = response.length;

        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
        this.pagination.count = response.length;
        this.pagination = { ...this.pagination };
        console.log(this.pagination);

        this.configuration.isLoading = false;

        response?.length > 0
          ? (this.configuration.horizontalScroll = true)
          : (this.configuration.horizontalScroll = false);
        this.cdr.detectChanges();
      });
  }

  onDateChange(date: NgbDateStruct): void {
    this.bookdate = date;
  }

  formatDateNow(event: any) {
    const valDate = {
      year: event.getFullYear(),
      month: event.getMonth() + 1,
      day: event.getDate(),
    };
    this.bookdate = { year: valDate.year, month: valDate.month, day: valDate.day };
    console.log(this.bookdate);

    const valTime = {
      hour: event.getHours(),
      minute: event.getMinutes(),
      second: event.getSeconds(),
    };
    this.booktime = { hour: valTime.hour == 0 ? 1 : valTime.hour, minute: 0, second: 0 };
    console.log(this.booktime);
  }

  formatDateValue(value: any) {
    const eventDate = moment.utc(value);
    console.log('event eventDate', eventDate);
    const valDate = {
      year: eventDate.year(),
      month: eventDate.month() + 1,
      day: eventDate.date(),
    };
    this.bookdate = { year: valDate.year, month: valDate.month, day: valDate.day };
    console.log(this.bookdate);

    const valTime = {
      hour: eventDate.hour(),
      minute: eventDate.minute(),
      second: eventDate.second(),
    };
    this.booktime = { hour: valTime.hour == 0 ? 1 : valTime.hour, minute: 0, second: 0 };
    console.log(this.booktime);
  }

  searchDataPackage: any = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      tap(() => (this.configuration.isLoading = true)),
      switchMap((term) =>
        this.packageService
          .search({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: this.params.startDate,
            endDate: this.params.endDate,
            city: this.currentTab,
            status: this.params.status,
          })
          .pipe(
            map((response: any) => {
              this.configuration.isLoading = false;

              if (response) {
                this.dataLength = response.length;
                this.data = response.data;

                // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
                this.pagination.count =
                  this.pagination.count === -1 ? (this.data ? this.data.length : 0) : this.pagination.count;
                this.pagination = { ...this.pagination };

                this.configuration.isLoading = false;
                this.cdr.detectChanges();
              } else {
                this.dataLength = 0;
                this.data = [];
              }
            }),
            catchError(() => {
              this.configuration.isLoading = false;

              return of([]);
            })
          )
      )
    );
}
