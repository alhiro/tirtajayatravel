import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, Subscription, finalize, takeUntil } from 'rxjs';
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
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

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
  public otherAddressRecipient: any;
  public data: any;
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
  public toggledRows = new Set<number>();
  public isCreate = false;
  public isCreateAddress = false;
  public isRequest!: boolean;

  public configuration: Config = { ...DefaultConfig };

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
  };
  public params = {
    limit: 10,
    page: 1,
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;
  formAddress!: FormGroup;
  isLoading = false;
  get f() {
    return this.form.controls;
  }
  get fa() {
    return this.formAddress.controls;
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
    modalTitle: 'Create Address',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalXlComponent;
  @ViewChild('modalAddress') private modalComponentAddress!: ModalComponent;

  @Input() cssClass!: '';
  currentTab = 'Malang';

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private PackageService: PackageService,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService
  ) {
    this.initForm();
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
      longitude: ['', Validators.compose([Validators.maxLength(100)])],
      latitude: ['', Validators.compose([Validators.maxLength(100)])],
      zoom: ['', Validators.compose([Validators.maxLength(5)])],
      description: ['', Validators.compose([Validators.maxLength(255)])],
      used: ['', Validators.compose([Validators.maxLength(255)])],
    });
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
    }; // see https://github.com/typicode/json-server
    this.dataList(params);
  }

  private dataList(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.PackageService.list(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        // count malang or surabaya
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

        // check other address
        if (this.data.recipient?.customer?.addresses.length > 0) {
          this.otherAddressRecipient = this.data.recipient.customer.addresses.find(
            (val: AddressModel) => val.default === true
          );
        }

        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
        this.pagination.count =
          this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
        this.pagination = { ...this.pagination };
        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  generateSP(event: PackageModel) {
    console.log(event);
  }

  clearForm() {
    this.form.reset();
  }

  async openModalNew() {
    this.isCreate = true;
    this.isRequest = false;
    this.clearForm();

    let city: any = '';
    if (this.currentTab === 'Malang') {
      city = 1;
    } else if (this.currentTab === 'Surabaya') {
      city = 2;
    }

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
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.PackageService.create(this.form.value)
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

  async openModalEdit(event: PackageModel) {
    this.isCreate = false;

    if (event.request || event.request_description) {
      this.isRequest = true;
    } else {
      this.isRequest = false;
    }

    this.form.patchValue({
      package_id: event.package_id,
      sender_id: event.sender_id,
      recipient_id: event.recipient_id,
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

    return await this.modalComponent.open();
  }

  dataEdit() {
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.PackageService.edit(this.form.value)
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
  clearFormAddress() {
    this.formAddress.reset();
  }

  async openModalNewAddress(event: CustomerModel) {
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
      .createAddress(this.form.value)
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
      .editAddress(this.form.value)
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
}
