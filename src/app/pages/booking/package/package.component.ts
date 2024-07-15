import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import {
  Observable,
  OperatorFunction,
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
import { PackageService } from './package.service';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { ModalComponent, ModalConfig, ModalXlComponent } from '@app/_metronic/partials';

import { PackageModel } from './models/package.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { AddressModel } from '@app/pages/master/customer/models/address.model';
import { CustomerModel } from '@app/pages/master/customer/models/customer.model';
import { CustomerService } from '@app/pages/master/customer/customer.service';
import { CategoryService } from '@app/pages/master/category/category.service';
import { NgbDateStruct, NgbDropdown, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { RecipientModel } from './models/recipient.model';
import { GoSendModel } from './models/gosend';
import { EmployeeService } from '@app/pages/master/employee/employee.service';
import { CarService } from '@app/pages/master/car/car.service';

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
export class PackageComponent implements OnInit {
  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public defaultAddressCustomer: any;
  public defaultAddressRecipient: any;
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
  public statusPackage: any;
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
  public searchingRecipient = false;
  public searchingEmployee = false;
  public searchingCar = false;
  public searchFailed = false;
  public searchFailedRecipient = false;
  public searchFailedEmployee = false;
  public searchFailedCar = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    search: '',
  };
  public params = {
    limit: 10,
    page: 1,
    search: '',
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
    modalTitle: 'Create SP',
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
    private localService: LocalService
  ) {
    this.initForm();

    // Get the current date and time in UTC format
    const currentDate = new Date();
    // Convert the UTC date to a string in the format "YYYY-MM-DDTHH:mm:ssZ"
    const currentDateUTCString = currentDate.toUTCString();
    const globalTimezone = 'Asia/Jakarta';
    const globalDate = new Date(currentDateUTCString).toLocaleString('en-US', {
      timeZone: globalTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    console.log('globalDate ' + globalDate);
    var getDate = new Date(globalDate);
    this.minDate = {
      year: getDate.getFullYear(),
      month: getDate.getMonth() + 1,
      day: getDate.getDate(),
    };

    this.formatDateNow(getDate);
  }

  ngOnInit() {
    this.dataCategory();
    this.dataList(this.params);
    this.company = this.localService.getCompany();
    this.business = this.localService.getBusiness();
    this.request = this.localService.getRequest();
    this.status = this.localService.getStatus();
    this.statusPackage = this.localService.getStatusPackage();
    this.city = this.localService.getCity();

    // this.configuration.resizeColumn = true;
    // this.configuration.fixedColumnWidth = false;
    this.configuration.showDetailsArrow = true;
    this.configuration.detailsTemplate = true;
    this.configuration.horizontalScroll = true;

    this.columns = [
      // { key: 'package_id', title: 'No' },
      { key: 'resi_number', title: 'Number Resi' },
      { key: 'level', title: 'Level' },
      { key: 'book_date', title: 'Book Date' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'recipient.customer_id', title: 'Address' },
      { key: 'cost', title: 'Cost' },
      { key: 'admin', title: 'Admin' },
      { key: '', title: 'Status' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];
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
    this.booktime = { hour: valTime.hour, minute: valTime.minute, second: valTime.second };
    console.log(this.booktime);
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
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
    const params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
    }; // see https://github.com/typicode/json-server
    this.dataList(params);
  }

  private dataList(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .list(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        // count malang or surabaya
        if (response) {
          const malangData = response.data.filter(
            (data: PackageModel) =>
              data.city_id === 1 &&
              data.status_package !== 'Move' &&
              data.status_package !== 'Cancel' &&
              data.status_package !== 'Complete'
          );
          const surabayaData = response.data.filter(
            (data: PackageModel) =>
              data.city_id === 2 &&
              data.status_package !== 'Move' &&
              data.status_package !== 'Cancel' &&
              data.status_package !== 'Complete'
          );
          const moveData = response.data.filter((data: PackageModel) => data.status_package === 'Move');
          const cancelData = response.data.filter((data: PackageModel) => data.status_package === 'Cancel');
          const historyData = response.data.filter((data: PackageModel) => data.status_package === 'Complete');

          this.dataLengthMalang = malangData.length;
          this.dataLengthSurabaya = surabayaData.length;
          this.dataLengthMove = moveData.length;
          this.dataLengthCancel = cancelData.length;
          this.dataLengthHistory = historyData.length;

          this.data = malangData;
          this.dataSurabaya = surabayaData;
          this.dataMove = moveData;
          this.dataCancel = cancelData;
          this.dataHistory = historyData;

          // set gosend empty or not
          const createSP = response.data;
          createSP.forEach((val: any) => {
            if (val.go_send_id != null) {
              return (val.isCreateSP = false);
            } else {
              return (val.isCreateSP = true);
            }
          });
          console.log(createSP);

          // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
          this.pagination.count =
            this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.cdr.detectChanges();
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
          })
          .pipe(
            tap(() => (this.searchFailedEmployee = false)),
            map((response: any) => {
              if (response) {
                const kurir = response.data.filter((val: any) => val.level_id === 5);
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
      tap(() => ((this.searching = false), (this.modelAddressId = '')))
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
          })
          .pipe(
            tap(() => (this.searchFailed = false)),
            map((response: any) => {
              if (response) {
                tap(() => (this.searching = false));
                return response.data.filter((val: any) => val.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
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
          })
          .pipe(
            tap(() => (this.searchFailedRecipient = false)),
            map((response: any) => {
              if (response) {
                tap(() => (this.searchingRecipient = false));
                return response.data.filter((val: any) => val.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
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

  setDefaultSelectionRecipient(value: any) {
    this.modelRecipient?.addresses.forEach((item: AddressModel) => {
      console.log(item.address_id);
      console.log(value);
      item.default = item.address_id === Number(value);
    });
    console.log(this.modelRecipient?.addresses);
  }

  findDataRecipientByValue(value: any) {
    return this.modelRecipient?.addresses.find((val: AddressModel) => val.address_id === Number(value));
  }

  selectAddressRecipient() {
    this.setDefaultSelectionRecipient(this.modelAddressIdRecipient);
    const getdAddress = this.findDataRecipientByValue(this.modelAddressIdRecipient);
    this.selectedAddressRecipient = getdAddress;
    console.log(this.selectedAddressRecipient);

    if (this.selectedAddressRecipient) {
      console.log('prosess update address recipient');
      const dataAddress = {
        address_id: this.selectedAddressRecipient.address_id,
        customer_id: this.selectedAddressRecipient.customer_id,
        default: this.selectedAddressRecipient.default,
      };
      console.log(this.formAddress.value);

      this.isLoading = true;
      this.packageService
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

  formatter = (result: { name: string }) => result.name;

  async generateSP(event: PackageModel) {
    console.log(event);

    return await this.modalComponentSP.open();
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
      category_id: '',
      request: '',
      status: '',
      status_package: '',
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
      customer_id: this.modelRecipient?.customer_id,
    };
    console.log(dataReceipt);

    // send data to sender, recipient, package
    this.isLoading = true;
    this.packageService
      .senderRecipient(dataCustomert)
      .pipe(
        switchMap((respCustomer: any) => {
          console.log('Response from respCustomer:', respCustomer);
          this.form.patchValue({
            sender_id: respCustomer.data.sender_id,
          });
          return this.packageService.createRecipient(dataReceipt);
        }),
        switchMap((respRecipient: any) => {
          console.log('Response from respRecipient:');
          console.log(respRecipient);
          this.form.patchValue({
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

  async openModalEdit(event: PackageModel) {
    console.log(event);
    this.isCreate = false;

    if (event.request || event.request_description) {
      this.isRequest = true;
    } else {
      this.isRequest = false;
    }

    const getDate = new Date(event?.book_date);
    this.formatDateNow(getDate);

    const valueBookDate = new Date(
      Date.UTC(
        this.bookdate.year,
        this.bookdate.month + 1,
        this.bookdate.day,
        this.booktime ? this.booktime.hour : 0,
        this.booktime ? this.booktime.minute : 0
      )
    ).toISOString();
    console.log(valueBookDate);

    this.modelCustomer = event.sender?.customer;
    const getdAddressCustomer = this.modelCustomer?.addresses.find(
      (val: AddressModel) => val.customer_id === Number(this.modelCustomer?.customer_id)
    );
    this.modelAddressId = getdAddressCustomer?.address_id;
    console.log(this.modelAddressId);

    this.modelRecipient = event.recipient?.customer;
    const getdAddressRecipient = this.modelRecipient?.addresses.find(
      (val: AddressModel) => val.customer_id === Number(this.modelRecipient?.customer_id)
    );
    this.modelAddressIdRecipient = getdAddressRecipient?.address_id;
    console.log(this.modelAddressIdRecipient);

    console.log(this.modelCustomer);
    console.log(this.modelRecipient);

    this.form.patchValue({
      package_id: event.package_id,
      sender_id: event.sender_id ? event.sender_id : this.modelCustomer?.customer_id,
      recipient_id: event.recipient_id ? event.recipient_id : this.modelRecipient?.customer_id,
      city_id: event.city_id,
      employee_id: event.employee_id,
      category_id: event.category_id ? event.category_id : '',
      go_send_id: event.go_send_id,
      description: event.description,
      cost: event.cost,
      discount: event.discount,
      payment: event.payment,
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
      book_date: event.book_date ? event.book_date : valueBookDate,
      send_date: event.send_date,
      check_payment: event.check_payment,
      check_sp: event.check_sp,
      check_date_sp: event.check_date_sp,
      taking_time: event.taking_time,
      taking_by: event.taking_by,
      taking_status: event.taking_status,
      office: event.office,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    this.form.patchValue({
      sender_id: this.modelCustomer?.customer_id,
      recipient_id: this.modelRecipient?.customer_id,
    });

    const dataCustomert: any = {
      customer_id: this.modelCustomer?.customer_id,
    };
    console.log(dataCustomert);

    const dataReceipt: any = {
      customer_id: this.modelRecipient?.customer_id,
    };
    console.log(dataReceipt);

    // send data to sender, recipient, package
    this.isLoading = true;
    this.packageService
      .senderRecipient(dataCustomert)
      .pipe(
        switchMap((respCustomer: any) => {
          console.log('Response from respCustomer:', respCustomer);
          this.form.patchValue({
            sender_id: respCustomer.data.sender_id,
          });
          return this.packageService.createRecipient(dataReceipt);
        }),
        switchMap((respRecipient: any) => {
          console.log('Response from respRecipient:');
          console.log(respRecipient);
          this.form.patchValue({
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

  async openModalNewSP(event: PackageModel) {
    console.log(event);
    // this.isCreateSP = true;
    this.isCreateSP = event.isCreateSP;
    console.log(this.isCreateSP);

    this.clearFormSP();

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
      employee_id: this.modelEmployee?.employee_id,
      car_id: this.modelCar?.car_id,
      city_id: city,
      send_date: event.book_date,
      telp: this.modelEmployee?.telp,
      sp_package: formatSP,
    });

    return await this.modalComponentSP.open();
  }

  dataCreateSP() {
    console.log(this.isCreateSP);
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
            package_id: resp.data?.package_id,
            go_send_id: resp.data?.go_send_id,
          });
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

  async openModalEditSP(event: GoSendModel) {
    console.log(event);
    // this.isCreateSP = false;
    this.isCreateSP = event.isCreateSP;
    console.log(this.isCreateSP);

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
      go_send_id: event.go_send.go_send_id,
      employee_id: this.modelEmployee?.employee_id,
      car_id: this.modelCar?.car_id,
      city_id: city,
      package_id: event.go_send.package_id,
      telp: this.modelEmployee?.telp,
      send_time: event.go_send.send_time,
      send_date: event.go_send.send_date,
      sp_number: event.go_send.sp_number,
      sp_package: formatSP,
      sp_passenger: event.go_send.sp_passenger,
      bsd: event.go_send.bsd,
      bsd_passenger: event.go_send.bsd_passenger,
      box: event.go_send.box,
      bsd_box: event.go_send.bsd_box,
    });

    return await this.modalComponentSP.open();
  }

  dataEditSP() {
    console.log(this.modelEmployee);
    console.log(this.modelCar);
    console.log(this.isCreateSP);
    console.log(this.formSP.value);
    // send data to gosend, package
    this.isLoading = true;
    this.packageService
      .editSP(this.formSP.value)
      .pipe(
        switchMap((resp: any) => {
          console.log('Response from sp:');
          console.log(resp);
          this.form.patchValue({
            go_send_id: resp.data.go_send_id,
          });
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
