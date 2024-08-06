import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, Subscription, finalize, takeUntil } from 'rxjs';
import { CustomerService } from './customer.service';
import {
  Pagination,
  PaginationContext,
  Params,
  defaultPagination,
  defaultParams,
} from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { ModalComponent, ModalConfig } from '@app/_metronic/partials';

import { CustomerModel } from './models/customer.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { AddressModel } from './models/address.model';

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
  public columns!: Columns[];
  public data: any;
  public company: any;
  public business: any;
  public dataLength!: number;
  public toggledRows = new Set<number>();
  public isCreate = false;
  public isCreateAddress = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination: Pagination = { ...defaultPagination };
  public params: Params = { ...defaultParams };
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
  @ViewChild('modal') private modalComponent!: ModalComponent;
  @ViewChild('modalAddress') private modalComponentAddress!: ModalComponent;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.dataList(this.params);
    this.company = this.localService.getCompany();
    this.business = this.localService.getBusiness();

    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.showDetailsArrow = true;
    this.configuration.detailsTemplate = true;

    this.columns = [
      // { key: 'customer_id', title: 'No' },
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
      search: this.pagination.search,
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
    }; // see https://github.com/typicode/json-server
    this.dataList(params);
  }

  private dataList(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.customerService
      .list(params)
      .pipe(takeUntil(this.ngUnsubscribe))
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
