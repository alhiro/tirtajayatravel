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

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-piutang',
  templateUrl: './piutang.component.html',
  styleUrls: ['./piutang.component.scss'],
})
export class PiutangComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public username!: string;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public defaultAddressCustomer: any;
  public defaultAddressRecipient: any;
  public dataRow: any;
  public data: any;
  public dataCustomer: any;

  public dataLength!: number;

  public toggledRows = new Set<number>();

  public modelEmployee: any;
  public searchingEmployee = false;
  public searchFailedEmployee = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: 'Completed',
  };
  public params = {
    limit: 10,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: 'Completed',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;
  formRecipient!: FormGroup;
  isLoading = false;
  isLoadingCustomer = false;

  get f() {
    return this.form.controls;
  }

  @ViewChild('datepicker') datePicker!: any;

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

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private packageService: PackageService,
    private categoryService: CategoryService,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private utils: Utils,
    private translate: TranslateService
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
    const paramRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: this.currentTab === 'Malang' ? JSON.stringify(1) : JSON.stringify(2),
      status: this.pagination.status,
    };
    console.log(paramRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(paramRange));
    window.open('#/finance/piutang/bill/printpiutang', '_blank');
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
    // this.configuration.resizeColumn = true;
    // this.configuration.fixedColumnWidth = false;
    this.configuration.showDetailsArrow = true;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'received_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'book_date', title: 'Date' },
      { key: 'cost', title: 'Cost' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'received_by', title: 'Received By' },
      { key: 'status', title: 'Status Payment' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    const inputDate = new Date();
    const { startDate, endDate } = this.utils.singleDate(inputDate);

    this.startDate = startDate;
    this.endDate = endDate;

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
        search: this.pagination.search,
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.currentTab,
        status: this.pagination.status,
      };
      this.dataList(this.params);
    } else if (this.currentTab === 'Surabaya') {
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
      search: this.pagination.search,
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
      city: this.currentTab,
      status: this.pagination.status,
    }; // see https://github.com/typicode/json-server
    this.dataList(this.params);
  }

  private dataList(params: ExtendedPaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listAll(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        console.log(response);
        if (response.data.length > 0) {
          this.data = response.data?.filter(
            (data: PackageModel) => data.status === 'Piutang' || data.status === 'Bayar Tujuan (COD)'
          );
          this.dataLength = response.data?.length;

          // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
          this.pagination.count =
            this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.configuration.horizontalScroll = false;
          this.data = [];
          this.dataLength = 0;
        }
      });
  }

  formatter = (result: { name: string }) => result.name;

  format(date: NgbDateStruct): string {
    return date ? `${date.day}/${date.month}/${date.year}` : '';
  }

  async openModalEdit(event: PackageModel) {
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
            this.dataEdit();
          }
        });
      });
  }

  dataEdit() {
    // send data to update check payment
    this.formRecipient.patchValue({
      sign: true,
    });
    console.log(this.form.value);

    this.configuration.isLoading = true;
    this.packageService
      .patch(this.form.value)
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
