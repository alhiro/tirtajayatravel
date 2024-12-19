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
import {
  Pagination,
  PaginationContext,
  Params,
  defaultPagination,
  defaultParams,
} from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { ModalComponent, ModalConfig } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { VendorService } from './vendor.service';
import { VendorModel } from './models/vendor.model';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Utils } from '@app/@shared';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { CarService } from '@app/pages/master/car/car.service';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss'],
})
export class VendorComponent implements OnInit {
  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];

  public data: any;
  public dataLength!: number;

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

  modalConfigCreate: ModalConfig = {
    modalTitle: 'Create Vendor',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Vendor',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalComponent;

  @Input() cssClass!: '';
  currentTab = '';

  minDate: any;
  bookdate!: NgbDateStruct;
  booktime: NgbTimeStruct = { hour: 0, minute: 0, second: 0 };

  calendar = inject(NgbCalendar);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 0);

  startDate: any;
  endDate: any;

  public modelCar: any;
  public searchingCar = false;
  public searchFailedCar = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private vendorService: VendorService,
    private carService: CarService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private utils: Utils,
    private handlerResponseService: HandlerResponseService
  ) {
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
    }
  }

  resetFilterDate(datepicker: any) {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 0);
    this.dataList(this.params);
    datepicker.close();
  }

  printFilterSelected(datepicker: any) {
    const params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.startDate,
      endDate: this.endDate,
    };
    console.log(params);
    this.dataList(params);
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

  onDateChange(date: NgbDateStruct): void {
    this.bookdate = date;
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
  }

  ngOnInit() {
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
    };
    this.dataList(this.params);

    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'garage_id', title: 'No' },
      { key: 'name', title: 'Name' },
      { key: 'type', title: 'Type' },
      { key: 'address', title: 'Address' },
      { key: 'telp', title: 'Telp' },
      { key: 'status', title: 'Status' },
      { key: 'createdAt', title: 'Created At' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];
  }

  private initForm() {
    this.form = this.formBuilder.group({
      vendor_garage_id: [''],
      car_id: [''],
      name: [''],
      type: [''],
      address: [''],
      telp: [''],
      status: [''],
      description: [''],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    this.vendorService
      .list(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        console.log(response);

        if (response.data.length > 0) {
          const data = response.data;
          this.dataLength = data.length;
          this.data = data;

          // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
          this.pagination.count =
            this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = false;

          this.dataLength = 0;
          this.data = [];
        }
      });
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
    const valueSendDate = new Date(
      Date.UTC(this.bookdate.year, this.bookdate.month - 1, this.bookdate.day)
    ).toISOString();

    this.form.patchValue({
      car_id: this.modelCar?.car_id,
      service_date: valueSendDate,
    });

    console.log(this.form.value);
    this.isLoading = true;
    const Subscr = this.vendorService
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
    this.unsubscribe.push(Subscr);
  }

  async openModalEdit(event: VendorModel) {
    console.log(event);
    this.isCreate = false;
    this.form.patchValue(event);

    return await this.modalComponent.open();
  }

  async openModalCancel(event: VendorModel) {
    const valueSendDate = new Date(
      Date.UTC(this.bookdate.year, this.bookdate.month - 1, this.bookdate.day)
    ).toISOString();

    this.form.patchValue(event);
    this.form.patchValue({
      status: 'Cancel',
    });

    Swal.fire({
      title: 'Are you sure?',
      text: 'You can revert it back by edit service in history!',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#D8A122',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Cancel it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataEdit();
      }
    });
  }

  dataEdit() {
    const valueSendDate = new Date(
      Date.UTC(this.bookdate.year, this.bookdate.month - 1, this.bookdate.day)
    ).toISOString();

    this.form.patchValue({
      car_id: this.modelCar?.car_id,
      service_date: valueSendDate,
    });

    console.log(this.form.value);
    this.isLoading = true;
    const Subscr = this.vendorService
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
    this.unsubscribe.push(Subscr);
  }

  async openModalDelete(event: VendorModel) {
    this.form.patchValue({
      vendor_garage_id: event.vendor_garage_id,
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
    const cashoutSubscr = this.vendorService
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
