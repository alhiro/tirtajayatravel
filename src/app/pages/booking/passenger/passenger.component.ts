import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  finalize,
  merge,
  of,
  switchMap,
  takeUntil,
  tap,
  OperatorFunction,
} from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ExtendedPagination, ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalComponent, ModalConfig, ModalXlComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { AddressModel } from '@app/pages/master/customer/models/address.model';
import { CustomerService } from '@app/pages/master/customer/customer.service';
import { CategoryService } from '@app/pages/master/category/category.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbDropdown,
  NgbTimeStruct,
  NgbTypeahead,
} from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '@app/pages/master/employee/employee.service';
import { CarService } from '@app/pages/master/car/car.service';
import { PassengerService } from './passenger.service';
import { PassengerModel } from './models/passenger.model';
import { Utils, padNumber } from '@app/@shared';
import * as moment from 'moment';
import { GoSendModel } from '../package/models/gosend';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

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
  public city_id!: number;
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
  public city: any = 'Malang';

  public dataLength!: number;
  public dataLengthMalang!: number;
  public dataLengthSurabaya!: number;
  public dataLengthMove!: number;
  public dataLengthCancel!: number;
  public dataLengthHistory!: number;
  public dataLengthCustomer!: number;
  public toggledRows = new Set<number>();

  public dataAddress: any;

  public isCreate = false;
  public isCreateAddress = false;
  public isCreateSP!: boolean;
  public isDestinationDifferent = false;

  public selectedAddress: any[] = [];
  public selectedAddressDestination: any[] = [];
  public selectPosition: any[] = [];
  public searchCustomer!: string;
  public modelCustomer: any;
  public modelDestination: any;
  public modelAddress: any;
  public modelAddressId: any;
  public modelAddressIdDestination: any;
  public modelEmployee: any;
  public modelCar: any;
  public searching = false;
  public searchingSender = false;
  public searchingDestination = false;
  public searchingEmployee = false;
  public searchingCar = false;
  public searchFailed = false;
  public searchFailedSender = false;
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
    city: 'Malang',
    status: 'Progress',
  };
  public params = {
    limit: 10,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: 'Progress',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;
  formAddress!: FormGroup;
  formWaybill!: FormGroup;
  formDestination!: FormGroup;
  formSP!: FormGroup;

  isLoading = false;
  isLoadingAddress = false;
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
  @Input() setCity: any;
  @Output() isAssignSP = new EventEmitter<boolean>();

  focusCustomer$ = new Subject<string>();
  clickCustomer$ = new Subject<string>();
  focusSender$ = new Subject<string>();
  clickSender$ = new Subject<string>();
  focusDestination$ = new Subject<string>();
  clickDestination$ = new Subject<string>();
  @ViewChild('instance', { static: true }) instance!: NgbTypeahead;

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
    private utils: Utils,
    private translate: TranslateService
  ) {
    this.initForm();

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

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      // datepicker.close(); // Close datepicker popup

      console.log('select from date & to date');

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

      // const params = {
      //   limit: this.pagination.limit,
      //   page: this.pagination.offset,
      //   search: this.pagination.search,
      //   startDate: this.startDate,
      //   endDate: this.endDate,
      // };
      // console.log(params);
      // this.dataList(params);
    } else {
      this.toDate = null;
      this.fromDate = date;

      const valueBookFromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const valueBookToDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const { startDate, endDate } = this.utils.rangeDate(valueBookFromDate, valueBookToDate);
      this.startDate = startDate;
      this.endDate = endDate;

      console.log('select from date & to date is null');
    }
  }

  resetFilterDate(datepicker: any) {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 0);
    this.dataList(this.params);
    datepicker.close();
  }

  printFilterSelected(datepicker: any) {
    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.currentTab,
      status: this.pagination.status,
    };

    this.dataList(this.params);
    console.log(this.params);

    datepicker.close();
  }

  printFilterDate(datepicker: any) {
    let getCity = '';
    if (this.levelrule === 2) {
      if (this.city_id === 1) {
        getCity = 'Malang';
      } else {
        getCity = 'Surabaya';
      }
    } else if (this.levelrule === 8) {
      getCity = this.city;
    }

    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: getCity,
      status: '',
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
    console.log(this.setCity);
    console.log(this.delivery);

    if (this.setCity === 'Malang') {
      this.currentTab = 'Malang';
    } else if (this.setCity === 'Surabaya') {
      this.currentTab = 'Surabaya';
    }

    this.dataCategory();

    let valueBookFromDate;
    let valueBookToDate;

    if (this.delivery) {
      valueBookFromDate = moment(this.delivery?.send_date).utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      valueBookToDate = moment(this.delivery?.send_date).utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    } else {
      valueBookFromDate = moment().utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      valueBookToDate = moment().utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    }

    this.startDate = valueBookFromDate;
    this.endDate = valueBookToDate;

    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.currentTab,
      status: this.pagination.status,
    };

    this.dataList(this.params);

    this.company = this.localService.getCompany();
    this.business = this.localService.getBusiness();
    this.request = this.localService.getRequest();
    this.status = this.localService.getStatus();
    this.class = this.localService.getClass();
    this.payment = this.localService.getPayment();
    this.statusPassenger = this.localService.getStatusPassenger();

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.translate
      .get([
        'TABLE.RESI_NUMBER',
        'TABLE.BOOK_DATE',
        'TABLE.COST',
        'TABLE.STATUS',
        'TABLE.TOTAL_PASSENGER',
        'TABLE.NAME',
        'TABLE.PICKUP_ADDRESS',
        'TABLE.DESTINATION_ADDRESS',
        'TABLE.DESCRIPTION',
        'TABLE.CREATED_BY',
        'TABLE.STATUS_PASSENGER',
        'TABLE.ACTION',
      ])
      .subscribe((translations: any) => {
        this.columns = [
          // { key: 'passenger_id', title: 'No' },
          { key: 'resi_number', title: translations['TABLE.RESI_NUMBER'] },
          { key: 'book_date', title: translations['TABLE.BOOK_DATE'] },
          { key: 'tariff', title: translations['TABLE.COST'] },
          { key: 'status', title: translations['TABLE.STATUS'] },
          { key: 'total_passenger', title: translations['TABLE.TOTAL_PASSENGER'] },
          { key: 'waybill.name', title: translations['TABLE.NAME'] },
          { key: 'waybill_id', title: translations['TABLE.PICKUP_ADDRESS'] },
          { key: 'destination_id', title: translations['TABLE.DESTINATION_ADDRESS'] },
          // { key: 'description', title: translations['TABLE.DESCRIPTION'] },
          { key: 'created_by', title: translations['TABLE.CREATED_BY'] },
          { key: 'status_passenger', title: translations['TABLE.STATUS_PASSENGER'] },
          { key: '', title: translations['TABLE.ACTION'], cssClass: { includeHeader: true, name: 'text-end' } },
        ];
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlist');
    sessionStorage.removeItem('printlistdate');
  }

  private initForm() {
    this.form = this.formBuilder.group({
      passenger_id: [''],
      waybill_id: [''],
      destination_id: [''],
      waybills: [],
      destinations: [],
      city_id: [''],
      employee_id: [''],
      go_send_id: [''],
      tariff: [0, Validators.compose([Validators.required])],
      discount: [0],
      agent_commission: [0],
      other_fee: [0],
      book_date: [''],
      total_passenger: ['', Validators.compose([Validators.required])],
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
      default: [false],
      longitude: [null, Validators.compose([Validators.maxLength(100)])],
      latitude: [null, Validators.compose([Validators.maxLength(100)])],
      zoom: [7, Validators.compose([Validators.maxLength(5)])],
      description: ['', Validators.compose([Validators.maxLength(255)])],
      used: ['', Validators.compose([Validators.maxLength(255)])],
    });

    this.formWaybill = this.formBuilder.group({
      waybill_id: [''],
      customer_id: ['', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.maxLength(100)])],
      address: ['', Validators.compose([Validators.maxLength(255)])],
      telp: ['', Validators.compose([Validators.maxLength(255)])],
      default: [false],
      longitude: [null, Validators.compose([Validators.maxLength(100)])],
      latitude: [null, Validators.compose([Validators.maxLength(100)])],
      zoom: [7, Validators.compose([Validators.maxLength(5)])],
      description: ['', Validators.compose([Validators.maxLength(255)])],
      used: ['', Validators.compose([Validators.maxLength(255)])],
    });

    this.formDestination = this.formBuilder.group({
      destination_id: [''],
      customer_id: ['', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.maxLength(100)])],
      address: ['', Validators.compose([Validators.maxLength(255)])],
      telp: ['', Validators.compose([Validators.maxLength(255)])],
      default: [false],
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

    if (this.currentTab === 'Malang') {
      this.city = 'Malang';
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.currentTab,
        status: 'Progress',
      };
      this.dataList(this.params);
    } else if (this.currentTab === 'Surabaya') {
      this.city = 'Surabaya';
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.currentTab,
        status: 'Progress',
      };
      this.dataList(this.params);
    } else if (this.currentTab === 'Cancel') {
      let getCity = '';
      if (this.levelrule === 2) {
        if (this.city_id === 1) {
          getCity = 'Malang';
        } else {
          getCity = 'Surabaya';
        }
      } else if (this.levelrule === 8) {
        getCity = this.city;
      }

      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.startDate,
        endDate: this.endDate,
        city: getCity,
        status: 'Cancel',
      };
      this.dataList(this.params);
    } else if (this.currentTab === 'History') {
      let getCity = '';
      if (this.levelrule === 2) {
        if (this.city_id === 1) {
          getCity = 'Malang';
        } else {
          getCity = 'Surabaya';
        }
      } else if (this.levelrule === 8) {
        getCity = this.city;
      }

      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.startDate,
        endDate: this.endDate,
        city: getCity,
        status: 'Completed',
      };
      this.dataList(this.params);
    }
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

    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.currentTab,
      status: this.pagination.status,
    }; // see https://github.com/typicode/json-server
    this.dataList(this.params);
  }

  private dataList(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.passengerService
      .list(params)
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        this.dataLength = response.length;
        this.data = response.data;
        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one

        this.pagination.count =
          this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
        this.pagination = { ...this.pagination };

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

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

  searchDataCustomer = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.clickCustomer$.pipe(filter(() => this.instance?.isPopupOpen()));
    const inputFocus$ = this.focusCustomer$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
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
              if (response.length > 0) {
                tap(() => (this.searching = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              } else {
                this.searchFailed = true;
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
  };
  formatterCustomer = (result: { name: string }) => result.name;

  onCustomerSelect(event: any, inputElement: HTMLInputElement) {
    event.preventDefault();
    console.log(event);
    const selectedItem = event.item;
    if (selectedItem) {
      console.log(this.modelCustomer);

      if (this.modelCustomer.customer_id === selectedItem.customer_id) {
        this.selectedAddress.push(selectedItem);
      } else {
        this.selectedAddress = [];
      }
      console.log(this.selectedAddress);
    }

    inputElement.blur();
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
              if (response.length > 0) {
                tap(() => (this.searchingDestination = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              } else {
                this.searchFailedDestination = true;
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

  selectCustomer(event: any) {
    event.preventDefault();
    console.log(event.item);

    if (event.item) {
      this.modelCustomer = event.item;
      this.selectedAddress = [];
      this.selectedAddressDestination = [];
    }
  }

  selectAddress(event: any) {
    event.preventDefault();
    console.log(event);
    const selectedItem = event.item;
    if (selectedItem) {
      console.log(this.modelCustomer);

      if (this.modelCustomer.customer_id === selectedItem.customer_id) {
        this.selectedAddress.push(selectedItem);
      } else {
        this.selectedAddress = [];
      }
      console.log(this.selectedAddress);
    }
  }

  removeSelectedSenderAddress(item: any) {
    this.selectedAddress = this.selectedAddress.filter((val: any) => val.address_id !== item.address_id);
    console.log(this.selectedAddress);
  }

  searchAddressSender = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.clickSender$.pipe(filter(() => this.instance?.isPopupOpen()));
    const inputFocus$ = this.focusSender$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingSender = true)),
      switchMap((term) =>
        this.customerService
          .getAddressList({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            customer_id: this.modelCustomer?.customer_id,
          })
          .pipe(
            tap(() => (this.searchFailedSender = false)),
            map((response: any) => {
              if (response.length > 0) {
                tap(() => (this.searchingSender = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.address.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              } else {
                this.searchFailedSender = true;
              }
            }),
            catchError(() => {
              this.searchFailedSender = true;
              return of([]);
            })
          )
      ),
      tap(() => (this.searchingSender = false))
    );
  };
  onSenderSelect(event: any, inputElement: HTMLInputElement) {
    inputElement.blur();
  }

  dataDestinationAddresses() {
    return this.isDestinationDifferent ? this.modelDestination?.addresses : this.modelCustomer?.addresses;
  }

  searchAddressDestination = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.clickDestination$.pipe(filter(() => this.instance?.isPopupOpen()));
    const inputFocus$ = this.focusDestination$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingDestination = true)),
      switchMap((term) =>
        this.customerService
          .getAddressList({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            customer_id: this.isDestinationDifferent
              ? this.modelDestination?.customer_id
              : this.modelCustomer?.customer_id,
          })
          .pipe(
            tap(() => (this.searchFailedDestination = false)),
            map((response: any) => {
              if (response.length > 0) {
                tap(() => (this.searchingDestination = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.address.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              } else {
                this.searchFailedDestination = true;
              }
            }),
            catchError(() => {
              this.searchFailedDestination = true;
              return of([]);
            })
          )
      ),
      tap(() => (this.searchingDestination = false))
    );
  };
  onRecipientSelect(event: any, inputElement: HTMLInputElement) {
    inputElement.blur();
  }

  findDatadestinationByValue(value: any) {
    return this.dataDestinationAddresses().find((val: AddressModel) => val.address_id === Number(value));
  }

  selectAddressDestination(event: any) {
    event.preventDefault();
    console.log(event);
    const selectedItem = event.item;
    if (selectedItem) {
      console.log(this.modelCustomer);

      if (this.modelCustomer.customer_id === selectedItem.customer_id) {
        this.selectedAddressDestination.push(selectedItem);
      } else {
        this.selectedAddressDestination = [];
      }
      console.log(this.selectedAddressDestination);
    }
  }

  removeSelectedDestinationAddress(item: any) {
    this.selectedAddressDestination = this.selectedAddressDestination.filter(
      (val: any) => val.address_id !== item.address_id
    );
    console.log(this.selectedAddressDestination);
  }

  onDateChange(date: NgbDateStruct): void {
    this.bookdate = date;
  }

  onTimehange(time: NgbTimeStruct): void {
    this.booktime = time;
  }

  checkDestination() {
    this.isDestinationDifferent = !this.isDestinationDifferent;
    this.modelDestination = '';
  }

  format(date: NgbDateStruct): string {
    return date ? `${date.day}/${date.month}/${date.year}` : '';
  }

  clearForm() {
    this.form.reset();
  }

  onCheckboxPosition(event: any) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      this.selectPosition.push(value);
    } else {
      this.selectPosition = this.selectPosition.filter((item) => item !== value);
    }
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
      charter: 'Reguler',
      status: 'Biasa',
      payment: 'Bayar Tujuan (CBA)',
      total_passenger: 1,
      status_passenger: 'Progress',
      position: this.selectPosition,
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

    console.log(this.modelCustomer);

    // this.formWaybill.patchValue({
    //   customer_id: this.modelCustomer?.customer_id,
    //   name: this.modelAddressId?.name,
    //   address: this.modelAddressId?.address,
    //   telp: this.modelAddressId?.telp,
    //   defaults: this.modelAddressId?.default,
    //   longitude: this.modelAddressId?.longitude,
    //   latitude: this.modelAddressId?.latitude,
    //   zoom: this.modelAddressId?.zoom,
    //   description: this.modelAddressId?.description,
    //   used: this.modelAddressId?.used,
    // });

    // this.formDestination.patchValue({
    //   customer_id: this.isDestinationDifferent ? this.modelDestination?.customer_id : this.modelCustomer?.customer_id,
    //   name: this.modelAddressIdDestination?.name,
    //   address: this.modelAddressIdDestination?.address,
    //   telp: this.modelAddressIdDestination?.telp,
    //   defaults: this.modelAddressIdDestination?.default,
    //   longitude: this.modelAddressIdDestination?.longitude,
    //   latitude: this.modelAddressIdDestination?.latitude,
    //   zoom: this.modelAddressIdDestination?.zoom,
    //   description: this.modelAddressIdDestination?.description,
    //   used: this.modelAddressIdDestination?.used,
    // });

    this.form.patchValue({
      book_date: valueBookDate,
      waybill_id: this.modelCustomer?.customer_id,
      waybills: this.selectedAddress,
      destination_id: this.isDestinationDifferent
        ? this.modelDestination?.customer_id
        : this.modelCustomer?.customer_id,
      destinations: this.selectedAddressDestination,
    });

    // create waybill & destination & edit passenger
    this.isLoading = true;
    this.passengerService
      .create(this.form.value)
      .pipe(
        // switchMap((respCustomer: any) => {
        //   console.log('Response from respCustomer:', respCustomer);
        //   this.form.patchValue({
        //     waybill_id: respCustomer.data.waybill_id,
        //   });
        //   return this.passengerService.createDestination(this.formDestination.value);
        // }),
        // switchMap((respDestination: any) => {
        //   console.log('Response from respDestination:');
        //   console.log(respDestination);
        //   this.form.patchValue({
        //     book_date: valueBookDate,
        //     destination_id: respDestination.data.destination_id,
        //   });
        //   return this.passengerService.create(this.form.value);
        // }),
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

    this.modelCustomer = event.waybill;
    // const getdAddressCustomer = this.modelCustomer?.addresses.find(
    //   (val: AddressModel) => val.telp === event.waybill?.telp
    // );
    // this.modelAddressId = getdAddressCustomer;
    this.modelAddressId = event.waybills;
    this.selectedAddress = event.waybills === null ? [] : event.waybills;
    console.log(this.selectedAddress);

    this.modelDestination = event.destination;
    // const getdAddressDestination = this.modelDestination?.addresses.find(
    //   (val: AddressModel) => val.telp === event.destination?.telp
    // );
    // this.modelAddressIdDestination = getdAddressDestination;
    this.modelAddressIdDestination = event.destinations;
    this.selectedAddressDestination = event.destinations === null ? [] : event.destinations;
    console.log(this.selectedAddressDestination);

    this.selectPosition = event.position;

    this.form.patchValue(event);
    // this.formWaybill.patchValue({waybill_id: event.waybill_id});
    // this.formDestination.patchValue({destination_id: event.destination_id});

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

    // this.formWaybill.patchValue({
    //   customer_id: this.modelCustomer?.customer_id,
    //   name: this.modelAddressId?.name,
    //   address: this.modelAddressId?.address,
    //   telp: this.modelAddressId?.telp,
    //   defaults: this.modelAddressId?.default,
    //   longitude: this.modelAddressId?.longitude,
    //   latitude: this.modelAddressId?.latitude,
    //   zoom: this.modelAddressId?.zoom,
    //   description: this.modelAddressId?.description,
    //   used: this.modelAddressId?.used,
    // });

    // this.formDestination.patchValue({
    //   customer_id: this.isDestinationDifferent ? this.modelDestination?.customer_id : this.modelCustomer?.customer_id,
    //   name: this.modelAddressIdDestination?.name,
    //   address: this.modelAddressIdDestination?.address,
    //   telp: this.modelAddressIdDestination?.telp,
    //   defaults: this.modelAddressIdDestination?.default,
    //   longitude: this.modelAddressIdDestination?.longitude,
    //   latitude: this.modelAddressIdDestination?.latitude,
    //   zoom: this.modelAddressIdDestination?.zoom,
    //   description: this.modelAddressIdDestination?.description,
    //   used: this.modelAddressIdDestination?.used,
    // });

    this.form.patchValue({
      book_date: valueBookDate,
      waybill_id: this.modelCustomer?.customer_id,
      destination_id: this.isDestinationDifferent
        ? this.modelDestination?.customer_id
        : this.modelCustomer?.customer_id,
      waybills: this.selectedAddress,
      destinations: this.selectedAddressDestination,
      position: this.selectPosition,
    });
    console.log(this.modelCustomer);
    console.log(this.modelDestination);
    console.log(this.form.value);

    //// edit waybill & destination & edit passenger
    // this.isLoading = true;
    // this.passengerService
    //   .edit(this.form.value)
    //   .pipe(
    //     // switchMap((respCustomer: any) => {
    //     //   console.log('Response from respCustomer:', respCustomer);
    //     //   this.form.patchValue({
    //     //     waybill_id: respCustomer.data.waybill_id,
    //     //   });
    //     //   return this.passengerService.editDestination(this.formDestination.value);
    //     // }),
    //     // switchMap((respDestination: any) => {
    //     //   console.log('Response from respDestination:');
    //     //   console.log(respDestination);
    //     //   this.form.patchValue({
    //     //     book_date: valueBookDate,
    //     //     destination_id: respDestination.data.destination_id,
    //     //   });
    //     //   return this.passengerService.edit(this.form.value);
    //     // }),
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
    //           duration: 5000,
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

    console.log(this.form.value);
    this.isLoading = true;
    const pasSubscr = this.passengerService
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
    this.unsubscribe.push(pasSubscr);
  }

  openModalPrint(event: PassengerModel) {
    sessionStorage.setItem('printpassenger', JSON.stringify(event));
    window.open('#/booking/passenger/transaction/printpassenger', '_blank');
  }

  async openModalCancel(event: PassengerModel) {
    this.form.patchValue(event);

    this.form.patchValue({
      status_passenger: 'Cancel',
    });

    this.translate
      .get(['SWAL.ARE_YOU_SURE', 'SWAL.REVERT_TEXT', 'SWAL.YES_CANCEL_IT', 'SWAL.BACK_BUTTON'])
      .subscribe((translations) => {
        Swal.fire({
          title: translations['SWAL.ARE_YOU_SURE'],
          text: translations['SWAL.REVERT_TEXT'],
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#D8A122',
          cancelButtonColor: '#3085d6',
          confirmButtonText: translations['SWAL.YES_CANCEL_IT'],
          cancelButtonText: translations['SWAL.BACK_BUTTON'],
        }).then((result) => {
          if (result.isConfirmed) {
            // edit passenger
            this.isLoading = true;
            this.passengerService
              .patch(this.form.value)
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
        });
      });
  }

  async openModalDelete(event: PassengerModel) {
    this.form.patchValue(event);

    this.translate
      .get(['SWAL.ARE_YOU_SURE', 'SWAL.REVERT_WARNING', 'SWAL.CONFIRM_DELETE', 'SWAL.BACK_BUTTON'])
      .subscribe((translations) => {
        Swal.fire({
          title: translations['SWAL.ARE_YOU_SURE'],
          text: translations['SWAL.REVERT_WARNING'],
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: translations['SWAL.CONFIRM_DELETE'],
          cancelButtonText: translations['SWAL.BACK_BUTTON'],
        }).then((result) => {
          if (result.isConfirmed) {
            this.dataDelete();
          }
        });
      });
  }

  dataDelete() {
    console.log(this.form.value);
    this.isLoading = true;
    const passSubscr = this.passengerService
      .delete(this.form.value)
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
    this.unsubscribe.push(passSubscr);
  }

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
      name: event.name,
      telp: event.telp,
    });

    return await this.modalComponentAddress.open();
  }

  dataCreateAddress() {
    console.log(this.formAddress.value);
    this.isLoadingAddress = true;
    const catSubscr = this.customerService
      .createAddress(this.formAddress.value)
      .pipe(
        finalize(() => {
          this.formAddress.markAsPristine();
          this.isLoadingAddress = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataList(this.params);
            await this.modalComponentAddress.dismiss();
          } else {
            this.isLoadingAddress = false;
          }
        },
        (error: any) => {
          console.log(error);
          this.isLoadingAddress = false;
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
    this.isLoadingAddress = true;
    const catSubscr = this.customerService
      .editAddress(this.formAddress.value)
      .pipe(
        finalize(() => {
          this.formAddress.markAsPristine();
          this.isLoadingAddress = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataList(this.params);
            await this.modalComponentAddress.dismiss();
          } else {
            this.isLoadingAddress = false;
          }
        },
        (error: any) => {
          console.log(error);
          this.isLoadingAddress = false;
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
              duration: 5000,
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
              duration: 5000,
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
    this.isAssignSP.emit(false);

    const updateSP: any = {
      passenger_id: event.passenger_id,
      go_send_id: this.delivery.go_send_id,
      status_passenger: 'Delivery',
    };
    console.log(updateSP);

    // send data to package
    this.configuration.isLoading = true;
    this.passengerService
      .patch(updateSP)
      .pipe(
        finalize(() => {
          this.form.markAsPristine();
          this.configuration.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataList(this.params);
            this.isAssignSP.emit(true);
            await this.modalComponentSP.dismiss();
          } else {
            this.configuration.isLoading = false;
            this.isAssignSP.emit(false);
          }
        },
        (error: any) => {
          console.log(error);
          this.configuration.isLoading = false;
          this.isAssignSP.emit(false);
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
    this.configuration.isLoading = true;
    this.passengerService
      .patch(updateSP)
      .pipe(
        finalize(() => {
          this.form.markAsPristine();
          this.configuration.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataList(this.params);
            await this.modalComponentSP.dismiss();
          } else {
            this.configuration.isLoading = false;
          }
        },
        (error: any) => {
          console.log(error);
          this.configuration.isLoading = false;
          this.handlerResponseService.failedResponse(error);
        }
      );
  }
}
