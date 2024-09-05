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

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public defaultAddressCustomer: any;
  public defaultAddressRecipient: any;
  public dataRow: any;
  public data: any;
  public dataCustomer: any;
  public dataSurabaya: any;

  public dataLengthMalang!: number;
  public dataLengthSurabaya!: number;

  public toggledRows = new Set<number>();

  public modelEmployee: any;
  public searchingEmployee = false;
  public searchFailedEmployee = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    search: 'Recipient',
    startDate: '',
    endDate: '',
  };
  public params = {
    limit: 10,
    page: 1,
    search: 'Recipient',
    startDate: '',
    endDate: '',
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
  @ViewChild('modal') private modalComponent!: ModalComponent;
  @ViewChild('datepicker') datePicker!: any;

  @Input() cssClass!: '';
  currentTab!: string;

  minDate: any;
  receivedDate!: NgbDateStruct;

  calendar = inject(NgbCalendar);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 0);

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

      this.pagination.startDate = startDate;
      this.pagination.endDate = endDate;

      const params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: startDate,
        endDate: endDate,
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
    this.configuration.horizontalScroll = true;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'received_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'cost', title: 'Cost' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'received_by', title: 'Received By' },
      { key: 'received_date', title: 'Received Date' },
      { key: 'check_date_sp', title: 'Check' },
      { key: 'courier', title: 'Courier' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    const inputDate = new Date();
    const { startDate, endDate } = this.utils.singleDate(inputDate);

    const params = {
      limit: '',
      page: '',
      search: '',
      startDate: startDate,
      endDate: endDate,
    };
    console.log(params);
    this.dataList(params);
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
    this.packageService
      .list(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        console.log(response);
        // count malang or surabaya
        if (response.data.length > 0) {
          const malangData = response.data?.filter(
            (data: PackageModel) => data.city_id === 1 && data.status_package === 'Completed'
          );
          const surabayaData = response.data?.filter(
            (data: PackageModel) => data.city_id === 2 && data.status_package === 'Completed'
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
          this.dataLengthMalang = 0;
          this.dataLengthSurabaya = 0;

          this.data = [];
          this.dataSurabaya = [];
        }
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

  formatter = (result: { name: string }) => result.name;

  format(date: NgbDateStruct): string {
    return date ? `${date.day}/${date.month}/${date.year}` : '';
  }

  async openModalEdit(event: PackageModel) {
    console.log(event);

    const nameCourier = { name: event.recipient?.courier };
    this.modelEmployee = nameCourier;
    this.formatDateValue(event.recipient?.received_date);

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
}
