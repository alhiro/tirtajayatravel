import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
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
} from 'rxjs';
import { CustomerService } from './customer.service';
import {
  Dates,
  Pagination,
  PaginationContext,
  Params,
  defaultPagination,
  defaultParams,
} from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { ModalComponent, ModalFullComponent, ModalConfig } from '@app/_metronic/partials';

import { CustomerModel, CustomerContext, CustomerIdContext } from './models/customer.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { AddressModel } from './models/address.model';
import Swal from 'sweetalert2';
import { Utils } from '@app/@shared';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnInit {
  @ViewChild('table') table!: APIDefinition;
  @ViewChild('tableAddress') tableAddress!: APIDefinition;

  public columns!: Columns[];
  public columnsAddress!: Columns[];

  public data: any;
  public dataLength!: number;
  public dataAddress: any;
  public dataLengthAddress!: number;
  public dataSelectedCustomer: any;

  public modelCustomer: any;

  public company: any;
  public business: any;

  public toggledRows = new Set<number>();
  public isCreate = false;
  public isCreateAddress = false;
  public isDetails = false;

  public configuration: Config = { ...DefaultConfig };
  public configurationAddress: Config = { ...DefaultConfig };

  public pagination: Pagination = { ...defaultPagination };
  public params: Params = { ...defaultParams };

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;
  formAddress!: FormGroup;
  isLoading = false;
  termCustomer!: string;

  get f() {
    return this.form.controls;
  }
  get fa() {
    return this.formAddress.controls;
  }

  calendar = inject(NgbCalendar);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 0);

  startDate: any;
  endDate: any;
  public inputCustomer: any = '';

  modalConfigCreate: ModalConfig = {
    modalTitle: 'Create Customer',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Customer',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigCreateAddress: ModalConfig = {
    modalTitle: 'Create Address',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEditAddress: ModalConfig = {
    modalTitle: 'Create Address',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigListAddress: ModalConfig = {
    modalTitle: 'List Customer Address',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  addClass = 'modal-clean';
  @ViewChild('modal') private modalComponent!: ModalComponent;
  @ViewChild('modalAddress') private modalComponentAddress!: ModalComponent;
  @ViewChild('modalListAddress') private modalComponentListAddress!: ModalFullComponent;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService,
    private utils: Utils
  ) {
    this.initForm();
  }

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      datepicker.close(); // Close datepicker popup

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

  printFilterDate(datepicker: any) {
    const params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.inputCustomer,
      startDate: this.startDate,
      endDate: this.endDate,
    };
    console.log(params);
    this.dataExport(params);
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
    this.dataList(this.params);
    this.company = this.localService.getCompany();
    this.business = this.localService.getBusiness();

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = false;
    this.configuration.tableLayout.hover = true;
    this.configuration.orderEnabled = false;
    this.configuration.horizontalScroll = false;

    this.configurationAddress.resizeColumn = false;
    this.configurationAddress.fixedColumnWidth = true;
    this.configurationAddress.orderEnabled = false;
    this.configurationAddress.paginationEnabled = false;
    this.configurationAddress.horizontalScroll = false;
    this.configurationAddress.rows = 100000;

    this.columns = [
      // { key: 'customer_id', title: 'No' },
      { key: '', title: '' },
      { key: 'name', title: 'Name' },
      { key: 'telp', title: 'Telp' },
      { key: 'address', title: 'Address' },
      { key: 'created_by', title: 'Created  By' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsAddress = [
      { key: 'name', title: 'Name' },
      { key: 'telp', title: 'Telp' },
      { key: 'address', title: 'Address' },
      { key: 'created_by', title: 'Created  By' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];
  }

  private initForm() {
    this.form = this.formBuilder.group({
      customer_id: [''],
      business_id: [''],
      company_id: [''],
      name: ['', Validators.compose([Validators.maxLength(100)])],
      telp: ['', Validators.compose([Validators.maxLength(255)])],
      admin: ['', Validators.compose([Validators.maxLength(100)])],
      address: ['', Validators.compose([Validators.maxLength(255)])],
      status: ['', Validators.compose([Validators.maxLength(10)])],
    });

    this.formAddress = this.formBuilder.group({
      address_id: [''],
      customer_id: ['', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.maxLength(100)])],
      address: ['', Validators.compose([Validators.maxLength(255)])],
      telp: ['', Validators.compose([Validators.maxLength(255)])],
      default: [''],
      longitude: ['', Validators.compose([Validators.maxLength(100)])],
      latitude: ['', Validators.compose([Validators.maxLength(100)])],
      zoom: ['', Validators.compose([Validators.maxLength(5)])],
      description: ['', Validators.compose([Validators.maxLength(255)])],
      used: ['', Validators.compose([Validators.maxLength(255)])],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async onChangeAddress(event: Event, customer: CustomerModel): Promise<void> {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
    console.log(customer);

    this.dataListAddress({ customer_id: customer.customer_id });

    this.tableAddress.apiEvent({
      type: API.onGlobalSearch,
      value: value,
    });

    const dataAddress =
      value === ''
        ? this.dataAddress
        : this.dataAddress.filter(
            (val: any) =>
              val.name?.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
              val.telp?.toLowerCase().indexOf(value.toLowerCase()) > -1
          );

    console.log(dataAddress);
    this.dataAddress = dataAddress;
    this.dataLengthAddress = dataAddress.length;
  }

  // onChange(event: Event): void {
  //   console.log(event);

  //   const textSearch = (event.target as HTMLInputElement).value;

  //   this.pagination.count = Math.ceil(this.dataLength / this.pagination.limit);
  //   const params = {
  //     limit: this.pagination.limit,
  //     page: this.pagination.offset,
  //     search: textSearch,
  //     startDate: this.pagination.startDate,
  //     endDate: this.pagination.endDate,
  //   };
  //   this.dataList(params);
  // }

  searchDataCustomer: any = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
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
            map((response: any) => {
              if (response) {
                console.log(this.modelCustomer);
                this.inputCustomer = term;

                const params = {
                  limit: this.pagination.limit,
                  page: this.pagination.offset,
                  search: this.inputCustomer,
                  startDate: this.pagination.startDate,
                  endDate: this.pagination.endDate,
                };
                this.dataList(params);
              }
            }),
            catchError((err) => {
              console.log(err);
              // this.handlerResponseService.failedResponse(err);
              return of([]);
            })
          )
      )
    );

  eventEmitted($event: { event: any; value: any }): void {
    console.log('click table event');
    console.log($event.event);
    console.log($event.value);
    if ($event.event === 'onPagination') {
      this.parseEvent($event);
    }
  }

  private parseEvent(obj: EventObject): void {
    console.log(this.modelCustomer);

    this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    this.pagination = { ...this.pagination };
    const params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search:
        this.modelCustomer === '' || this.modelCustomer === undefined ? this.pagination.search : this.modelCustomer,
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
    }; // see https://github.com/typicode/json-server
    this.dataList(params);
  }

  private dataList(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.customerService
      .list(params)
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        this.dataLength = response.length;
        this.data = response.data;
        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
        this.pagination.count = response.length;
        this.pagination = { ...this.pagination };
        console.log(this.pagination);

        this.configuration.isLoading = false;
        this.configuration.horizontalScroll = true;
        this.cdr.detectChanges();
      });
  }

  private dataListAddress(params: CustomerIdContext): any {
    this.configurationAddress.isLoading = true;
    this.customerService
      .get(params)
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        this.dataAddress = response.data.addresses;
        this.dataLengthAddress = this.dataAddress.length;

        this.configurationAddress.isLoading = false;
        this.configurationAddress.horizontalScroll = true;
        this.cdr.detectChanges();
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
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.customerService
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
    this.unsubscribe.push(catSubscr);
  }

  async openModalEdit(event: CustomerModel) {
    this.isCreate = false;

    this.form.patchValue({
      customer_id: event.customer_id,
      business_id: event.business_id,
      company_id: event.company_id,
      name: event.name,
      telp: event.telp,
      admin: event.admin,
      address: event.address,
      status: event.status,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.customerService
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
    this.unsubscribe.push(catSubscr);
  }

  // Address
  async openModalListAddress(event: CustomerModel) {
    console.log(event);
    this.dataSelectedCustomer = event;

    const id: CustomerIdContext = { customer_id: event.customer_id };
    this.dataListAddress(id);

    return await this.modalComponentListAddress.open();
  }

  clearFormAddress() {
    this.formAddress.reset();
  }

  async openModalNewAddress(event: CustomerModel) {
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
          console.log(resp);
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataListAddress({ customer_id: resp?.data?.customer_id });
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
    this.isCreate = false;

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
          console.log(resp);
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataListAddress({ customer_id: resp?.data?.customer_id });
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

  async openModalDeleteAddress(event: AddressModel) {
    this.formAddress.patchValue(event);

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
        this.dataAddressDelete();
      }
    });
  }

  dataAddressDelete() {
    console.log(this.formAddress.value);
    this.isLoading = true;
    const addressSubscr = this.customerService
      .deleteAddress(this.formAddress.value)
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
              duration: 5000,
            });

            this.dataList(this.params);
            await this.modalComponentListAddress.dismiss();
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
    this.unsubscribe.push(addressSubscr);
  }

  dataExport(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.customerService
      .customerExport(params)
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        console.log(response);
        this.configuration.isLoading = false;
        this.utils.downloadExcel(response);
        this.dataList(params);
      });
  }
}
