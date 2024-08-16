import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
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
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalComponent, ModalConfig, ModalXlComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { AddressModel } from '@app/pages/master/customer/models/address.model';
import { CustomerService } from '@app/pages/master/customer/customer.service';
import { CategoryService } from '@app/pages/master/category/category.service';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbDropdown, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '@app/pages/master/employee/employee.service';
import { CarService } from '@app/pages/master/car/car.service';
import { PassengerService } from './passenger.service';
import { PassengerModel } from './models/passenger.model';
import { Utils, padNumber } from '@app/@shared';
import * as moment from 'moment';
import { GoSendModel } from '../package/models/gosend';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-passenger',
  templateUrl: './passenger.component.html',
  styleUrls: ['./passenger.component.scss'],
})
export class PassengerComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public username!: string;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public defaultAddressCustomer: any;
  public defaultAddressDestination: any;
  public dataRow: any;
  public data: any;
  public dataCustomer: any;
  public dataSurabaya: any;
  public dataMove: any;
  public dataCancel: any;
  public dataHistory: any;
  public company: any;
  public business: any;
  public category: any;
  public request: any;
  public status: any;
  public class: any;
  public payment: any;
  public statusPassenger: any;
  public city: any;
  public dataLengthMalang!: number;
  public dataLengthSurabaya!: number;
  public dataLengthMove!: number;
  public dataLengthCancel!: number;
  public dataLengthHistory!: number;
  public dataLengthCustomer!: number;
  public toggledRows = new Set<number>();

  public isCreate = false;
  public isCreateAddress = false;
  public isCreateSP!: boolean;

  public selectedAddress: any;
  public selectedAddressDestination: any;
  public searchCustomer!: string;
  public modelCustomer: any;
  public modelDestination: any;
  public modelAddress: any;
  public modelAddressId: any;
  public modelAddressIdDestination: any;
  public modelEmployee: any;
  public modelCar: any;
  public searching = false;
  public searchingDestination = false;
  public searchingEmployee = false;
  public searchingCar = false;
  public searchFailed = false;
  public searchFailedDestination = false;
  public searchFailedEmployee = false;
  public searchFailedCar = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination = {
    limit: 10,
    offset: 1,
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
  formAddress!: FormGroup;
  formSP!: FormGroup;
  isLoading = false;
  isLoadingCustomer = false;

  get f() {
    return this.form.controls;
  }
  get fa() {
    return this.formAddress.controls;
  }
  get fsp() {
    return this.formSP.controls;
  }

  modalConfigCreate: ModalConfig = {
    modalTitle: 'Create Passenger',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Passenger',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigCreateAddress: ModalConfig = {
    modalTitle: 'Create Address',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEditAddress: ModalConfig = {
    modalTitle: 'Edit Address',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigCreateSP: ModalConfig = {
    modalTitle: 'Process SP',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEditSP: ModalConfig = {
    modalTitle: 'Edit SP',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalXlComponent;
  @ViewChild('modalAddress') private modalComponentAddress!: ModalComponent;
  @ViewChild('modalSP') private modalComponentSP!: ModalComponent;

  @Input() cssClass!: '';
  currentTab = 'Malang';

  minDate: any;
  bookdate!: NgbDateStruct;
  booktime: NgbTimeStruct = { hour: 0, minute: 0, second: 0 };

  calendar = inject(NgbCalendar);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 0);

  startDate: any;
  endDate: any;

  @Input() delivery!: GoSendModel;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private passengerService: PassengerService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private employeeService: EmployeeService,
    private carService: CarService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService,
    private utils: Utils
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

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      datepicker.close(); // Close datepicker popup

      // const valueBookFromDate = new Date(
      //   Date.UTC(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day, 0, 0)
      // ).toISOString();

      // const valueBookToDate = new Date(
      //   Date.UTC(this.toDate.year, this.toDate.month - 1, this.toDate.day, 23, 59)
      // ).toISOString();

      const valueBookFromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const valueBookToDate = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
      const { startDate, endDate } = this.utils.rangeDate(valueBookFromDate, valueBookToDate);
      this.startDate = startDate;
      this.endDate = endDate;

      const params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.startDate,
        endDate: this.endDate,
      };
      console.log(params);
      this.dataList(params);
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  resetFilterDate(datepicker: any) {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 0);
    this.dataList(this.params);
    datepicker.close();
  }

  printFilterDate(datepicker: any) {
    if (this.currentTab === 'Malang') {
      console.log(this.data);
      sessionStorage.setItem('city', JSON.stringify('Malang'));
      sessionStorage.setItem('printlist', JSON.stringify(this.data));
    } else if (this.currentTab === 'Surabaya') {
      console.log(this.dataSurabaya);
      sessionStorage.setItem('city', JSON.stringify('Surabaya'));
      sessionStorage.setItem('printlist', JSON.stringify(this.dataSurabaya));
    }

    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
    };
    console.log(dateRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('#/booking/passenger/transaction/printlist', '_blank');
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  ngOnInit() {
    this.dataCategory();
    this.dataList(this.params);
    this.company = this.localService.getCompany();
    this.business = this.localService.getBusiness();
    this.request = this.localService.getRequest();
    this.status = this.localService.getStatus();
    this.class = this.localService.getClass();
    this.payment = this.localService.getPayment();
    this.statusPassenger = this.localService.getStatusPassenger();
    this.city = this.localService.getCity();

    // this.configuration.resizeColumn = true;
    // this.configuration.fixedColumnWidth = false;
    this.configuration.showDetailsArrow = true;
    this.configuration.detailsTemplate = true;
    this.configuration.horizontalScroll = true;

    this.columns = [
      // { key: 'passenger_id', title: 'No' },
      { key: 'resi_number', title: 'Number Resi' },
      { key: 'book_date', title: 'Book Date' },
      { key: 'tariff', title: 'Price' },
      { key: 'status', title: 'Status Payment' },
      { key: 'total_passenger', title: 'Total Passenger' },
      { key: 'customer.address', title: 'Pickup Address' },
      { key: 'customer.address', title: 'Delivery Address' },
      { key: 'description', title: 'Description' },
      { key: 'created_at', title: 'Created At' },
      { key: 'status_passenger', title: 'Status' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      passenger_id: [''],
      waybill_id: [''],
      destination_id: [''],
      city_id: [''],
      employee_id: [''],
      go_send_id: [''],
      tariff: [''],
      discount: [0],
      agent_commission: [0],
      other_fee: [0],
      book_date: [''],
      total_passenger: [''],
      payment: [''],
      status: [''],
      status_passenger: [''],
      note: [''],
      description: [''],
      resi_number: [''],
      cancel: [''],
      move: [''],
      position: [''],
      charter: [''],
      check_payment: [''],
    });

    this.formAddress = this.formBuilder.group({
      address_id: [''],
      customer_id: ['', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.maxLength(100)])],
      address: ['', Validators.compose([Validators.maxLength(255)])],
      telp: ['', Validators.compose([Validators.maxLength(255)])],
      default: [''],
      longitude: [null, Validators.compose([Validators.maxLength(100)])],
      latitude: [null, Validators.compose([Validators.maxLength(100)])],
      zoom: [7, Validators.compose([Validators.maxLength(5)])],
      description: ['', Validators.compose([Validators.maxLength(255)])],
      used: ['', Validators.compose([Validators.maxLength(255)])],
    });

    this.formSP = this.formBuilder.group({
      go_send_id: '',
      employee_id: '',
      car_id: '',
      city_id: '',
      passenger_id: '',
      telp: '',
      send_time: '',
      send_date: '',
      sp_number: '',
      sp_package: '',
      sp_passenger: '',
      bsd: '',
      bsd_passenger: '',
      box: '',
      bsd_box: '',
      description: [''],
      status: [''],
    });
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

  setCurrentTab(tab: string) {
    this.currentTab = tab;
  }

  checkLevel(event: Event) {
    console.log(event.target);
  }

  private dataCategory(): void {
    this.configuration.isLoading = true;
    this.categoryService
      .all()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        this.category = response.data;
      });
  }

  eventEmitted($event: { event: string; value: any }): void {
    console.log('click table event');
    console.log($event.event);
    console.log($event.value);

    this.dataRow = $event.value.row;

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
    this.dataList(params);
  }

  private dataList(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.passengerService
      .list(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        // count malang or surabaya
        if (response.data.length > 0) {
          const malangData = response.data?.filter(
            (data: PassengerModel) =>
              data.city_id === 1 &&
              data.status_passenger !== 'Cancel' &&
              // data.status_passenger !== 'Delivery' &&
              data.status_passenger !== 'Completed'
          );
          const surabayaData = response.data?.filter(
            (data: PassengerModel) =>
              data.city_id === 2 &&
              data.status_passenger !== 'Cancel' &&
              // data.status_passenger !== 'Delivery' &&
              data.status_passenger !== 'Completed'
          );
          const cancelData = response.data?.filter((data: PassengerModel) => data.status_passenger === 'Cancel');
          const historyData = response.data?.filter((data: PassengerModel) => data.status_passenger === 'Completed');

          this.dataLengthMalang = malangData?.length;
          this.dataLengthSurabaya = surabayaData?.length;
          this.dataLengthCancel = cancelData?.length;
          this.dataLengthHistory = historyData?.length;

          this.data = malangData;
          this.dataSurabaya = surabayaData;
          this.dataCancel = cancelData;
          this.dataHistory = historyData;

          // set gosend empty or not
          // const createSP = response.data;
          // createSP?.forEach((val: any) => {
          //   if (val.go_send_id != null) {
          //     return (val.isCreateSP = false);
          //   } else {
          //     return (val.isCreateSP = true);
          //   }
          // });
          // console.log(createSP);

          // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
          this.pagination.count =
            this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.dataLengthMalang = 0;
          this.dataLengthSurabaya = 0;
          this.dataLengthCancel = 0;
          this.dataLengthHistory = 0;

          this.data = [];
          this.dataSurabaya = [];
          this.dataCancel = [];
          this.dataHistory = [];
        }
      });
  }

  // search2 = (text$: Observable<string>) =>
  //   text$.pipe(
  //       debounceTime(200),
  //       distinctUntilChanged(),
  //       tap(() => (this.searchFailed = true)),
  //       map((term: any) => {
  //         term.length < 2 ? [] : this.dataListCustomer(this.params, term);

  //         // return this.dataCustomer.filter((val: any) => val.name.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //       }),
  //       switchMap(() => this.dataCustomer),
  //       catchError((err) => {
  //         console.error('err', err);
  //         return of(undefined);
  //       }),
  //       tap(() => (this.searchFailed = false)),
  //   );

  searchDataEmployee = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingEmployee = true)),
      switchMap((term) =>
        this.employeeService
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
      tap(() => ((this.searchingCar = false), (this.modelAddressId = '')))
    );

  searchDataCustomer = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((term) =>
        this.customerService
          .list({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: this.params.startDate,
            endDate: this.params.endDate,
          })
          .pipe(
            tap(() => (this.searchFailed = false)),
            map((response: any) => {
              if (response) {
                tap(() => (this.searching = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              }
            }),
            catchError(() => {
              this.searchFailed = true;
              return of([]);
            })
          )
      ),
      tap(() => ((this.searching = false), (this.modelAddressId = '')))
    );

  selectAddress() {
    if (this.modelCustomer) {
      const getdAddress = this.modelCustomer?.addresses.find(
        (val: AddressModel) => val.address_id === Number(this.modelAddressId)
      );
      this.selectedAddress = getdAddress;
      console.log(this.selectedAddress);
    }
  }

  searchDataDestination = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingDestination = true)),
      switchMap((term) =>
        this.customerService
          .list({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: this.params.startDate,
            endDate: this.params.endDate,
          })
          .pipe(
            tap(() => (this.searchFailedDestination = false)),
            map((response: any) => {
              if (response) {
                tap(() => (this.searchingDestination = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              }
            }),
            catchError(() => {
              this.searchFailedDestination = true;
              return of([]);
            })
          )
      ),
      tap(() => ((this.searchingDestination = false), (this.modelAddressIdDestination = '')))
    );

  formatter = (result: { name: string; car_number: string }) => result.car_number;

  setDefaultSelectionDestination(value: any) {
    this.modelDestination?.addresses.forEach((item: AddressModel) => {
      console.log(item.address_id);
      console.log(value);
      item.default = item.address_id === Number(value);
    });
    console.log(this.modelDestination?.addresses);
  }

  findDatadestinationByValue(value: any) {
    return this.modelDestination?.addresses.find((val: AddressModel) => val.address_id === Number(value));
  }

  selectAddressDestination() {
    this.setDefaultSelectionDestination(this.modelAddressIdDestination);
    const getdAddress = this.findDatadestinationByValue(this.modelAddressIdDestination);
    this.selectedAddressDestination = getdAddress;
    console.log(this.selectedAddressDestination);

    if (this.selectedAddressDestination) {
      console.log('prosess update address destination');
      const dataAddress = {
        address_id: this.selectedAddressDestination.address_id,
        customer_id: this.selectedAddressDestination.customer_id,
        default: this.selectedAddressDestination.default,
      };
      console.log(this.formAddress.value);

      this.isLoading = true;
      this.passengerService
        .updateAddressDefault(dataAddress)
        .pipe(
          finalize(() => {
            this.formAddress.markAsPristine();
            this.isLoading = false;
          }),
          catchError(() => {
            this.isLoading = false;
            this.handlerResponseService.failedResponse('Failed selected address');
            return of([]);
          })
        )
        .subscribe((response: any) => {
          console.log('response address');
          console.log(response);
          if (response) {
            this.snackbar.open('Success selected address be default', '', {
              panelClass: 'snackbar-success',
              duration: 10000,
            });
          }
        });
    }
  }

  onDateChange(date: NgbDateStruct): void {
    this.bookdate = date;
  }

  onTimehange(time: NgbTimeStruct): void {
    this.booktime = time;
  }

  format(date: NgbDateStruct): string {
    return date ? `${date.day}/${date.month}/${date.year}` : '';
  }

  clearForm() {
    this.form.reset();
  }

  async openModalNew() {
    this.isCreate = true;
    this.clearForm();
    this.modelCustomer = '';
    this.modelAddressId = '';
    this.modelDestination = '';
    this.modelAddressIdDestination = '';

    let city: any = '';
    if (this.currentTab === 'Malang') {
      city = 1;
    } else if (this.currentTab === 'Surabaya') {
      city = 2;
    }

    const getDate = new Date();
    this.formatDateNow(getDate);

    this.form.patchValue({
      city_id: city,
      category_id: '',
      request: '',
      status: '',
      payment: '',
      status_passenger: 'Progress',
    });

    return await this.modalComponent.open();
  }

  dataCreate() {
    const valueBookDate = new Date(
      Date.UTC(
        this.bookdate.year,
        this.bookdate.month - 1,
        this.bookdate.day,
        this.booktime ? this.booktime.hour : 0,
        this.booktime ? this.booktime.minute : 0
      )
    ).toISOString();
    console.log(valueBookDate);

    this.form.patchValue({
      book_date: valueBookDate,
    });

    const dataCustomert: any = {
      customer_id: this.modelCustomer?.customer_id,
    };
    console.log(dataCustomert);

    const dataReceipt: any = {
      customer_id: this.modelDestination?.customer_id,
    };
    console.log(dataReceipt);

    // create send data to waybill, destination, passenger
    this.isLoading = true;
    this.passengerService
      .createWaybill(dataCustomert)
      .pipe(
        switchMap((respCustomer: any) => {
          console.log('Response from respCustomer:', respCustomer);
          this.form.patchValue({
            waybill_id: respCustomer.data.waybill_id,
          });
          return this.passengerService.createDestination(dataReceipt);
        }),
        switchMap((respDestination: any) => {
          console.log('Response from respDestination:');
          console.log(respDestination);
          this.form.patchValue({
            destination_id: respDestination.data.destination_id,
          });
          console.log(this.form.value);
          return this.passengerService.create(this.form.value);
        }),
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
              duration: 10000,
            });

            this.dataList(this.params);
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
  }

  async openModalEdit(event: PassengerModel) {
    console.log(event);
    this.isCreate = false;

    this.formatDateValue(event?.book_date);

    this.modelCustomer = event.waybill?.customer;
    const getdAddressCustomer = this.modelCustomer?.addresses.find(
      (val: AddressModel) => val.customer_id === Number(this.modelCustomer?.customer_id) && val.default === true
    );
    this.modelAddressId = getdAddressCustomer?.address_id;
    console.log(this.modelAddressId);
    this.selectedAddress = getdAddressCustomer;
    console.log(this.selectedAddress);

    this.modelDestination = event.destination?.customer;
    const getdAddressDestination = this.modelDestination?.addresses.find(
      (val: AddressModel) => val.customer_id === Number(this.modelDestination?.customer_id) && val.default === true
    );
    this.modelAddressIdDestination = getdAddressDestination?.address_id;
    console.log(this.modelAddressIdDestination);
    this.selectedAddressDestination = getdAddressDestination;

    console.log(this.modelCustomer);
    console.log(this.modelDestination);

    this.form.patchValue({
      passenger_id: event.passenger_id,
      waybill_id: event.waybill_id,
      destination_id: event.destination_id,
      city_id: event.city_id,
      employee_id: event.employee_id,
      go_send_id: event.go_send_id,
      description: event.description,
      tariff: event.tariff,
      discount: event.discount,
      total_passenger: event.total_passenger,
      payment: event.payment,
      note: event.note,
      status: event.status,
      status_passenger: event.status_passenger,
      resi_number: event.resi_number,
      book_date: event.book_date,
      check_payment: event.check_payment,
      position: event.position,
      charter: event.charter,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    const valueBookDate = new Date(
      Date.UTC(
        this.bookdate.year,
        this.bookdate.month - 1,
        this.bookdate.day,
        this.booktime ? this.booktime.hour : 0,
        this.booktime ? this.booktime.minute : 0
      )
    ).toISOString();
    console.log(valueBookDate);

    this.form.patchValue({
      waybill_id: this.modelCustomer?.customer_id,
      destination_id: this.modelDestination?.customer_id,
      book_date: valueBookDate,
    });

    const dataCustomert: any = {
      customer_id: this.modelCustomer?.customer_id,
    };
    console.log(dataCustomert);

    const dataReceipt: any = {
      customer_id: this.modelDestination?.customer_id,
    };
    console.log(dataReceipt);

    // edit send data to waybill, destination, passenger
    this.isLoading = true;
    this.passengerService
      .createWaybill(dataCustomert)
      .pipe(
        switchMap((respCustomer: any) => {
          console.log('Response from respCustomer:', respCustomer);
          this.form.patchValue({
            waybill_id: respCustomer.data.waybill_id,
          });
          return this.passengerService.createDestination(dataReceipt);
        }),
        switchMap((respDestination: any) => {
          console.log('Response from respDestination:');
          console.log(respDestination);
          this.form.patchValue({
            destination_id: respDestination.data.destination_id,
          });
          console.log(this.form.value);
          return this.passengerService.edit(this.form.value);
        }),
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
              duration: 10000,
            });

            this.dataList(this.params);
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

    // console.log(this.form.value);
    // this.isLoading = true;
    // const catSubscr = this.passengerService.edit(this.form.value)
    //   .pipe(
    //     finalize(() => {
    //       this.form.markAsPristine();
    //       this.isLoading = false;
    //     })
    //   )
    //   .subscribe(
    //     async (resp: any) => {
    //       if (resp) {
    //         this.snackbar.open(resp.message, '', {
    //           panelClass: 'snackbar-success',
    //           duration: 10000,
    //         });

    //         this.dataList(this.params);
    //         await this.modalComponent.dismiss();
    //       } else {
    //         this.isLoading = false;
    //       }
    //     },
    //     (error: any) => {
    //       console.log(error);
    //       this.isLoading = false;
    //       this.handlerResponseService.failedResponse(error);
    //     }
    //   );
    // this.unsubscribe.push(catSubscr);
  }

  openModalPrint(event: PassengerModel) {
    // sessionStorage.setItem('printpassenger', JSON.stringify(event));
    // window.open('#/booking/passenger/transaction/printpassenger', '_blank');
  }

  openModalCancel(event: PassengerModel) {}

  openModalDelete(event: PassengerModel) {}

  // Address
  clearFormAddress() {
    this.formAddress.reset();
  }

  async openModalNewAddress(event: AddressModel) {
    console.log(event);
    this.isCreateAddress = true;
    this.clearFormAddress();

    this.formAddress.patchValue({
      customer_id: event.customer_id,
    });

    return await this.modalComponentAddress.open();
  }

  dataCreateAddress() {
    console.log(this.formAddress.value);
    this.isLoading = true;
    const catSubscr = this.customerService
      .createAddress(this.formAddress.value)
      .pipe(
        finalize(() => {
          this.formAddress.markAsPristine();
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

            this.dataList(this.params);
            await this.modalComponentAddress.dismiss();
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

  async openModalEditAddress(event: AddressModel) {
    this.isCreateAddress = false;

    this.formAddress.patchValue({
      address_id: event.address_id,
      customer_id: event.customer_id,
      name: event.name,
      address: event.address,
      telp: event.telp,
      default: event.default,
      longitude: event.longitude,
      latitude: event.latitude,
      zoom: event.zoom,
      description: event.description,
      used: event.used,
    });

    return await this.modalComponentAddress.open();
  }

  dataEditAddress() {
    console.log(this.formAddress.value);
    this.isLoading = true;
    const catSubscr = this.customerService
      .editAddress(this.formAddress.value)
      .pipe(
        finalize(() => {
          this.formAddress.markAsPristine();
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

            this.dataList(this.params);
            await this.modalComponentAddress.dismiss();
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

  async openModalNewSP(event: PassengerModel) {
    console.log(event);
    console.log(this.isCreateSP);

    this.clearFormSP();
    this.modelEmployee = '';
    this.modelCar = '';

    let city: any = '';
    let formatSP = '';
    if (this.currentTab === 'Malang') {
      city = 1;
      formatSP = event.resi_number.replace(/[a-zA-Z]+/g, 'MPKT');
    } else if (this.currentTab === 'Surabaya') {
      city = 2;
      formatSP = event.resi_number.replace(/[a-zA-Z]+/g, 'SPKT');
    }
    console.log(formatSP);

    this.formSP.patchValue({
      passenger_id: event.passenger_id,
      city_id: city,
      send_date: event.book_date,
      sp_passenger: formatSP,
    });

    return await this.modalComponentSP.open();
  }

  dataCreateSP() {
    console.log(this.isCreateSP);

    this.formSP.patchValue({
      employee_id: this.modelEmployee?.employee_id,
      car_id: this.modelCar?.car_id,
    });
    console.log(this.formSP.value);

    // send data to gosend, passenger
    this.isLoading = true;
    this.passengerService
      .createSP(this.formSP.value)
      .pipe(
        switchMap((resp: any) => {
          console.log('Response from sp:');
          console.log(resp);
          this.form.patchValue({
            passenger_id: resp.data.passenger_id,
            go_send_id: resp.data.go_send_id,
            city_id: resp.data.city_id,
            book_date: resp.data.send_date,
            status_passenger: 'Delivery',
          });
          return this.passengerService.patch(this.form.value);
        }),
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
              duration: 10000,
            });

            this.dataList(this.params);
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

  async openModalEditSP(event: PassengerModel) {
    console.log(event);

    if (event) {
      let city: any = '';
      let formatSP = '';
      if (this.currentTab === 'Malang') {
        city = 1;
        formatSP = event.resi_number.replace(/[a-zA-Z]+/g, 'MPKT');
      } else if (this.currentTab === 'Surabaya') {
        city = 2;
        formatSP = event.resi_number.replace(/[a-zA-Z]+/g, 'SPKT');
      }
      console.log(formatSP);

      this.modelEmployee = event.go_send?.employee;
      this.modelCar = event.go_send?.car;

      this.formSP.patchValue({
        go_send_id: event.go_send_id,
        city_id: city,
        passenger_id: event.passenger_id,
        send_time: event.go_send?.send_time,
        send_date: event.book_date,
        sp_number: event.go_send?.sp_number,
        sp_package: event.go_send?.sp_package,
        sp_passenger: formatSP,
        bsd: event.go_send?.bsd,
        bsd_passenger: event.go_send?.bsd_passenger,
        box: event.go_send?.box,
        bsd_box: event.go_send?.bsd_box,
        description: event.go_send?.description,
        status: event.go_send?.status,
      });
    }

    return await this.modalComponentSP.open();
  }

  dataEditSP() {
    console.log(this.modelEmployee);
    console.log(this.modelCar);
    console.log(this.isCreateSP);

    this.formSP.patchValue({
      employee_id: this.modelEmployee?.employee_id,
      car_id: this.modelCar?.car_id,
    });
    console.log(this.formSP.value);

    // send data to gosend, passenger
    this.isLoading = true;
    this.passengerService
      .editSP(this.formSP.value)
      .pipe(
        switchMap((resp: any) => {
          console.log('Response from sp:');
          console.log(resp);
          const gosend: any = {
            passenger_id: resp.data.passenger_id,
            go_send_id: resp.data.go_send_id,
            city_id: resp.data.city_id,
            book_date: resp.data.send_date,
            status_passenger: 'Delivery',
          };
          return this.passengerService.patch(gosend);
        }),
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
              duration: 10000,
            });

            this.dataList(this.params);
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

  assignDriverSP(event: PassengerModel) {
    console.log(this.delivery);

    const updateSP: any = {
      passenger_id: event.passenger_id,
      go_send_id: this.delivery.go_send_id,
      status_passenger: 'Delivery',
    };
    console.log(updateSP);

    // send data to package
    this.isLoading = true;
    this.passengerService
      .patch(updateSP)
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
              duration: 10000,
            });

            this.dataList(this.params);
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

  removeDriverSP(event: PassengerModel) {
    console.log(this.delivery);

    const updateSP: any = {
      passenger_id: event.passenger_id,
      go_send_id: null,
      status_passenger: 'Progress',
    };
    console.log(updateSP);

    // send data to package
    this.isLoading = true;
    this.passengerService
      .patch(updateSP)
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
              duration: 10000,
            });

            this.dataList(this.params);
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
}
