import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { EmployeeService } from './delivery.service';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { ModalComponent, ModalConfig, ModalFullComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { CategoryService } from '@app/pages/master/category/category.service';
import { EmployeeyModel } from '@app/pages/master/employee/models/employee.model';
import { PackageModel } from '../package/models/package.model';
import { PackageService } from '../package/package.service';
import { CarService } from '@app/pages/master/car/car.service';
import { GoSendModel } from '../package/models/gosend';
import { NavigationExtras, Router } from '@angular/router';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
})
export class DeliveryComponent implements OnInit, OnDestroy {
  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public columnsPackage!: Columns[];
  public category: any;
  public city: any;
  public level: any;
  public dataLength!: number;
  public toggledRows = new Set<number>();
  public isCreate = false;

  public data: any;
  public dataSurabaya: any;
  public dataDetail: any;
  public dataDetailPackages: any;
  public dataLengthMalang!: number;
  public dataLengthSurabaya!: number;

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
  @Input() cssClass!: '';
  currentTab = 'Malang';

  public pagination = {
    limit: 10,
    offset: 0,
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
  formSP!: FormGroup;

  isLoading = false;

  get f() {
    return this.form.controls;
  }

  get fsp() {
    return this.formSP.controls;
  }

  modalConfigCreate: ModalConfig = {
    modalTitle: 'Create Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEditSP: ModalConfig = {
    modalTitle: 'Edit Driver',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigDetailSP: ModalConfig = {
    modalTitle: 'Detail List Packages',
    // dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalComponent;
  @ViewChild('modalDetail') private modalComponentDetail!: ModalFullComponent;
  @ViewChild('modalSP') private modalComponentSP!: ModalComponent;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private categoryService: CategoryService,
    private employeeService: EmployeeService,
    private packageService: PackageService,
    private carService: CarService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.dataListGosend(this.params);
    this.city = this.localService.getCity();
    this.level = this.localService.getPosition();

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = false;

    this.columns = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'name', title: 'Driver' },
      { key: 'telp', title: 'Telp' },
      { key: 'description', title: 'Description' },
      { key: 'packages', title: 'Packages' },
      { key: 'car', title: 'Car' },
      { key: 'status', title: 'Status' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsPackage = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'level', title: 'Level' },
      { key: 'sp_package', title: 'SP' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'address', title: 'Address' },
      { key: 'origin_form', title: 'From' },
    ];
  }

  private initForm() {
    this.form = this.formBuilder.group({
      employee_id: [''],
      car_id: [''],
      city_id: [''],
      level_id: [''],
      nik: ['', Validators.compose([Validators.maxLength(50)])],
      name: ['', Validators.compose([Validators.maxLength(255)])],
      telp: ['', Validators.compose([Validators.maxLength(15)])],
      photo: ['', Validators.compose([Validators.maxLength(255)])],
      active: ['', Validators.compose([Validators.maxLength(5)])],
      log: ['', Validators.compose([Validators.maxLength(255)])],
    });

    this.formSP = this.formBuilder.group({
      go_send_id: '',
      employee_id: '',
      car_id: '',
      city_id: '',
      package_id: '',
      telp: '',
      description: '',
      status: '',
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
  }

  eventEmitted($event: { event: string; value: any }): void {
    if ($event.event !== 'onClick') {
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
    this.dataListGosend(params);
  }

  private dataListGosend(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        if (response) {
          const malangData = response.data?.filter((data: PackageModel) => data.city_id === 1);
          const surabayaData = response.data?.filter((data: PackageModel) => data.city_id === 2);

          // sample filter nested objects
          // const courses = [1, 6, 3];
          // const r = response.data.filter(d => d.courses.every(c => courses.includes(c.id)));
          // console.log(r);

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
        }
      });
  }

  async printSP(val: any) {
    // this.router.navigate(['/departure/delivery/printsp', {printsp: JSON.stringify(val)}]);
    const navigationExtras: NavigationExtras = {
      state: {
        data: val,
      },
    };
    this.router.navigate(['/departure/delivery/printsp'], navigationExtras);
    await this.modalComponentDetail.dismiss();
    // window.open('departure/delivery/printsp', '_blank');
  }

  async openModalView(val: GoSendModel) {
    console.log(val);
    console.log(val.packages);
    this.dataDetail = val;
    this.dataDetailPackages = val.packages;
    return await this.modalComponentDetail.open();
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
    const catSubscr = this.employeeService
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

            this.dataListGosend(this.params);
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

  async openModalEdit(event: EmployeeyModel) {
    this.isCreate = false;

    this.form.patchValue({
      employee_id: event.employee_id,
      car_id: Number(event.car_id),
      city_id: Number(event.city_id),
      level_id: Number(event.level_id),
      nik: event.nik,
      name: event.name,
      telp: event.telp,
      photo: event.photo,
      active: event.active,
      log: event.log,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.employeeService
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

            this.dataListGosend(this.params);
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

  async openModalEditSP(event: any) {
    console.log(event);

    this.modelEmployee = event.employee;
    this.modelCar = event.car;

    this.formSP.patchValue({
      go_send_id: event.go_send_id,
      city_id: event.city_id,
      package_id: event.package_id,
      send_time: event.send_time,
      send_date: event.send_date,
      sp_number: event.sp_number,
      sp_package: event.sp_package,
      sp_passenger: event.sp_passenger,
      bsd: event.bsd,
      bsd_passenger: event.bsd_passenger,
      box: event.box,
      bsd_box: event.bsd_box,
      description: event.description,
      status: event.status,
    });

    return await this.modalComponentSP.open();
  }

  dataEditSP() {
    console.log(this.modelEmployee);
    console.log(this.modelCar);

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
        // switchMap((resp: any) => {
        //   console.log('Response from sp:');
        //   console.log(resp);
        //   const gosend: any = {
        //     package_id: resp.data.package_id,
        //     go_send_id: resp.data.go_send_id,
        //     employee_id: resp.data.employee_id,
        //     city_id: resp.data.city_id,
        //     book_date: resp.data.send_date,
        //   };
        //   return this.packageService.patch(gosend);
        // }),
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

            this.dataListGosend(this.params);
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

  formatter = (result: { name: string }) => result.name;

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
      tap(() => (this.searching = false))
    );
}
