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
import { DeliveryService } from '../../booking/delivery/delivery.service';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalComponent, ModalConfig, ModalFullComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { PackageService } from '../../booking/package/package.service';
import { GoSendModel } from '../../booking/package/models/gosend';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Utils } from '@app/@shared';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-bsd',
  templateUrl: './bsd.component.html',
  styleUrls: ['./bsd.component.scss'],
})
export class BsdComponent implements OnInit, OnDestroy {
  @ViewChild('table') table!: APIDefinition;
  public columnsList!: Columns[];
  public columnsDone!: Columns[];

  public city: any;
  public level: any;
  public toggledRows = new Set<number>();

  public dataBSDList: any;
  public dataBSDDone: any;
  public dataLengthBSDList!: number;
  public dataLengthBSDDone!: number;

  public modelEmployee: any;
  public modelCar: any;

  public searchFailed = false;
  public searchingEmployee = false;
  public searchFailedEmployee = false;

  public configuration: Config = { ...DefaultConfig };
  @Input() cssClass!: '';
  currentTab = 'Done';
  currentDisplay: boolean = false;

  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };
  public params = {
    limit: 10,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  formSP!: FormGroup;

  isLoading = false;

  get fsp() {
    return this.formSP.controls;
  }

  minDate: any;
  bookdate!: NgbDateStruct;
  booktime: NgbTimeStruct = { hour: 0, minute: 0, second: 0 };

  modalConfigEditSP: ModalConfig = {
    modalTitle: 'Add BSD',
    // dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  addClass = 'modal-clean';
  @ViewChild('modalSP') private modalComponentSP!: ModalFullComponent;

  dataDelivery!: GoSendModel;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private deliveryService: DeliveryService,
    private packageService: PackageService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService,
    private utils: Utils
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.dataListBSD(this.params);
    this.city = this.localService.getCity();
    this.level = this.localService.getPosition();

    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.horizontalScroll = false;

    this.columnsDone = [
      // { key: 'go_send_id', title: 'No' },
      { key: 'employee_id', title: 'Driver' },
      { key: 'bsd_date', title: 'BSD Date' },
      { key: 'bsd', title: 'BSD Package' },
      { key: 'bsd_passenger', title: 'BSD Passenger' },
      { key: 'bsd_box', title: 'BSD Box' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsList = [
      // { key: 'go_send_id', title: 'No' },
      { key: 'sp_passenger', title: 'SP Passenger' },
      { key: 'sp_package', title: 'SP Package' },
      { key: 'employee_id', title: 'Driver' },
      { key: 'send_date', title: 'Send Date' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];
  }

  private initForm() {
    this.formSP = this.formBuilder.group({
      go_send_id: '',
      employee_id: '',
      car_id: '',
      city_id: '',
      package_id: '',
      telp: '',
      description: '',
      status: '',
      send_time: '',
      send_date: '',
      sp_number: '',
      sp_package: '',
      sp_passenger: '',
      bsd: '',
      bsd_passenger: '',
      bsd_date: '',
      box: '',
      bsd_box: '',
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
  }

  setCurrentDisplay() {
    this.currentDisplay = !this.currentDisplay;
  }

  eventEmitted($event: { event: string; value: any }): void {
    if ($event.event !== 'onClick') {
      this.parseEvent($event);
    }
  }

  private parseEvent(obj: EventObject): void {
    this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    this.pagination = { ...this.pagination };
    const params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
    }; // see https://github.com/typicode/json-server
    this.dataListBSD(params);
  }

  private dataListBSD(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError((err) => {
          this.configuration.isLoading = false;
          this.handlerResponseService.failedResponse(err);
          return of([]);
        })
      )
      .subscribe((response: any) => {
        if (response) {
          this.configuration.isLoading = false;

          const dataBSDList = response.data?.filter(
            (data: any) =>
              (data.packages.length > 0 || data.passengers.length > 0) &&
              data.bsd === null &&
              data.bsd_passenger === null
          );
          this.dataLengthBSDList = dataBSDList?.length;
          this.dataBSDList = dataBSDList;

          const dataBSDDone = response.data?.filter(
            (data: GoSendModel) => data.bsd !== null || data.bsd_passenger !== null
          );
          this.dataLengthBSDDone = dataBSDDone?.length;
          this.dataBSDDone = dataBSDDone;

          // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
          this.pagination.count =
            this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onDateChange(date: NgbDateStruct): void {
    this.bookdate = date;
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

  // BSD
  async openModalEditSP(event: GoSendModel) {
    console.log(event);

    this.modelEmployee = event?.employee;
    this.modelCar = event?.car;

    this.formSP.patchValue({
      go_send_id: event.go_send_id,
      employee_id: event.employee_id,
      car_id: event.car_id,
      city_id: event.city_id,
      package_id: event.package_id,
      send_time: event.send_time,
      send_date: event.send_date,
      sp_number: event.sp_number,
      sp_package: event.sp_package,
      sp_passenger: event.sp_passenger,
      bsd: event.bsd,
      bsd_passenger: event.bsd_passenger,
      bsd_date: new Date(),
      box: event.box,
      bsd_box: event.bsd_box,
      description: event.description,
      status: event.status,
    });

    return await this.modalComponentSP.open();
  }

  dataEditSP() {
    console.log(this.formSP.value);

    // send data to gosend
    this.isLoading = true;
    this.packageService
      .editSP(this.formSP.value)
      .pipe(
        finalize(() => {
          this.formSP.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 10000,
            });

            this.dataListBSD(this.params);
            await this.modalComponentSP.dismiss();
          } else {
            this.isLoading = false;
          }
        },
        (error: any) => {
          console.log(error);
          this.isLoading = false;
          this.handlerResponseService.failedResponse(error);
        }
      );
  }

  searchDataEmployee = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingEmployee = true)),
      switchMap((term) =>
        this.deliveryService
          .list({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: this.params.startDate,
            endDate: this.params.endDate,
          })
          .pipe(
            tap(() => (this.searchFailedEmployee = false)),
            map((response: any) => {
              if (response) {
                let city: any;
                if (this.currentTab === 'Malang') {
                  city = 1;
                } else if (this.currentTab === 'Surabaya') {
                  city = 2;
                }

                const kurir = response.data.filter((val: any) => val.level_id === 5 && val.city_id === city);
                tap(() => (this.searchingEmployee = false));
                return kurir.filter((val: any) => val.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
              }
            }),
            catchError(() => {
              this.searchFailedEmployee = true;
              return of([]);
            })
          )
      ),
      tap(() => (this.searchingEmployee = false))
    );

  formatter = (result: { name: string; car_number: string }) => result.car_number;

  printBSD(val: GoSendModel, item: string) {
    sessionStorage.setItem('printbsd', JSON.stringify(val));
    sessionStorage.setItem('type', JSON.stringify(item));
    window.open('#/finance/bsd/tirta-jaya/printbsd', '_blank');
  }
}
