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
import { DeliveryService } from './delivery.service';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalComponent, ModalConfig, ModalFullComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { EmployeeyModel } from '@app/pages/master/employee/models/employee.model';
import { PackageModel } from '../package/models/package.model';
import { PackageService } from '../package/package.service';
import { CarService } from '@app/pages/master/car/car.service';
import { GoSendModel } from '../package/models/gosend';
import { NavigationExtras, Router } from '@angular/router';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Utils } from '@app/@shared';
import { PassengerService } from '../passenger/passenger.service';
import { PassengerModel } from '../passenger/models/passenger.model';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
})
export class DeliveryComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public username!: string;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];
  public category: any;

  public city: any;
  public level: any;
  public dataLength!: number;
  public toggledRows = new Set<number>();
  public isCreate = false;
  public isCreateSP = false;

  public data: any;
  public dataSurabaya: any;
  public dataDetail: any;
  public dataDetailPackages: any;
  public dataDetailPassenger: any;
  public dataLengthMalang!: number;
  public dataLengthSurabaya!: number;

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
  @Input() cssClass!: '';
  currentTab = 'Malang';
  currentDisplay: boolean = false;

  public searchGlobal: any;

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

  form!: FormGroup;
  formSP!: FormGroup;

  isLoading = false;

  get f() {
    return this.form.controls;
  }

  get fsp() {
    return this.formSP.controls;
  }

  minDate: any;
  bookdate!: NgbDateStruct;
  booktime: NgbTimeStruct = { hour: 0, minute: 0, second: 0 };

  modalConfigCreate: ModalConfig = {
    modalTitle: 'Create Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigNewSP: ModalConfig = {
    modalTitle: 'Add Schedule Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigCreateSP: ModalConfig = {
    modalTitle: 'Add Schedule Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEditSP: ModalConfig = {
    modalTitle: 'Edit Schedule Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigDetailSP: ModalConfig = {
    modalTitle: 'Detail List SP',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  modalConfigGenerateSP: ModalConfig = {
    modalTitle: 'List Transaction',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  addClass = 'modal-clean';
  @ViewChild('modal') private modalComponent!: ModalComponent;
  @ViewChild('modalDetail') private modalComponentDetail!: ModalFullComponent;
  @ViewChild('modalSP') private modalComponentSP!: ModalComponent;
  @ViewChild('modalGeneratePackageSP') private modalComponentGeneratePackageSP!: ModalFullComponent;
  @ViewChild('modalGeneratePassengerSP') private modalComponentGeneratePassengerSP!: ModalFullComponent;

  dataDelivery!: GoSendModel;
  isDeliveryPackage = false;
  isDeliveryPassenger = false;
  setCity: any;
  isAssign = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private deliveryService: DeliveryService,
    private packageService: PackageService,
    private passengerService: PassengerService,
    private carService: CarService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService,
    private utils: Utils,
    private router: Router
  ) {
    this.initForm();

    this.levelrule = this.utils.getLevel();
    this.username = this.utils.getUsername();
    if (this.username === 'fomlg' && this.levelrule === 2) {
      this.currentTab = 'Malang';
    } else if (this.username === 'fosby' && this.levelrule === 2) {
      this.currentTab = 'Surabaya';
    } else if (this.username === 'admin_11' && this.levelrule === 8) {
      this.currentTab = 'Malang';
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
    this.dataListGosend(this.params);
    this.city = this.localService.getCity();
    this.level = this.localService.getPosition();

    // this.configuration.resizeColumn = true;
    // this.configuration.fixedColumnWidth = false;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'send_date', title: 'Departure Date' },
      { key: 'name', title: 'Driver' },
      { key: 'telp', title: 'Telp' },
      { key: 'description', title: 'Description' },
      { key: '', title: 'Items' },
      { key: 'car', title: 'Car' },
      { key: 'status', title: 'Status' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsPassenger = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'sp_package', title: 'SP' },
      { key: 'waybill_id', title: 'Waybill' },
      { key: 'destination_id', title: 'Destination' },
      { key: 'status', title: 'Status' },
      { key: 'position', title: 'Seat' },
    ];

    this.columnsPackage = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'level', title: 'Level' },
      { key: 'book_date', title: 'SP' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'origin_form', title: 'From' },
    ];
  }

  private initForm() {
    this.form = this.formBuilder.group({
      employee_id: [''],
      car_id: [''],
      city_id: [''],
      level_id: [''],
      nik: ['', Validators.compose([Validators.maxLength(50)])],
      name: ['', Validators.compose([Validators.maxLength(255)])],
      telp: ['', Validators.compose([Validators.maxLength(15)])],
      photo: ['', Validators.compose([Validators.maxLength(255)])],
      active: ['', Validators.compose([Validators.maxLength(5)])],
      log: ['', Validators.compose([Validators.maxLength(255)])],
    });

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
    console.log($event.event);
    if ($event.event === 'onPagination') {
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
    this.dataListGosend(params);
  }

  private dataListGosend(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        if (response) {
          const malangData = response.data?.filter(
            (data: GoSendModel) => data.city_id === 1 && data.bsd === null && data.bsd_passenger === null
          );
          const surabayaData = response.data?.filter(
            (data: GoSendModel) => data.city_id === 2 && data.bsd === null && data.bsd_passenger === null
          );

          // sample filter nested objects
          // const courses = [1, 6, 3];
          // const r = response.data.filter(d => d.courses.every(c => courses.includes(c.id)));
          // console.log(r);

          this.dataLengthMalang = malangData?.length;
          this.dataLengthSurabaya = surabayaData?.length;
          this.data = malangData;
          this.dataSurabaya = surabayaData;

          // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
          this.pagination.count =
            this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.configuration.horizontalScroll = false;

          this.dataLengthMalang = 0;
          this.dataLengthSurabaya = 0;
          this.data = [];
          this.dataSurabaya = [];
        }
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

  async printSP(val: any, item: any) {
    // const navigationExtras: NavigationExtras = {
    //   state: {
    //     data: val,
    //   },
    // };

    // this.router.navigate(['/departure/delivery/printsp'], navigationExtras);
    // await this.modalComponentDetail.dismiss();
    // window.open('departure/delivery/printsp', '_blank');

    // const newData = val.map((data: any) => ({
    //   ...data,
    //   type: item
    // }))
    // console.log(newData);

    sessionStorage.setItem('printsp', JSON.stringify(val));
    sessionStorage.setItem('detailsp', JSON.stringify(this.dataDetail));
    sessionStorage.setItem('type', JSON.stringify(item));
    window.open('#/booking/departure/delivery/printsp', '_blank');
  }

  async openModalView(val: GoSendModel) {
    console.log(val);
    console.log(val?.packages);
    console.log(val?.passengers);
    this.dataDetail = val;
    this.dataDetailPackages = val?.packages;
    this.dataDetailPassenger = val?.passengers;

    return await this.modalComponentDetail.open().then(
      (resp: any) => {
        console.log(resp);

        if (resp === true || resp === 1) {
          this.dataListGosend(this.params);
          console.log('User closes or esc');
        }
      },
      () => {
        console.log('Backdrop click');
      }
    );
  }

  clearForm() {
    this.form.reset();
  }

  async openModalNew() {
    this.isCreate = true;
    this.clearForm();
    return await this.modalComponent.open();
  }

  dataCreate() {
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.deliveryService
      .create(this.form.value)
      .pipe(
        finalize(() => {
          this.form.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataListGosend(this.params);
            await this.modalComponent.dismiss();
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
    this.unsubscribe.push(catSubscr);
  }

  async openModalEdit(event: EmployeeyModel) {
    this.isCreate = false;

    this.form.patchValue({
      employee_id: event.employee_id,
      car_id: Number(event.car_id),
      city_id: Number(event.city_id),
      level_id: Number(event.level_id),
      nik: event.nik,
      name: event.name,
      telp: event.telp,
      photo: event.photo,
      active: event.active,
      log: event.log,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.deliveryService
      .edit(this.form.value)
      .pipe(
        finalize(() => {
          this.form.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataListGosend(this.params);
            await this.modalComponent.dismiss();
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
    this.unsubscribe.push(catSubscr);
  }

  // SP
  clearFormSP() {
    this.formSP.reset();
  }

  async openModalNewSP() {
    this.isCreateSP = true;

    this.clearFormSP();
    this.modelEmployee = '';
    this.modelCar = '';

    const getDate = new Date();
    this.formatDateNow(getDate);

    this.formSP.patchValue({
      city_id: this.currentTab === 'Malang' ? 1 : 2,
    });

    return await this.modalComponentSP.open();
  }

  dataCreateSP() {
    const valueSendDate = new Date(
      Date.UTC(this.bookdate.year, this.bookdate.month - 1, this.bookdate.day, this.booktime.hour, this.booktime.minute)
    ).toISOString();
    console.log(valueSendDate);

    this.formSP.patchValue({
      send_date: valueSendDate,
      employee_id: this.modelEmployee?.employee_id,
      car_id: this.modelCar?.car_id,
    });
    console.log(this.formSP.value);

    // send data to gosend, package
    this.isLoading = true;
    this.packageService
      .createSP(this.formSP.value)
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
              duration: 5000,
            });

            this.dataListGosend(this.params);
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

  async openModalEditSP(event: any) {
    this.isCreateSP = false;
    console.log(event);

    this.formatDateValue(event.send_date);

    this.modelEmployee = event.employee;
    this.modelCar = event.car;

    this.formSP.patchValue({
      go_send_id: event.go_send_id,
      city_id: event.city_id,
      package_id: event.package_id,
      send_time: event.send_time,
      send_date: event.send_date,
      sp_number: event.sp_number,
      sp_package: event.sp_package,
      sp_passenger: event.sp_passenger,
      bsd: event.bsd,
      bsd_passenger: event.bsd_passenger,
      box: event.box,
      bsd_box: event.bsd_box,
      description: event.description,
      status: event.status,
    });

    return await this.modalComponentSP.open();
  }

  dataEditSP() {
    console.log(this.modelEmployee);
    console.log(this.modelCar);

    const valueSendDate = new Date(
      Date.UTC(this.bookdate.year, this.bookdate.month - 1, this.bookdate.day, this.booktime.hour, this.booktime.minute)
    ).toISOString();
    console.log(valueSendDate);

    this.formSP.patchValue({
      employee_id: this.modelEmployee?.employee_id,
      car_id: this.modelCar?.car_id,
      send_date: valueSendDate,
    });
    console.log(this.formSP.value);

    // send data to gosend, package
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
              duration: 5000,
            });

            this.dataListGosend(this.params);
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

  handleEventAssign(isAssign: boolean) {
    console.log(isAssign);
    this.isAssign = isAssign;
  }

  async openModalGeneratePackageSP(event: GoSendModel) {
    console.log(event);
    this.isDeliveryPackage = true;
    this.dataDelivery = event;
    this.setCity = this.currentTab;
    console.log(this.setCity);

    return await this.modalComponentGeneratePackageSP.open().then(
      (resp: any) => {
        console.log(resp);
        console.log(this.isAssign);

        if (resp === true || resp === 1) {
          if (this.isAssign === true) {
            this.isDeliveryPackage = false;
            this.dataListGosend(this.params);
            console.log('User closes or esc after submit');
          } else {
            this.isDeliveryPackage = false;
            console.log('User closes or esc');
          }
        }
      },
      () => {
        console.log('Backdrop click');
      }
    );
  }

  async openModalGeneratePassengerSP(event: GoSendModel) {
    console.log(event);
    this.isDeliveryPassenger = true;
    this.dataDelivery = event;
    this.setCity = this.currentTab;
    console.log(this.setCity);

    return await this.modalComponentGeneratePassengerSP.open().then(
      (resp: any) => {
        console.log(resp);
        console.log(this.isAssign);

        if (resp === true || resp === 1) {
          if (this.isAssign === true) {
            this.isDeliveryPassenger = false;
            this.dataListGosend(this.params);
            console.log('User closes or esc after submit');
          } else {
            this.isDeliveryPassenger = false;
            console.log('User closes or esc');
          }
        }
      },
      () => {
        console.log('Backdrop click');
      }
    );
  }

  formatter = (result: { name: string; car_number: string }) => result.car_number;

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

  searchDataCar = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingCar = true)),
      switchMap((term) =>
        this.carService
          .list({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: this.params.startDate,
            endDate: this.params.endDate,
          })
          .pipe(
            tap(() => (this.searchFailedCar = false)),
            map((response: any) => {
              if (response) {
                tap(() => (this.searchingCar = false));
                return response.data.filter(
                  (val: any) => val.car_number.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              }
            }),
            catchError(() => {
              this.searchFailedCar = true;
              return of([]);
            })
          )
      ),
      tap(() => (this.searchingCar = false))
    );

  removeDriverSPPackage(event: GoSendModel) {
    const updateSP: any = {
      package_id: event.package_id,
      go_send_id: event.go_send_id,
      status_package: 'Progress',
    };
    console.log(updateSP);

    // send data to package
    this.isLoading = true;
    this.packageService
      .patch(updateSP)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataDetailPackages = resp.data.packages;
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

  removeDriverSPPassenger(event: GoSendModel) {
    const updateSP: any = {
      passenger_id: event.passenger_id,
      go_send_id: event.go_send_id,
      status_passenger: 'Progress',
    };
    console.log(updateSP);

    // send data to package
    this.isLoading = true;
    this.passengerService
      .patch(updateSP)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            let city: any;
            if (this.currentTab === 'Malang') {
              city = 1;
            } else if (this.currentTab === 'Surabaya') {
              city = 2;
            }

            this.dataDetailPassenger = resp.data.passengers;
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

  searchDataGoSend: any = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      tap(() => (this.configuration.isLoading = true)),
      switchMap((term) =>
        this.deliveryService
          .search({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: this.params.startDate,
            endDate: this.params.endDate,
          })
          .pipe(
            map((response: any) => {
              this.configuration.isLoading = false;

              if (response) {
                if (term !== '') {
                  const malangData = response.data?.filter(
                    (data: GoSendModel) => data.city_id === 1 && data.bsd === null && data.bsd_passenger === null
                  );
                  const surabayaData = response.data?.filter(
                    (data: GoSendModel) => data.city_id === 2 && data.bsd === null && data.bsd_passenger === null
                  );

                  this.dataLengthMalang = malangData?.length;
                  this.dataLengthSurabaya = surabayaData?.length;
                  this.data = malangData;
                  this.dataSurabaya = surabayaData;

                  // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
                  this.pagination.count =
                    this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
                  this.pagination = { ...this.pagination };
                  this.configuration.isLoading = false;
                  this.cdr.detectChanges();
                } else {
                  this.dataListGosend(this.params);
                }
              } else {
                this.dataLengthMalang = 0;
                this.dataLengthSurabaya = 0;
                this.data = [];
                this.dataSurabaya = [];
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
