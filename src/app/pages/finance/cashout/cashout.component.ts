import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, Subscription, finalize, takeUntil } from 'rxjs';
import {
  Pagination,
  PaginationContext,
  Params,
  defaultPagination,
  defaultParams,
} from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { ModalComponent, ModalConfig } from '@app/_metronic/partials';

import { CashoutModel } from './models/cashout.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { CashoutService } from './cashout.service';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Utils } from '@app/@shared';
import * as moment from 'moment';
import { LocalService } from '@app/services/local.service';
import Swal from 'sweetalert2';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-cashout',
  templateUrl: './cashout.component.html',
  styleUrls: ['./cashout.component.scss'],
})
export class CashoutComponent implements OnInit {
  public levelrule!: number;
  public username!: string;
  public city_id!: number;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];

  public dataMalang: any;
  public dataSurabaya: any;
  public dataLengthMalang!: number;
  public dataLengthSurabaya!: number;

  public toggledRows = new Set<number>();
  public isCreate = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination: Pagination = { ...defaultPagination };
  public params: Params = { ...defaultParams };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;
  isLoading = false;
  get f() {
    return this.form.controls;
  }

  currentTab = 'Malang';
  currentDisplay: boolean = false;

  minDate: any;
  date!: NgbDateStruct;

  type: any;
  totalCostMalang: any;
  totalCostSurabaya: any;

  startDate: any;
  endDate: any;

  calendar = inject(NgbCalendar);
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 0);

  modalConfigCreate: ModalConfig = {
    modalTitle: 'Create Cashout',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Cashout',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalComponent;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private cashoutService: CashoutService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private utils: Utils,
    private localService: LocalService
  ) {
    this.levelrule = this.utils.getLevel();
    this.city_id = this.utils.getCity();
    this.username = this.utils.getUsername();
    if (this.levelrule === 2 && this.city_id == 1) {
      this.currentTab = 'Malang';
    } else if (this.levelrule === 2 && this.city_id == 2) {
      this.currentTab = 'Surabaya';
    }

    this.initForm();

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

  formatDateNow(event: any) {
    const valDate = {
      year: event.getFullYear(),
      month: event.getMonth() + 1,
      day: event.getDate(),
    };
    this.date = { year: valDate.year, month: valDate.month, day: valDate.day };
    console.log(this.date);
  }

  formatDateValue(value: any) {
    const eventDate = moment.utc(value);
    console.log('event eventDate', eventDate);
    const valDate = {
      year: eventDate.year(),
      month: eventDate.month() + 1,
      day: eventDate.date(),
    };
    this.date = { year: valDate.year, month: valDate.month, day: valDate.day };
    console.log(this.date);
  }

  onDateChange(date: NgbDateStruct): void {
    this.date = date;
  }

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      // datepicker.close(); // Close datepicker popup

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
      //   startDate: startDate,
      //   endDate: endDate,
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

      // const params = {
      //   limit: this.pagination.limit,
      //   page: this.pagination.offset,
      //   search: this.pagination.search,
      //   startDate: startDate,
      //   endDate: endDate,
      // };
      // console.log(params);
      // this.dataList(params);
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
    };

    this.dataList(this.params);
    console.log(this.params);

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
    this.type = this.localService.getType();
    this.dataList(this.params);

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'cashout_id', title: 'No' },
      { key: 'date', title: 'Date' },
      { key: 'type', title: 'Type' },
      { key: 'fee', title: 'Cost' },
      { key: 'description', title: 'Description' },
      { key: 'createdAt', title: 'Created At' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];
  }

  private initForm() {
    this.form = this.formBuilder.group({
      cashout_id: [''],
      package_id: [''],
      passenger_id: [''],
      city_id: [''],
      date: [''],
      type: [''],
      fee: [''],
      description: [''],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
  }

  eventEmitted($event: { event: string; value: any }): void {
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
    this.cashoutService
      .list(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        const malangData = response.data?.filter((data: CashoutModel) => data.city_id === 1);
        const surabayaData = response.data?.filter((data: CashoutModel) => data.city_id === 2);

        this.dataLengthMalang = malangData?.length;
        this.dataLengthSurabaya = surabayaData?.length;
        this.dataMalang = malangData;
        this.dataSurabaya = surabayaData;

        this.totalCostMalang = this.utils.sumTotal(this.dataMalang?.map((data: CashoutModel) => data.fee));
        this.totalCostSurabaya = this.utils.sumTotal(this.dataSurabaya?.map((data: CashoutModel) => data.fee));

        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
        this.pagination.count =
          this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
        this.pagination = { ...this.pagination };
        this.configuration.isLoading = false;

        response?.length > 0
          ? (this.configuration.horizontalScroll = true)
          : (this.configuration.horizontalScroll = false);
        this.cdr.detectChanges();
      });
  }

  clearForm() {
    this.form.reset();
  }

  async openModalNew() {
    this.isCreate = true;
    this.clearForm();

    let city: any = '';
    if (this.currentTab === 'Malang') {
      city = 1;
    } else if (this.currentTab === 'Surabaya') {
      city = 2;
    }

    this.form.patchValue({
      type: '',
      city_id: city,
    });

    return await this.modalComponent.open();
  }

  dataCreate() {
    const valueDate = new Date(Date.UTC(this.date.year, this.date.month - 1, this.date.day)).toISOString();
    console.log(valueDate);

    this.form.patchValue({
      date: valueDate,
    });
    console.log(this.form.value);

    this.isLoading = true;
    const cashoutSubscr = this.cashoutService
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
    this.unsubscribe.push(cashoutSubscr);
  }

  async openModalEdit(event: CashoutModel) {
    console.log(event);
    this.isCreate = false;

    this.formatDateValue(event.date);

    this.form.patchValue({
      cashout_id: event.cashout_id,
      package_id: event.package_id,
      passenger_id: event.passenger_id,
      date: event.date,
      type: event.type,
      fee: event.fee,
      description: event.description,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    const valueDate = new Date(Date.UTC(this.date.year, this.date.month - 1, this.date.day)).toISOString();
    console.log(valueDate);

    this.form.patchValue({
      date: valueDate,
    });

    console.log(this.form.value);
    this.isLoading = true;
    const cashoutSubscr = this.cashoutService
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
    this.unsubscribe.push(cashoutSubscr);
  }

  async openModalDelete(event: CashoutModel) {
    this.form.patchValue({
      cashout_id: event.cashout_id,
    });
    console.log(this.form.value);

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataDelete();
      }
    });
  }

  dataDelete() {
    console.log(this.form.value);
    this.isLoading = true;
    const cashoutSubscr = this.cashoutService
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
    this.unsubscribe.push(cashoutSubscr);
  }
}
