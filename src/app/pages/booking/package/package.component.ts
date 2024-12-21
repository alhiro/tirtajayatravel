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
import { PackageService } from './package.service';
import { ExtendedPagination, ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalComponent, ModalConfig, ModalXlComponent } from '@app/_metronic/partials';

import { PackageModel } from './models/package.model';
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
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbDatepicker,
  NgbDropdown,
  NgbTimeStruct,
  NgbTypeahead,
} from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '@app/pages/master/employee/employee.service';
import { CarService } from '@app/pages/master/car/car.service';
import * as moment from 'moment';
import { Utils } from '@app/@shared';
import { GoSendModel } from './models/gosend';
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
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss'],
  providers: [NgbDropdown],
})
export class PackageComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public city_id!: number;
  public username!: string;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public defaultAddressCustomer: any;
  public defaultAddressRecipient: any;

  public dataRow: any;
  public data: any;

  public company: any;
  public business: any;
  public category: any;
  public request: any;
  public status: any;
  public statusPackage: any;
  public city: any = 'Malang';

  public dataLength = 0;
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
  public isDestinationDifferent = false;

  public isRequest!: boolean;
  public selectedAddress: any;
  public selectedAddressRecipient: any;
  public searchCustomer!: string;

  public modelCustomer: any;
  public modelRecipient: any;
  public modelAddress: any;
  public modelAddressId: any;
  public modelAddressRecipient: any;
  public modelAddressIdRecipient: any;
  public modelEmployee: any;
  public modelCar: any;

  public searching = false;
  public searchingSender = false;
  public searchingRecipient = false;
  public searchingEmployee = false;
  public searchingCar = false;
  public searchFailed = false;
  public searchFailedSender = false;
  public searchFailedRecipient = false;
  public searchFailedEmployee = false;
  public searchFailedCar = false;
  public searchPrintFailed = false;
  public searchingPrint = false;

  public isLoadingPrint = false;

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
  formSender!: FormGroup;
  formRecipient!: FormGroup;
  formSP!: FormGroup;

  isLoading = false;
  isLoadingAddress = false;
  isLoadingCustomer = false;

  resiNumber: any;

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
    modalTitle: 'Create Package',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Package',
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
  modalConfigPrintResi: ModalConfig = {
    modalTitle: 'Print Resi',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalXlComponent;
  @ViewChild('modalAddress') private modalComponentAddress!: ModalComponent;
  @ViewChild('modalSP') private modalComponentSP!: ModalComponent;
  @ViewChild('assignSP') private modalComponentAssignSP!: ModalComponent;
  @ViewChild('modalPrintResi') private modalComponentPrintResi!: ModalComponent;

  @ViewChild('datepicker') datePicker!: any;

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
  focusRecipient$ = new Subject<string>();
  clickRecipient$ = new Subject<string>();
  focusPrint$ = new Subject<string>();
  clickPrint$ = new Subject<string>();
  @ViewChild('instance', { static: true }) instance!: NgbTypeahead;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private packageService: PackageService,
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

    const valueBookFromDate = new Date(getDate.getFullYear(), getDate.getMonth(), getDate.getDate());
    const { startDate, endDate } = this.utils.rangeDate(valueBookFromDate, valueBookFromDate);
    this.startDate = startDate;
    this.endDate = endDate;
  }

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      // datepicker.close(); // Close datepicker popup

      const valueBookFromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const valueBookToDate = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
      const { startDate, endDate } = this.utils.rangeDate(valueBookFromDate, valueBookToDate);
      this.startDate = startDate;
      this.endDate = endDate;

      // console.log(params);
      // this.dataList(this.params);
    } else {
      this.toDate = null;
      this.fromDate = date;

      const valueBookFromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const valueBookToDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const { startDate, endDate } = this.utils.rangeDate(valueBookFromDate, valueBookToDate);
      this.startDate = startDate;
      this.endDate = endDate;
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
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('#/booking/package/transaction/printlist', '_blank');
  }

  printFilterDatePayment(datepicker: any) {
    let getCity = '';
    if (this.levelrule === 2 || this.levelrule === 3) {
      if (this.city_id === 1) {
        getCity = 'Malang';
      } else {
        getCity = 'Surabaya';
      }
    } else if (this.levelrule === 8) {
      getCity = this.currentTab;
    }

    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: getCity,
      status: 'Lunas (Kantor)',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('#/booking/package/transaction/printlist', '_blank');
  }

  printFilterDatePaymentUser(datepicker: any) {
    let getCity = '';
    if (this.levelrule === 2 || this.levelrule === 3) {
      if (this.city_id === 1) {
        getCity = 'Malang';
      } else {
        getCity = 'Surabaya';
      }
    } else if (this.levelrule === 8) {
      getCity = this.currentTab;
    }

    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: getCity,
      status: 'Lunas (Kantor)',
      username: this.username,
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('#/booking/package/transaction/printlistuser', '_blank');
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

    if (this.setCity === 'Malang') {
      this.currentTab = 'Malang';
    } else if (this.setCity === 'Surabaya') {
      this.currentTab = 'Surabaya';
    }

    this.dataCategory();

    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: '',
      endDate: '',
      city: this.currentTab,
      status: this.pagination.status,
    };

    this.dataList(this.params);
    this.company = this.localService.getCompany();
    this.business = this.localService.getBusiness();
    this.request = this.localService.getRequest();
    this.status = this.localService.getStatus();
    this.statusPackage = this.localService.getStatusPackage();

    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.translate
      .get([
        'TABLE.RESI_NUMBER',
        'TABLE.LEVEL',
        'TABLE.SEND_DATE',
        'TABLE.SENDER',
        'TABLE.RECIPIENT',
        'TABLE.COST',
        'TABLE.ADMIN',
        'TABLE.STATUS',
        'TABLE.ACTION',
      ])
      .subscribe((translations: any) => {
        this.columns = [
          { key: '', title: '', width: '3%' },
          { key: 'resi_number', title: translations['TABLE.RESI_NUMBER'] },
          { key: 'level', title: translations['TABLE.LEVEL'] },
          { key: 'book_date', title: translations['TABLE.SEND_DATE'] },
          { key: 'sender_id', title: translations['TABLE.SENDER'] },
          { key: 'recipient_id', title: translations['TABLE.RECIPIENT'] },
          { key: 'cost', title: translations['TABLE.COST'] },
          { key: 'admin', title: translations['TABLE.ADMIN'] },
          // { key: 'status', title: translations['TABLE.STATUS'] },
          { key: '', title: translations['TABLE.ACTION'], cssClass: { includeHeader: true, name: 'text-end' } },
        ];
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('printpackage');
    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlist');
    sessionStorage.removeItem('printlistdate');
  }

  private initForm() {
    this.form = this.formBuilder.group({
      package_id: [''],
      sender_id: [''],
      recipient_id: [''],
      city_id: [''],
      employee_id: [''],
      category_id: [null],
      go_send_id: [''],
      description: [''],
      cost: [0, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])],
      discount: [0, Validators.compose([Validators.pattern('^[0-9]*$')])],
      payment: [''],
      koli: ['', Validators.compose([Validators.required])],
      origin_from: ['Kantor'],
      level: ['Normal'],
      request: [''],
      request_description: [''],
      note: [''],
      status: ['Lunas (Kantor)'],
      status_package: [''],
      resi_number: [''],
      photo: [''],
      print: [''],
      move_time: [''],
      book_date: [''],
      send_date: [''],
      check_payment: [''],
      check_sp: [''],
      check_date_sp: [''],
      taking_time: [''],
      taking_by: [''],
      taking_status: [''],
      office: [''],
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

    this.formSender = this.formBuilder.group({
      sender_id: [''],
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

    this.formRecipient = this.formBuilder.group({
      recipient_id: [''],
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
      package_id: '',
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
    console.log(this.currentTab);

    if (this.currentTab === 'Malang') {
      this.city = 'Malang';
      this.params = {
        limit: 10,
        page: 1,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
        city: this.currentTab,
        status: 'Progress',
      };
      this.dataList(this.params);
    } else if (this.currentTab === 'Surabaya') {
      this.city = 'Surabaya';
      this.params = {
        limit: 10,
        page: 1,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
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
        limit: 10,
        page: 1,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
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
        limit: 10,
        page: 1,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
        city: getCity,
        status: 'Completed',
      };
      this.dataList(this.params);
    }
  }

  checkRequest() {
    this.isRequest = !this.isRequest;
    this.form.patchValue({
      request: '',
      request_description: '',
    });
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
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
      city: this.currentTab,
      status: this.pagination.status,
    }; // see https://github.com/typicode/json-server
    this.dataList(this.params);
  }

  getIndex(i: number): number {
    return (this.pagination.offset - 1) * this.pagination.limit + (i + 1);
  }

  private dataList(params: ExtendedPaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .list(params)
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        this.dataLength = response.length;
        this.data = response.data;
        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one

        this.pagination.count = this.dataLength;
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
                return response.data.filter((val: any) => val.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
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
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
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
    this.modelAddressId = event.item;
    console.log('Selected Customer:', this.modelAddressId);

    inputElement.blur();
  }

  searchDataRecipient = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingRecipient = true)),
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
            tap(() => (this.searchFailedRecipient = false)),
            map((response: any) => {
              if (response) {
                tap(() => (this.searchingRecipient = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              }
            }),
            catchError(() => {
              this.searchFailedRecipient = true;
              return of([]);
            })
          )
      ),
      tap(() => ((this.searchingRecipient = false), (this.modelAddressIdRecipient = '')))
    );

  formatter = (result: { name: string }) => result.name;

  selectAddress() {
    if (this.modelCustomer) {
      const getdAddress = this.modelCustomer?.addresses?.find(
        (val: AddressModel) => val.address_id === Number(this.modelAddressId.address_id)
      );
      this.selectedAddress = getdAddress;
      console.log(this.selectedAddress);
    }
  }

  searchAddressSender = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
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

  dataRecipientAddresses() {
    return this.isDestinationDifferent ? this.modelRecipient?.addresses : this.modelCustomer?.addresses;
  }

  searchAddressRecipient = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(500), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.clickRecipient$.pipe(filter(() => this.instance?.isPopupOpen()));
    const inputFocus$ = this.focusRecipient$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingRecipient = true)),
      switchMap((term) =>
        this.customerService
          .getAddressList({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            customer_id: this.isDestinationDifferent
              ? this.modelRecipient?.customer_id
              : this.modelCustomer?.customer_id,
          })
          .pipe(
            tap(() => (this.searchFailedRecipient = false)),
            map((response: any) => {
              if (response.length > 0) {
                tap(() => (this.searchingRecipient = false));
                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.address.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              } else {
                this.searchFailedRecipient = true;
              }
            }),
            catchError(() => {
              this.searchFailedRecipient = true;
              return of([]);
            })
          )
      ),
      tap(() => (this.searchingRecipient = false))
    );
  };
  onRecipientSelect(event: any, inputElement: HTMLInputElement) {
    inputElement.blur();
  }

  findDataRecipientByValue(value: any) {
    return this.dataRecipientAddresses()?.find((val: AddressModel) => val.address_id === Number(value));
  }

  selectAddressRecipient() {
    if (this.modelCustomer) {
      console.log(this.modelAddressIdRecipient);
      // this.setDefaultSelectionRecipient(this.modelAddressIdRecipient);
      const getdAddress = this.findDataRecipientByValue(this.modelAddressIdRecipient.address_id);
      this.selectedAddressRecipient = getdAddress;
      console.log(this.selectedAddressRecipient);
    }
  }

  async printResi() {
    this.isLoadingPrint = true;
    this.resiNumber = '';

    return await this.modalComponentPrintResi.open();
  }

  dataPrintResi() {
    console.log(this.resiNumber);
    sessionStorage.setItem('printpackage', JSON.stringify(this.resiNumber));
    window.open('#/booking/package/transaction/printpackage', '_blank');
  }

  searchDataPackage = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.clickPrint$.pipe(filter(() => this.instance?.isPopupOpen()));
    const inputFocus$ = this.focusPrint$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => ((this.searchingPrint = true), (this.isLoadingPrint = true))),
      switchMap((term) =>
        this.packageService
          .list({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: '',
            endDate: '',
            city: '',
            status: '',
          })
          .pipe(
            tap(() => (this.searchPrintFailed = false)),
            map((response: any) => {
              if (response.length > 0) {
                tap(() => (this.searchingPrint = false));
                return response.data.filter(
                  (val: PackageModel) => val.resi_number.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              } else {
                this.searchPrintFailed = true;
                this.isLoadingPrint = true;
              }
            }),
            catchError(() => {
              this.searchPrintFailed = true;
              this.isLoadingPrint = true;
              return of([]);
            })
          )
      ),
      tap(() => (this.searchingPrint = false))
    );
  };
  formatterPrint = (result: { resi_number: string }) => result.resi_number;

  onPrintSelect(event: any, inputElement: HTMLInputElement) {
    this.isLoadingPrint = false;
    this.resiNumber = event.item;
    console.log('Selected Package:', this.resiNumber);

    inputElement.blur();
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

  checkDestination() {
    this.isDestinationDifferent = !this.isDestinationDifferent;
    this.modelRecipient = '';
  }

  clearForm() {
    this.form.reset();
  }

  async openModalNew() {
    this.isCreate = true;
    this.isRequest = false;
    this.clearForm();
    this.modelCustomer = '';
    this.modelAddressId = '';
    this.modelRecipient = '';
    this.modelAddressIdRecipient = '';

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
      category_id: null,
      request: '',
      level: 'Normal',
      status: 'Lunas (Kantor)',
      origin_from: 'Kantor',
      koli: 1,
      status_package: 'Progress',
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

    this.formSender.patchValue({
      customer_id: this.modelCustomer?.customer_id,
      name: this.modelAddressId?.name,
      address: this.modelAddressId?.address,
      telp: this.modelAddressId?.telp,
      defaults: this.modelAddressId?.default,
      longitude: this.modelAddressId?.longitude,
      latitude: this.modelAddressId?.latitude,
      zoom: this.modelAddressId?.zoom,
      description: this.modelAddressId?.description,
      used: this.modelAddressId?.used,
    });

    this.formRecipient.patchValue({
      customer_id: this.isDestinationDifferent ? this.modelRecipient?.customer_id : this.modelCustomer?.customer_id,
      name: this.modelAddressIdRecipient?.name,
      address: this.modelAddressIdRecipient?.address,
      telp: this.modelAddressIdRecipient?.telp,
      defaults: this.modelAddressIdRecipient?.default,
      longitude: this.modelAddressIdRecipient?.longitude,
      latitude: this.modelAddressIdRecipient?.latitude,
      zoom: this.modelAddressIdRecipient?.zoom,
      description: this.modelAddressIdRecipient?.description,
      used: this.modelAddressIdRecipient?.used,
    });

    // create send data to sender, recipient, package
    this.isLoading = true;
    this.packageService
      .createSender(this.formSender.value)
      .pipe(
        switchMap((respCustomer: any) => {
          console.log('Response from respCustomer:', respCustomer);
          this.form.patchValue({
            sender_id: respCustomer.data.sender_id,
          });
          return this.packageService.createRecipient(this.formRecipient.value);
        }),
        switchMap((respRecipient: any) => {
          console.log('Response from respRecipient:');
          console.log(respRecipient);
          this.form.patchValue({
            book_date: valueBookDate,
            recipient_id: respRecipient.data.recipient_id,
          });
          console.log(this.form.value);
          return this.packageService.create(this.form.value);
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

            this.params = {
              limit: this.pagination.limit,
              page: this.pagination.offset,
              search: this.pagination.search,
              startDate: '',
              endDate: '',
              city: this.currentTab,
              status: this.pagination.status,
            };

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

  async openModalEdit(event: PackageModel) {
    console.log(event);
    this.isCreate = false;

    this.formatDateValue(event?.book_date);

    if (event.request || event.request_description) {
      this.isRequest = true;
    } else {
      this.isRequest = false;
    }

    this.modelCustomer = event.sender.customer;
    this.modelAddressId = event.sender;
    // console.log(this.modelAddressId);
    // this.selectedAddress = getdAddressCustomer;

    this.modelRecipient = event.recipient.customer;
    this.modelAddressIdRecipient = event.recipient;
    // console.log(this.modelAddressIdRecipient);
    // this.selectedAddressRecipient = getdAddressRecipient;

    console.log(this.modelCustomer);
    console.log(this.modelRecipient);

    this.form.patchValue({
      package_id: event.package_id,
      sender_id: event.sender_id,
      recipient_id: event.recipient_id,
      city_id: event.city_id,
      employee_id: event.employee_id,
      category_id: event.category_id ? event.category_id : null,
      go_send_id: event.go_send_id,
      description: event.description,
      cost: event.cost,
      discount: event.discount,
      payment: event.payment,
      koli: event.koli,
      origin_from: event.origin_from,
      level: event.level,
      request: event.request ? event.request : '',
      request_description: event.request_description,
      note: event.note,
      status: event.status ? event.status : '',
      status_package: event.status_package ? event.status_package : '',
      resi_number: event.resi_number,
      photo: event.photo,
      print: event.print,
      move_time: event.move_time,
      book_date: event.book_date,
      send_date: event.send_date,
      check_payment: event.check_payment,
      check_sp: event.check_sp,
      check_date_sp: event.check_date_sp,
      taking_time: event.taking_time,
      taking_by: event.taking_by,
      taking_status: event.taking_status,
      office: event.office,
    });

    this.formSender.patchValue({
      sender_id: event.sender_id,
    });

    this.formRecipient.patchValue({
      recipient_id: event.recipient_id,
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

    this.formSender.patchValue({
      customer_id: this.modelCustomer?.customer_id,
      name: this.modelAddressId?.name,
      address: this.modelAddressId?.address,
      telp: this.modelAddressId?.telp,
      defaults: this.modelAddressId?.default,
      longitude: this.modelAddressId?.longitude,
      latitude: this.modelAddressId?.latitude,
      zoom: this.modelAddressId?.zoom,
      description: this.modelAddressId?.description,
      used: this.modelAddressId?.used,
    });

    this.formRecipient.patchValue({
      customer_id: this.isDestinationDifferent ? this.modelRecipient?.customer_id : this.modelCustomer?.customer_id,
      name: this.modelAddressIdRecipient?.name,
      address: this.modelAddressIdRecipient?.address,
      telp: this.modelAddressIdRecipient?.telp,
      defaults: this.modelAddressIdRecipient?.default,
      longitude: this.modelAddressIdRecipient?.longitude,
      latitude: this.modelAddressIdRecipient?.latitude,
      zoom: this.modelAddressIdRecipient?.zoom,
      description: this.modelAddressIdRecipient?.description,
      used: this.modelAddressIdRecipient?.used,
    });
    console.log(this.modelAddressIdRecipient);
    console.log(this.formRecipient.value);

    // edit send data to sender, recipient, package
    this.isLoading = true;
    this.packageService
      .editSender(this.formSender.value)
      .pipe(
        switchMap((respCustomer: any) => {
          console.log('Response from respCustomer:', respCustomer);
          this.form.patchValue({
            sender_id: respCustomer.data.sender_id,
          });
          return this.packageService.editRecipient(this.formRecipient.value);
        }),
        switchMap((respRecipient: any) => {
          console.log('Response from respRecipient:');
          console.log(respRecipient);
          this.form.patchValue({
            book_date: valueBookDate,
            recipient_id: respRecipient.data.recipient_id,
          });
          console.log(this.form.value);
          return this.packageService.edit(this.form.value);
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
    // const catSubscr = this.packageService.edit(this.form.value)
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
    // this.unsubscribe.push(catSubscr);
  }

  openModalPrint(event: PackageModel) {
    this.form.patchValue(event);

    this.form.patchValue({
      print: 1,
    });

    this.isLoading = true;
    this.packageService
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
            // this.snackbar.open(resp.message, '', {
            //   panelClass: 'snackbar-success',
            //   duration: 5000,
            // });

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

    sessionStorage.setItem('printpackage', JSON.stringify(event));
    window.open('#/booking/package/transaction/printpackage', '_blank');
  }

  async openModalCancel(event: PackageModel) {
    this.form.patchValue(event);

    this.form.patchValue({
      status_package: 'Cancel',
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
            // edit package
            this.isLoading = true;
            this.packageService
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

  async openModalDelete(event: PackageModel) {
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
    const passSubscr = this.packageService
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

  async openModalNewSP(event: PackageModel) {
    console.log(event);

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
      package_id: event.package_id,
      city_id: city,
      send_date: event.book_date,
      sp_package: formatSP,
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

    // send data to gosend, package
    this.isLoading = true;
    this.packageService
      .createSP(this.formSP.value)
      .pipe(
        switchMap((resp: any) => {
          console.log('Response from sp:');
          console.log(resp);
          this.form.patchValue({
            package_id: resp.data.package_id,
            go_send_id: resp.data.go_send_id,
            city_id: resp.data.city_id,
            book_date: resp.data.send_date,
            status_package: 'Delivery',
          });
          return this.packageService.patch(this.form.value);
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

  async openModalEditSP(event: PackageModel) {
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
        package_id: event.package_id,
        send_time: event.go_send?.send_time,
        send_date: event.book_date,
        sp_number: event.go_send?.sp_number,
        sp_package: formatSP,
        sp_passenger: event.go_send?.sp_passenger,
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

    // send data to gosend, package
    this.isLoading = true;
    this.packageService
      .editSP(this.formSP.value)
      .pipe(
        switchMap((resp: any) => {
          console.log('Response from sp:');
          console.log(resp);
          const gosend: any = {
            package_id: resp.data.package_id,
            go_send_id: resp.data.go_send_id,
            city_id: resp.data.city_id,
            book_date: resp.data.send_date,
            status_package: 'Delivery',
          };
          return this.packageService.patch(gosend);
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

  // async openModalDriverSP(event: PackageModel) {
  //   this.driverSP = event;
  //   return await this.modalComponentAssignSP.open();
  // }

  assignDriverSP(event: PackageModel) {
    console.log(this.delivery);
    this.isAssignSP.emit(false);

    const updateSP: any = {
      package_id: event.package_id,
      go_send_id: this.delivery.go_send_id,
      status_package: 'Delivery',
      send_date: this.delivery.send_date,
    };
    console.log(updateSP);

    // send data to package
    this.isLoading = true;
    this.packageService
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
              duration: 5000,
            });

            this.dataList(this.params);
            this.isAssignSP.emit(true);
            await this.modalComponentSP.dismiss();
          } else {
            this.isLoading = false;
            this.isAssignSP.emit(false);
          }
        },
        (error: any) => {
          console.log(error);
          this.isLoading = false;
          this.isAssignSP.emit(false);
          this.handlerResponseService.failedResponse(error);
        }
      );
  }

  removeDriverSP(event: PackageModel) {
    console.log(this.delivery);

    const updateSP: any = {
      package_id: event.package_id,
      go_send_id: null,
      status_package: 'Progress',
      send_date: null,
    };
    console.log(updateSP);

    // send data to package
    this.isLoading = true;
    this.packageService
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
}
