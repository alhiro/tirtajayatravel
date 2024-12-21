import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  merge,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalConfig, ModalComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { CategoryService } from '@app/pages/master/category/category.service';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '@app/pages/master/employee/employee.service';
import * as moment from 'moment';
import { Utils } from '@app/@shared';
import { PackageService } from '@app/pages/booking/package/package.service';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { DeliveryService } from '@app/pages/booking/delivery/delivery.service';
import { CustomerService } from '@app/pages/master/customer/customer.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.scss'],
})
export class CommissionComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public username!: string;
  public city_id!: number;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public defaultAddressCustomer: any;
  public defaultAddressRecipient: any;
  public dataRow: any;
  public data: any;
  public dataCustomer: any;
  public modelDriver: any;

  public dataLength!: number;

  public toggledRows = new Set<number>();

  public modelEmployee: any;
  public searchingEmployee = false;
  public searchFailedEmployee = false;

  public modelCustomer: any;
  public isLoadingPrint = false;
  public searchPrintFailed = false;
  public searchingPrint = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: 'Delivery',
    username: '',
  };
  public params = {
    limit: 10,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: 'Delivery',
    username: '',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;
  formRecipient!: FormGroup;
  isLoading = false;
  isLoadingCustomer = false;

  get f() {
    return this.form.controls;
  }

  modalConfigEdit: ModalConfig = {
    modalTitle: 'Add Recipient & Courier',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  modalConfigPrintUser: ModalConfig = {
    modalTitle: 'Print Monthly',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalComponent;
  @ViewChild('datepicker') datePicker!: any;
  @ViewChild('modalPrintUser') private modalComponentPrintUser!: ModalComponent;

  @Input() cssClass!: '';
  currentTab = 'Malang';

  minDate: any;
  receivedDate!: NgbDateStruct;

  calendar = inject(NgbCalendar);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 0);

  startDate: any;
  endDate: any;

  isMobile: boolean = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private packageService: PackageService,
    private categoryService: CategoryService,
    private employeeService: EmployeeService,
    private deliveryService: DeliveryService,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private utils: Utils,
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.initForm();

    this.levelrule = this.utils.getLevel();
    this.city_id = this.utils.getCity();
    this.username = this.utils.getUsername();
    if ((this.levelrule === 2 && this.city_id == 2) || this.levelrule === 8) {
      this.currentTab = 'Malang';
    } else if ((this.levelrule === 2 && this.city_id == 1) || (this.levelrule === 3 && this.city_id == 1)) {
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

  printFilterSelected(datepicker: any) {
    let getCity = '';
    if (this.levelrule === 2) {
      if (this.city_id === 1) {
        getCity = 'Surabaya';
      } else {
        getCity = 'Malang';
      }
    } else {
      getCity = '';
    }

    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.city_id === 1 || this.city_id === null ? this.pagination.search : 'Bayar Tujuan (COD)',
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.city_id === 1 ? 'Surabaya' : 'Malang',
      status: this.pagination.status,
      username: this.levelrule === 5 ? this.username : '',
    };

    this.dataList(this.params);
    console.log(this.params);

    datepicker.close();
  }

  printFilterDate(datepicker: any) {
    let getCity = '';
    if (this.levelrule === 2) {
      if (this.city_id === 1) {
        getCity = 'Surabaya';
      } else {
        getCity = 'Malang';
      }
    } else {
      getCity = '';
    }

    const paramRange = {
      limit: 10,
      page: 1,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: getCity,
      status: 'Delivery',
      username: '',
    };
    console.log(paramRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(paramRange));
    window.open('#/finance/commission/package/printcommission', '_blank');
  }

  printFilterBa(datepicker: any) {
    let getCity = '';
    if (this.levelrule === 2) {
      if (this.city_id === 1) {
        getCity = 'Surabaya';
      } else {
        getCity = 'Malang';
      }
    } else {
      getCity = '';
    }

    const paramRange = {
      limit: 10,
      page: 1,
      search: 'Bayar Tujuan (COD)',
      fromDate: this.startDate,
      toDate: this.endDate,
      city: getCity,
      status: 'Delivery',
      username: '',
    };
    console.log(paramRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(paramRange));
    window.open('#/finance/commission/package/printbayartujuan', '_blank');
  }

  async printUser() {
    this.isLoadingPrint = true;
    this.modelCustomer = '';

    return await this.modalComponentPrintUser.open();
  }

  printFilterMonthly() {
    let getCity = '';
    if (this.levelrule === 2) {
      if (this.city_id === 1) {
        getCity = 'Malang';
      } else {
        getCity = 'Surabaya';
      }
    } else {
      getCity = '';
    }

    const paramRange = {
      limit: 10,
      page: 1,
      search: 'Customer (Bulanan)',
      fromDate: this.startDate,
      toDate: this.endDate,
      city: getCity,
      status: 'Delivery',
      username: this.modelCustomer?.name,
    };
    console.log(paramRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(paramRange));
    window.open('#/finance/commission/package/printmonthly', '_blank');
  }

  onDateChange(date: NgbDateStruct): void {
    this.receivedDate = date;
  }

  datepicker() {
    this.datePicker.toggle();
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

    const inputDate = new Date();
    const { startDate, endDate } = this.utils.singleDate(inputDate);

    this.startDate = startDate;
    this.endDate = endDate;

    this.pagination.startDate = this.startDate;
    this.pagination.endDate = this.endDate;

    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
      city: this.currentTab,
      status: this.pagination.status,
      username: this.levelrule === 5 ? this.username : '',
    };
    this.dataList(this.params);
    datepicker.close();
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
    this.breakpointObserver.observe(['(max-width: 440px)']).subscribe((result) => {
      this.isMobile = result.matches;
      if (this.isMobile) {
        console.log('Mobile screen detected');
      } else {
        console.log('Desktop screen detected');
      }
    });

    // this.configuration.resizeColumn = true;
    // this.configuration.fixedColumnWidth = false;
    this.configuration.showDetailsArrow = true;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'received_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'cost', title: 'Cost' },
      { key: 'agent_commission', title: 'Commission' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'received_by', title: 'Received By' },
      { key: 'courier', title: 'Courier' },
      { key: 'check_date_sp', title: 'Check Date' },
      { key: 'status', title: 'Status Payment' },
      { key: 'admin', title: 'Admin' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    const inputDate = new Date();
    const { startDate, endDate } = this.utils.singleDate(inputDate);

    this.startDate = startDate;
    this.endDate = endDate;

    this.params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.city_id === 1 || this.city_id === null ? this.pagination.search : 'Bayar Tujuan (COD)',
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.city_id === 1 ? 'Surabaya' : 'Malang',
      status: this.pagination.status,
      username: this.levelrule === 5 ? this.username : '',
    };
    this.dataList(this.params);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      package_id: [''],
      sender_id: [''],
      recipient_id: [''],
      city_id: [''],
      employee_id: [''],
      category_id: [''],
      go_send_id: [''],
      description: [''],
      cost: [''],
      discount: [''],
      payment: [''],
      koli: [''],
      origin_from: [''],
      level: [''],
      request: [''],
      request_description: [''],
      note: [''],
      status: [''],
      status_package: [''],
      resi_number: [''],
      photo: [''],
      print: [''],
      move_time: [''],
      receivedDate: [''],
      send_date: [''],
      check_payment: [''],
      check_sp: [''],
      check_date_sp: [''],
      taking_time: [''],
      taking_by: [''],
      taking_status: [''],
      office: [''],
    });

    this.formRecipient = this.formBuilder.group({
      recipient_id: [''],
      customer_id: [''],
      package_id: [''],
      date: [''],
      user_payment: [''],
      date_payment: [''],
      received_by: [''],
      received_date: [''],
      courier: [''],
      sign: [''],
    });
  }

  formatDateNow(event: any) {
    const valDate = {
      year: event.getFullYear(),
      month: event.getMonth() + 1,
      day: event.getDate(),
    };
    this.receivedDate = { year: valDate.year, month: valDate.month, day: valDate.day };
    console.log(this.receivedDate);
  }

  formatDateValue(value: any) {
    const eventDate = moment.utc(value);
    console.log('event eventDate', eventDate);
    const valDate = {
      year: eventDate.year(),
      month: eventDate.month() + 1,
      day: eventDate.date(),
    };
    this.receivedDate = { year: valDate.year, month: valDate.month, day: valDate.day };
    console.log(this.receivedDate);
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;

    if (this.currentTab === 'Malang') {
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.city_id === 1 || this.city_id === null ? this.pagination.search : 'Bayar Tujuan (COD)',
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.currentTab,
        status: this.pagination.status,
        username: this.levelrule === 5 ? this.username : '',
      };
      this.dataList(this.params);
    } else if (this.currentTab === 'Surabaya') {
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.city_id === 1 || this.city_id === null ? this.pagination.search : 'Bayar Tujuan (COD)',
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.currentTab,
        status: this.pagination.status,
        username: this.levelrule === 5 ? this.username : '',
      };
      this.dataList(this.params);
    }
  }

  checkLevel(event: Event) {
    console.log(event.target);
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
      search: this.city_id === 1 || this.city_id === null ? this.pagination.search : 'Bayar Tujuan (COD)',
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.currentTab,
      status: this.pagination.status,
      username: this.levelrule === 5 ? this.username : '',
    };
    this.dataList(this.params);
  }

  private dataList(params: ExtendedPaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .list(params)
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        this.data = response.data;
        this.dataLength = response.length;

        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
        this.pagination.count = response.length;
        this.pagination = { ...this.pagination };

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  searchDataDriver: any = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap((term) =>
        this.deliveryService
          .driver({
            limit: this.params.limit,
            page: this.params.page,
            search: term,
            startDate: this.params.startDate,
            endDate: this.params.endDate,
          })
          .pipe(
            map((response: any) => {
              if (response) {
                this.params = {
                  limit: this.pagination.limit,
                  page: this.pagination.offset,
                  search: this.city_id === 1 || this.city_id === null ? this.pagination.search : 'Bayar Tujuan (COD)',
                  startDate: this.startDate,
                  endDate: this.endDate,
                  city: this.currentTab,
                  status: this.pagination.status,
                  username: this.levelrule === 5 ? this.username : '',
                };
                this.dataList(this.params);
              }
            }),
            catchError((err) => {
              console.log(err);
              this.handlerResponseService.failedResponse(err);
              return of([]);
            })
          )
      )
    );

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
              if (response.length > 0) {
                let city: any;
                if (this.currentTab === 'Malang') {
                  city = 1;
                } else if (this.currentTab === 'Surabaya') {
                  city = 2;
                }

                // const kurir = response.data.filter((val: any) => val.level_id === 5 && val.city_id === city);
                tap(() => (this.searchingEmployee = false));
                return response.data.filter((val: any) => val.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
              } else {
                this.searchFailedEmployee = true;
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

  formatter = (result: { name: string }) => result.name;

  format(date: NgbDateStruct): string {
    return date ? `${date.day}/${date.month}/${date.year}` : '';
  }

  searchDataCustomer = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => ((this.searchingPrint = true), (this.isLoadingPrint = true))),
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
            tap(() => (this.searchPrintFailed = false)),
            map((response: any) => {
              if (response.length > 0) {
                tap(() => (this.searchingPrint = false));

                return response.data.filter(
                  (val: any) =>
                    val.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    val.telp.toLowerCase().indexOf(term.toLowerCase()) > -1
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
  formatterCustomer = (result: { name: string }) => result.name;

  onPrintSelect(event: any, inputElement: HTMLInputElement) {
    this.isLoadingPrint = false;
    this.modelCustomer = event.item;
    console.log('Selected Customer:', this.modelCustomer);

    inputElement.blur();
  }

  async openModalEdit(event: PackageModel) {
    console.log(event);

    const nameCourier = { name: this.username ? this.username : event.recipient?.courier };
    this.modelEmployee = nameCourier;
    this.formatDateValue(new Date());

    this.formRecipient.patchValue({
      recipient_id: event.recipient_id,
      package_id: event.package_id,
      customer_id: event.recipient?.customer_id,
      date: event.recipient?.date,
      user_payment: event.recipient?.user_payment,
      date_payment: event.recipient?.date_payment,
      received_by: event.recipient?.received_by,
      received_date: event.recipient?.received_date,
      courier: event.recipient?.courier,
      sign: event.recipient?.sign,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    // send data to recipient
    const valueDate = new Date(
      Date.UTC(this.receivedDate.year, this.receivedDate.month - 1, this.receivedDate.day)
    ).toISOString();
    console.log(valueDate);

    this.formRecipient.patchValue({
      courier: this.modelEmployee?.name,
      received_date: valueDate,
    });
    console.log(this.formRecipient.value);

    this.isLoading = true;
    this.packageService
      .editRecipient(this.formRecipient.value)
      .pipe(
        finalize(() => {
          this.formRecipient.markAsPristine();
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

  async openModalEditPayment(event: PackageModel) {
    console.log(event);
    this.form.patchValue(event);

    this.translate
      .get(['SWAL.ARE_YOU_SURE', 'SWAL.REVERT_WARNING', 'SWAL.CONFIRM_SUBMIT', 'SWAL.BACK_BUTTON'])
      .subscribe((translations) => {
        Swal.fire({
          title: translations['SWAL.ARE_YOU_SURE'],
          text: translations['SWAL.REVERT_WARNING'],
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: translations['SWAL.CONFIRM_SUBMIT'],
          cancelButtonText: translations['SWAL.BACK_BUTTON'],
        }).then((result) => {
          if (result.isConfirmed) {
            this.dataEditPayment();
          }
        });
      });
  }

  dataEditPayment() {
    this.form.patchValue({
      check_payment: true,
      // status_package: 'Completed',
    });
    console.log(this.form.value);

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

  dataEditPaymentRecipient() {
    // send data to update bayar tujuan
    this.formRecipient.patchValue({
      sign: this.username,
    });
    console.log(this.formRecipient.value);

    this.isLoading = true;
    this.packageService
      .editRecipient(this.formRecipient.value)
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

  async openModalEditCommission(event: PackageModel) {
    console.log(event);
    this.form.patchValue(event);

    this.translate
      .get(['SWAL.ARE_YOU_SURE', 'SWAL.REVERT_WARNING', 'SWAL.CONFIRM_SUBMIT', 'SWAL.BACK_BUTTON'])
      .subscribe((translations) => {
        Swal.fire({
          title: translations['SWAL.ARE_YOU_SURE'],
          text: translations['SWAL.REVERT_WARNING'],
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: translations['SWAL.CONFIRM_SUBMIT'],
          cancelButtonText: translations['SWAL.BACK_BUTTON'],
        }).then((result) => {
          if (result.isConfirmed) {
            this.dataEditCommission();
          }
        });
      });
  }

  dataEditCommission() {
    this.form.patchValue({
      check_date_sp: new Date(),
      check_sp: true,
      // status_package: 'Completed',
    });
    console.log(this.form.value);

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

  dataEditCommissionRecipient() {
    // send data to update commission
    this.formRecipient.patchValue({
      date_payment: new Date(),
    });
    console.log(this.formRecipient.value);

    this.isLoading = true;
    this.packageService
      .editRecipient(this.formRecipient.value)
      .pipe(
        finalize(() => {
          this.formRecipient.markAsPristine();
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
}
