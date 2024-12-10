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
  forkJoin,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { DeliveryService } from '../../booking/delivery/delivery.service';
import { ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { ModalComponent, ModalConfig, ModalFullComponent } from '@app/_metronic/partials';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { LocalService } from '@app/services/local.service';
import { PackageService } from '../../booking/package/package.service';
import { GoSendModel } from '../../booking/package/models/gosend';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Utils } from '@app/@shared';
import { BsdService } from './bsd.service';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { PassengerService } from '@app/pages/booking/passenger/passenger.service';
import { PassengerModel } from '@app/pages/booking/passenger/models/passenger.model';
import { DatePipe } from '@angular/common';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-bsd',
  templateUrl: './bsd.component.html',
  styleUrls: ['./bsd.component.scss'],
  providers: [DatePipe],
})
export class BsdComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public username!: string;
  public city_id!: number;

  public dataMalangPackage: any;
  public dataSurabayaPackage: any;
  public dataMalangPassenger: any;
  public dataSurabayaPassenger: any;
  public type: any;
  public dataGosend: any;

  @ViewChild('table') table!: APIDefinition;
  public columnsList!: Columns[];
  public columnsDone!: Columns[];
  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public city: any;
  public level: any;
  public toggledRows = new Set<number>();

  public data: any;
  public dataLength: any;

  public modelEmployee: any;
  public modelCar: any;
  public modelDriver: any;

  public searchFailed = false;
  public searchingEmployee = false;
  public searchFailedEmployee = false;

  public isPayment!: boolean;
  public isSp!: boolean;
  public isPaymentPassenger!: boolean;
  public isSpPassenger!: boolean;

  public totalTariffPassenger: any;
  public totalPassenger: any;

  public configuration: Config = { ...DefaultConfig };
  public configurationGroup: Config = { ...DefaultConfig };

  @Input() cssClass!: '';
  currentTab = 'Done';
  currentDisplay: boolean = false;
  currentTabModal = 'Cost';
  currentDisplayModal: boolean = false;

  public pagination = {
    limit: 20,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };
  public params = {
    limit: 20,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
    status: 'Done',
    city: '',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  formSP!: FormGroup;
  formPackage!: FormGroup;
  formPassenger!: FormGroup;
  formCost!: FormGroup;

  isLoading = false;

  public selected = new Set();
  public groupCheckedBsdList: any[] = [];
  public groupCheckedPackages: any[] = [];
  public groupCheckedPassengers: any[] = [];
  public groupCheckedPackagesEdit: any[] = [];
  public groupCheckedPassengersEdit: any[] = [];

  get fsp() {
    return this.formSP.controls;
  }

  minDate: any;
  bookdate!: NgbDateStruct;
  booktime: NgbTimeStruct = { hour: 0, minute: 0, second: 0 };

  modalConfigEditSP: ModalConfig = {
    modalTitle: 'Add BSD',
    // dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEditBsd: ModalConfig = {
    modalTitle: 'Edit BSD Driver',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  modalConfigEditBsdGroup: ModalConfig = {
    modalTitle: 'Add BSD Driver',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  addClass = 'modal-clean';
  @ViewChild('modalSP') private modalComponentSP!: ModalFullComponent;
  @ViewChild('modalBSD') private modalComponentBSD!: ModalFullComponent;
  @ViewChild('modalBSDGroup') private modalComponentBSDGroup!: ModalFullComponent;

  dataDelivery!: GoSendModel;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private deliveryService: DeliveryService,
    private packageService: PackageService,
    private passengerService: PassengerService,
    private bsdService: BsdService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private localService: LocalService,
    private utils: Utils,
    private datePipe: DatePipe
  ) {
    this.initForm();

    this.levelrule = this.utils.getLevel();
    this.city_id = this.utils.getCity();
    this.username = this.utils.getUsername();
    if (this.levelrule === 2 && this.city_id === 2) {
      this.currentTab = 'Done';
    } else if (this.levelrule === 2 && this.city_id === 1) {
      this.currentTab = 'List';
    }
  }

  ngOnInit() {
    this.dataListBSD(this.params);
    this.city = this.localService.getCity();
    this.level = this.localService.getPosition();

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

    this.configurationGroup.resizeColumn = false;
    this.configurationGroup.fixedColumnWidth = true;
    this.configurationGroup.horizontalScroll = false;
    this.configurationGroup.orderEnabled = false;
    this.configurationGroup.paginationEnabled = false;

    this.columnsDone = [
      // { key: 'go_send_id', title: 'No' },
      { key: 'employee_id', title: 'Driver' },
      { key: 'bsd_date', title: 'BSD Date' },
      { key: 'bsd', title: 'BSD Package' },
      { key: 'bsd_passenger', title: 'BSD Passenger' },
      { key: 'bsd_box', title: 'BSD Box' },
      // { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsList = [
      // { key: 'go_send_id', title: 'No' },
      { key: 'sp_passenger', title: 'SP Passenger' },
      { key: 'sp_package', title: 'SP Package' },
      { key: 'employee_id', title: 'Driver' },
      { key: 'send_date', title: 'Send Date' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsPackage = [
      // { key: 'package_id', title: 'No' },
      { key: 'resi_number', title: 'Number Resi' },
      { key: 'cost', title: 'Cost' },
      { key: 'discount', title: 'Disc.' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'origin_from', title: 'Status Package' },
      { key: 'status', title: 'Status Payment' },
      { key: 'check_payment', title: 'Check' },
      { key: 'cost', title: 'Deposit' },
      { key: 'check_sp', title: 'Check' },
      { key: 'agent_commission', title: 'Commission Driver' },
    ];

    this.columnsPassenger = [
      // { key: 'passenger_id', title: 'No' },
      { key: 'resi_number', title: 'Number Resi' },
      { key: 'tariff', title: 'Tariff' },
      { key: 'discount', title: 'Disc.' },
      { key: 'status', title: 'Status Passenger' },
      { key: 'payment', title: 'Status Payment' },
      { key: 'check_payment', title: 'Check' },
      { key: 'tariff', title: 'Deposit' },
      { key: 'check_sp', title: 'Check' },
      { key: 'agent_commission', title: 'Commission Driver' },
    ];
  }

  private initForm() {
    this.formSP = this.formBuilder.group({
      go_send_id: '',
      employee_id: '',
      car_id: '',
      city_id: '',
      package_id: '',
      cost_id: '',
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
      bsd_date: '',
      box: '',
      bsd_box: '',
      car: [{ value: '', disabled: true }],
      car_no: [{ value: '', disabled: true }],
      send_date_city1: [{ value: '', disabled: true }],
      send_date_city2: [{ value: '', disabled: true }],
    });

    this.formPackage = this.formBuilder.group({
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
      agent_commission: [0],
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

    this.formPassenger = this.formBuilder.group({
      passenger_id: [''],
      waybill_id: [''],
      destination_id: [''],
      city_id: [''],
      employee_id: [''],
      go_send_id: [''],
      tariff: [''],
      discount: [0],
      agent_commission: [0],
      other_fee: [0],
      book_date: [''],
      total_passenger: [''],
      payment: [''],
      status: [''],
      status_passenger: [''],
      note: [''],
      description: [''],
      resi_number: [''],
      cancel: [''],
      move: [''],
      position: [''],
      charter: [''],
      check_payment: [''],
      check_sp: [''],
      check_date_sp: [''],
    });

    this.formCost = this.formBuilder.group({
      cost_id: [''],
      car_id: [''],
      go_send_id: [''],
      parking_package: [0],
      parking_passenger: [0],
      bbm: [0],
      bbm_cost: [0],
      toll_in: [0],
      toll_out: [0],
      overnight: [0],
      extra: [0],
      others: [0],
      mandatory_deposit: [0],
      driver_deposit: [0],
      voluntary_deposit: [0],
      current_km: [0],
      old_km: [0],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
    console.log(this.currentTab);

    if (this.currentTab === 'Done') {
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
        status: 'Done',
        city: '',
      };
      this.dataListBSD(this.params);
    } else if (this.currentTab === 'List') {
      this.params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.pagination.startDate,
        endDate: this.pagination.endDate,
        status: 'List',
        city: '',
      };
      this.dataListBSD(this.params);
    }
  }

  setCurrentDisplay() {
    this.currentDisplay = !this.currentDisplay;
  }

  setCurrentTabModal(tab: string) {
    this.currentTabModal = tab;
  }

  setCurrentDisplayModal() {
    this.currentDisplayModal = !this.currentDisplay;
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
      status: this.currentTab,
    }; // see https://github.com/typicode/json-server
    this.dataListBSD(params);
  }

  private dataListBSD(params: ExtendedPaginationContext): void {
    console.log(params);
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError((err) => {
          this.configuration.isLoading = false;
          this.handlerResponseService.failedResponse(err);
          return of([]);
        })
      )
      .subscribe((response: any) => {
        // const combinedData: any = [];

        // response.data.forEach((item: any) => {
        //   // Check if there's an existing item in the combined array with the same bsd
        //   const existing = combinedData.find(
        //     (combinedItem: any) => combinedItem.bsd === item.bsd || combinedItem.bsd_passenger === item.bsd_passenger
        //   );

        //   if (existing) {
        //     //If exists, merge the packages and passengers
        //     existing.packages = [...existing.packages, ...item.packages];
        //     existing.passengers = [...existing.passengers, ...item.passengers];
        //   } else {
        //     // If not exists, add a new item
        //     combinedData.push({
        //       ...item,
        //       packages: [...item.packages],
        //       passengers: [...item.passengers],
        //     });
        //   }
        // });

        this.dataLength = response.length;
        this.data = response.data;

        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
        this.pagination.count = response.length;
        this.pagination = { ...this.pagination };

        this.configuration.isLoading = false;

        response?.length > 0
          ? (this.configuration.horizontalScroll = true)
          : (this.configuration.horizontalScroll = false);
        this.cdr.detectChanges();
      });
  }

  onDateChange(date: NgbDateStruct): void {
    this.bookdate = date;
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

  // BSD
  async openModalEditSP(event: GoSendModel) {
    console.log(event);

    this.modelEmployee = event?.employee;
    this.modelCar = event?.car;

    this.formSP.patchValue({
      go_send_id: event.go_send_id,
      employee_id: event.employee_id,
      car_id: event.car_id,
      city_id: event.city_id,
      package_id: event.package_id,
      cost_id: event.cost_id,
      send_time: event.send_time,
      send_date: event.send_date,
      sp_number: event.sp_number,
      sp_package: event.sp_package,
      sp_passenger: event.sp_passenger,
      bsd: event.bsd,
      bsd_passenger: event.bsd_passenger,
      bsd_date: new Date(),
      box: event.box,
      bsd_box: event.bsd_box,
      description: event.description,
      status: event.status,
    });

    return await this.modalComponentSP.open();
  }

  dataEditSP() {
    console.log(this.formSP.value);

    // send data to gosend
    this.isLoading = true;
    this.packageService
      .editSP(this.formSP.value)
      .pipe(
        finalize(() => {
          this.formSP.markAsPristine();
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

            this.dataListBSD(this.params);
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

  searchDataEmployee = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => (this.searchingEmployee = true)),
      switchMap((term) =>
        this.deliveryService
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
                // let city: any;
                // if (this.currentTab === 'Malang') {
                //   city = 1;
                // } else if (this.currentTab === 'Surabaya') {
                //   city = 2;
                // }

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

  formatter = (result: { name: string; car_number: string }) => result.car_number;

  checkPaymentEditMalang() {}

  checkSpEditMalang() {}

  checkPaymentEditSurabaya() {}

  checkSpEditSurabaya() {}

  checkPaymentEdit(item: PackageModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_payment = target.checked;

    const formPackage = {
      package_id: item.package_id,
      check_sp: item.check_sp,
      check_date_sp: item.check_date_sp,
      check_payment: item.check_payment,
    };
    this.groupCheckedPackagesEdit = this.groupCheckedPackagesEdit.filter((pkg) => pkg.package_id !== item.package_id);
    this.groupCheckedPackagesEdit.push(formPackage);
    console.log(this.groupCheckedPackagesEdit);
  }

  checkPayment(item: PackageModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_payment = target.checked;

    this.formPackage.patchValue(item);
    console.log(this.formPackage.value);

    if (item.check_payment) {
      const dataPackages = this.groupCheckedBsdList.map((item) => item?.packages).flat();
      dataPackages.map((val) => {
        if (val.package_id === item.package_id) {
          return {
            ...item,
            check_payment: true,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPackages = dataPackages;
      console.log(this.groupCheckedPackages);
    } else {
      const dataPackages = this.groupCheckedBsdList.map((item) => item?.packages).flat();
      dataPackages.map((val) => {
        if (val.package_id === item.package_id) {
          return {
            ...item,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPackages = dataPackages;
      console.log(this.groupCheckedPackages);
    }
  }

  checkSpEdit(item: PackageModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_sp = target.checked;

    const formPackage = {
      package_id: item.package_id,
      check_sp: item.check_sp,
      check_date_sp: item.check_date_sp,
      check_payment: item.check_payment,
    };
    this.groupCheckedPackagesEdit = this.groupCheckedPackagesEdit.filter((pkg) => pkg.package_id !== item.package_id);
    this.groupCheckedPackagesEdit.push(formPackage);
    console.log(this.groupCheckedPackagesEdit);
  }

  checkSp(item: PackageModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_sp = target.checked;

    this.formPackage.patchValue(item);
    console.log(this.formPackage.value);

    if (item.check_sp) {
      // ;item.agent_commission = item.cost * 0.15

      const dataPackages = this.groupCheckedBsdList.map((item) => item?.packages).flat();
      dataPackages.map((val) => {
        if (val.package_id === item.package_id) {
          return {
            ...item,
            check_sp: true,
            // agent_commission: item.cost * 0.15,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPackages = dataPackages;
      console.log(this.groupCheckedPackages);
    } else {
      // item.agent_commission = 0;

      const dataPackages = this.groupCheckedBsdList.map((item) => item?.packages).flat();
      dataPackages.map((val) => {
        if (val.package_id === item.package_id) {
          return {
            ...item,
            // agent_commission: 0,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPackages = dataPackages;
      console.log(this.groupCheckedPackages);
    }
  }

  checkPaymentPassengerEdit(item: PassengerModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_payment = target.checked;

    const formPassenger = {
      passenger_id: item.passenger_id,
      check_sp: item.check_sp,
      check_date_sp: item.check_date_sp,
      check_payment: item.check_payment,
    };
    this.groupCheckedPassengersEdit = this.groupCheckedPassengersEdit.filter(
      (pkg) => pkg.passenger_id !== item.passenger_id
    );
    this.groupCheckedPassengersEdit.push(formPassenger);
    console.log(this.groupCheckedPassengersEdit);
  }

  checkPaymentPassenger(item: PassengerModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_payment = target.checked;

    this.formPassenger.patchValue(item);
    console.log(this.formPassenger.value);

    if (item.check_payment) {
      const dataPassengers = this.groupCheckedBsdList.map((item) => item?.passengers).flat();
      dataPassengers.map((val) => {
        if (val.passenger_id === item.passenger_id) {
          return {
            ...item,
            check_payment: true,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPassengers = dataPassengers;
      console.log(this.groupCheckedPassengers);
    } else {
      const dataPassengers = this.groupCheckedBsdList.map((item) => item?.passengers).flat();
      dataPassengers.map((val) => {
        if (val.passenger_id === item.passenger_id) {
          return {
            ...item,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPassengers = dataPassengers;
      console.log(this.groupCheckedPassengers);
    }
  }

  checkSpPassengerEdit(item: PassengerModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_sp = target.checked;

    const formPassenger = {
      passenger_id: item.passenger_id,
      check_sp: item.check_sp,
      check_date_sp: item.check_date_sp,
      check_payment: item.check_payment,
    };
    this.groupCheckedPassengersEdit = this.groupCheckedPassengersEdit.filter(
      (pkg) => pkg.passenger_id !== item.passenger_id
    );
    this.groupCheckedPassengersEdit.push(formPassenger);
    console.log(this.groupCheckedPassengersEdit);
  }

  checkSpPassenger(item: PassengerModel, event: Event) {
    const target = event.target as HTMLInputElement;
    item.check_sp = target.checked;

    this.formPassenger.patchValue(item);
    console.log(this.formPassenger.value);

    if (item.check_sp) {
      // item.agent_commission = item.tariff * 0.15;

      const dataPassengers = this.groupCheckedBsdList.map((item) => item?.passengers).flat();
      dataPassengers.map((val) => {
        if (val.passenger_id === item.passenger_id) {
          return {
            ...item,
            check_sp: true,
            /// agent_commission: item.tariff * 0.15,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPassengers = dataPassengers;
      console.log(this.groupCheckedPassengers);
    } else {
      // item.agent_commission = 0;

      const dataPassengers = this.groupCheckedBsdList.map((item) => item?.passengers).flat();
      dataPassengers.map((val) => {
        if (val.passenger_id === item.passenger_id) {
          return {
            ...item,
            // agent_commission: 0,
          }; // Update the object if matches
        }
        return item; // Return the other items unchanged
      });

      this.groupCheckedPassengers = dataPassengers;
      console.log(this.groupCheckedPassengers);
    }
  }

  // Function to calculate agent_commission for a list
  calculateCommissionNest(items: any, key: string) {
    return items.map((item: any) => ({
      ...item,
      agent_commission: item[key] * 0.15,
    }));
  }

  calculateCommissionPackage(items: any) {
    return items.map((item: any) => ({
      ...item,
      agent_commission: item.cost * 0.15,
    }));
  }

  calculateCommissionPassenger(items: any) {
    return items.map((item: any) => ({
      ...item,
      agent_commission: item.tariff * 0.15,
    }));
  }

  async openModalEditBSD(val: any, item: string) {
    console.log(val);
    this.dataGosend = val;
    this.type = item;
    console.log(this.type);

    this.groupCheckedPackagesEdit = [];

    // edit Sp
    this.dataGosend.bsd_date = new Date();
    this.formSP.patchValue(this.dataGosend);

    if (this.type === 'Package') {
      console.log('open package');
      // Edit cost
      this.formCost.patchValue({
        cost_id: val.cost?.cost_id,
        car_id: val.car?.car_id,
        go_send_id: val.go_send_id,
        parking_package: val.cost?.parking_package,
      });
      console.log(this.formCost.value);

      // data package
      // const updatedDataPackages = this.calculateCommissionPackage(val?.packages);
      // console.log(updatedDataPackages);
      this.dataMalangPackage = val?.packages?.filter((val: GoSendModel) => val.city_id === 1);
      this.dataSurabayaPackage = val?.packages?.filter((val: GoSendModel) => val.city_id === 2);
      console.log(this.dataMalangPackage);
      console.log(this.dataSurabayaPackage);

      this.formPackage.patchValue(val?.packages);
    }

    if (this.type === 'Passenger') {
      console.log('open passenger');
      this.formCost.patchValue({
        cost_id: val.cost?.cost_id,
        car_id: val.car?.car_id,
        go_send_id: val.go_send_id,
        parking_passenger: val.cost?.parking_passenger,
        bbm: val.cost?.bbm,
        bbm_cost: val.cost?.bbm_cost,
        toll_in: val.cost?.toll_in,
        toll_out: val.cost?.toll_out,
        overnight: val.cost?.overnight,
        extra: val.cost?.extra,
        others: val.cost?.others,
        mandatory_deposit: val.cost?.mandatory_deposit,
        driver_deposit: val.cost?.driver_deposit,
        voluntary_deposit: val.cost?.voluntary_deposit,
        current_km: val.cost?.current_km,
        old_km: val.cost?.old_km,
      });
      console.log(this.formCost.value);

      // data passenger
      // const updatedDataPassengers = this.calculateCommissionPassenger(val?.passengers);
      this.dataMalangPassenger = val?.passengers?.filter((val: GoSendModel) => val.city_id === 1);
      this.dataSurabayaPassenger = val?.passengers?.filter((val: GoSendModel) => val.city_id === 2);
      console.log(this.dataMalangPassenger);
      console.log(this.dataSurabayaPassenger);

      this.formPassenger.patchValue(val?.passengers);
    }

    return await this.modalComponentBSD.open();
  }

  dataEditCost() {
    console.log(this.formCost.value);

    const costId = this.formCost.controls['cost_id'].value;
    console.log(costId);

    if (costId) {
      console.log('update cost');
      // update cost
      this.updateCost();
    } else {
      console.log('create new cost');
      // create new cost and update gosend cost_id
      this.createCost();
    }
  }

  dataEditBSD() {
    if (this.type === 'Package') {
      console.log('Package');
      // console.log(this.formPackage.value);
      // update package per item
      // this.updatePackage();

      // update package group
      this.editBsdGroupPackage();
    }

    if (this.type === 'Passenger') {
      console.log('Passenger');
      // console.log(this.formPassenger.value);
      // update passenger
      // this.updatePassenger();

      // update package group
      this.editBsdGroupPassenger();
    }
  }

  printBSD(val: GoSendModel, item: string) {
    sessionStorage.setItem('printbsd', JSON.stringify(val));
    sessionStorage.setItem('type', JSON.stringify(item));
    window.open('#/finance/bsd/tirta-jaya/printbsd', '_blank');
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
                  limit: this.params.limit,
                  page: this.params.page,
                  search: term,
                  startDate: this.params.startDate,
                  endDate: this.params.endDate,
                  status: 'List',
                  city: '',
                };
                this.dataListBSD(this.params);
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

  onChangeChecked(value: any) {
    console.log(value);
    const index = this.data.indexOf(value);

    if (this.selected.has(index)) {
      // If the item is already selected, remove it from both the Set and the array
      this.selected.delete(index);
      this.groupCheckedBsdList = this.groupCheckedBsdList.filter((item: any) => item !== value);
    } else {
      // If the item is not selected, add it to the Set and array
      this.selected.add(index);
      this.groupCheckedBsdList.push(value);
    }
    console.log(this.groupCheckedBsdList);
  }

  async openModalAddSPGroup() {
    console.log(this.groupCheckedBsdList);

    this.formCost.patchValue({ car_id: this.groupCheckedBsdList[0].car.car_id });

    this.formSP.patchValue({
      car: this.groupCheckedBsdList[0].employee.name,
      car_no: this.groupCheckedBsdList[0].car.car_number,
      send_date_city1: this.datePipe.transform(this.groupCheckedBsdList[0]?.send_date, 'dd-MM-yyyy, HH:mm'),
      send_date_city2: this.datePipe.transform(this.groupCheckedBsdList[1]?.send_date, 'dd-MM-yyyy, HH:mm'),
    });

    const dataPackages = this.groupCheckedBsdList.map((item) => item?.packages).flat();
    const filterPackagesMlg = dataPackages.filter((packageItem) => packageItem.city_id === 1);
    this.dataMalangPackage = filterPackagesMlg;
    const filterPackagesSby = dataPackages.filter((packageItem) => packageItem.city_id === 2);
    this.dataSurabayaPackage = filterPackagesSby;
    console.log(this.dataMalangPackage);
    console.log(this.dataSurabayaPackage);

    const dataPassengers = this.groupCheckedBsdList.map((item) => item?.passengers).flat();
    const dataPassengersMlg = dataPassengers.filter((passengerItem) => passengerItem.city_id === 1);
    this.dataMalangPassenger = dataPassengersMlg;
    const dataPassengersSby = dataPassengers.filter((passengerItem) => passengerItem.city_id === 2);
    this.dataSurabayaPassenger = dataPassengersSby;
    console.log(this.dataMalangPassenger);
    console.log(this.dataSurabayaPassenger);

    this.totalTariffPassenger = this.utils.sumTotal(
      this.dataMalangPassenger.map((data: PassengerModel) => data.tariff)
    );
    this.totalPassenger = this.utils.sumTotal(
      this.dataMalangPassenger.map((data: PassengerModel) => data.total_passenger)
    );

    return await this.modalComponentBSDGroup.open();
  }

  addBsdGroup() {
    this.isLoading = true;

    // Check if both forms are valid
    if (this.formCost.valid && this.formSP.valid) {
      const costData = this.formCost.value;
      const spData = this.groupCheckedBsdList;

      // Start with creating the cost
      this.createCostGroup(costData)
        .pipe(
          switchMap((costResponse: any) => {
            // If cost creation is successful, get the cost_id
            const cost_id = costResponse.data.cost_id;

            // Patch the form or modify spData to include cost_id
            // this.formSP.patchValue({ cost_id: cost_id });
            this.groupCheckedBsdList = spData.map((item) => {
              return {
                ...item,
                cost_id: cost_id,
                bsd_date: new Date(),
                packages: this.groupCheckedPackages,
                passengers: this.groupCheckedPassengers,
              };
            });
            console.log(this.groupCheckedBsdList);

            // Now proceed with the updateGosend using the updated spData
            return this.updateGosendGroup(this.groupCheckedBsdList).pipe(
              catchError((error) => {
                // If updateGosendGroup fails, throw an error to stop the process
                console.error('Gosend update failed:', error);
                this.isLoading = false;
                this.handlerResponseService.failedResponse(error);
                return throwError(() => new Error('Update Gosend failed')); // Stop further execution
              })
            );
          }),
          catchError((error) => {
            // Handle error in cost creation
            console.error('Cost save failed:', error);
            this.isLoading = false;
            this.handlerResponseService.failedResponse(error);
            return of(null); // Return observable to cancel the further process
          }),
          finalize(() => {
            // Final cleanup for createCost and updateGosend
            this.formCost.markAsPristine();
            this.formSP.markAsPristine();
            this.isLoading = false;
          })
        )
        .subscribe({
          next: async (gosendResponse) => {
            if (gosendResponse === null) {
              this.snackbar.open('Operation canceled due to Gosend save failure', '', {
                panelClass: 'snackbar-error',
                duration: 10000,
              });
              return;
            }

            // If both createCost and updateGosend succeed, show success
            console.log('Cost saved successfully');
            console.log('SP saved successfully');
            console.log('Cost group save response:', gosendResponse);
            this.snackbar.open('BSD Driver success created', '', {
              panelClass: 'snackbar-success',
              duration: 10000,
            });

            this.dataListBSD(this.params);
            await this.modalComponentBSDGroup.dismiss();
          },
          error: (err) => {
            console.error('Unexpected error:', err);
            this.handlerResponseService.failedResponse(err);
          },
          complete: () => {
            this.isLoading = false;
            console.log('Process completed successfully');
          },
        });
    }
  }

  createCostGroup(data: any) {
    // API call to save Cost
    return this.bsdService.costCreate(data);
  }

  updateGosendGroup(data: GoSendModel[]) {
    // API call to edit Go send
    return this.packageService.editSPGroup(data);
  }

  editBsdGroupPackage() {
    console.log(this.groupCheckedPackagesEdit);

    this.packageService
      .patchGroup(this.groupCheckedPackagesEdit)
      .pipe(
        finalize(() => {
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

            this.dataListBSD(this.params);
            await this.modalComponentBSD.dismiss();
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

  updatePackage() {
    // update package
    this.packageService
      .patch(this.formPackage.value)
      .pipe(
        finalize(() => {
          this.formCost.markAsPristine();
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

            this.dataListBSD(this.params);
            await this.modalComponentBSD.dismiss();
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

  editBsdGroupPassenger() {
    console.log(this.groupCheckedPassengersEdit);

    this.passengerService
      .patchGroup(this.groupCheckedPassengersEdit)
      .pipe(
        finalize(() => {
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

            this.dataListBSD(this.params);
            await this.modalComponentBSD.dismiss();
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

  updatePassenger() {
    // update passenger
    this.passengerService
      .patch(this.formPassenger.value)
      .pipe(
        finalize(() => {
          this.formCost.markAsPristine();
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

            this.dataListBSD(this.params);
            await this.modalComponentBSD.dismiss();
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

  createCost() {
    // create new cost and update gosend cost_id
    this.bsdService
      .costCreate(this.formCost.value)
      .pipe(
        switchMap((respCost: any) => {
          console.log('Response from respCost:');
          console.log(respCost);
          this.formSP.patchValue({
            cost_id: respCost.data.cost_id,
          });
          console.log(this.formSP.value);
          return this.packageService.editSP(this.formSP.value);
        }),
        finalize(() => {
          this.formCost.markAsPristine();
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

            this.dataListBSD(this.params);
            await this.modalComponentBSD.dismiss();
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

  updateCost() {
    // update cost
    this.bsdService
      .costEdit(this.formCost.value)
      .pipe(
        finalize(() => {
          this.formCost.markAsPristine();
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

            this.dataListBSD(this.params);
            await this.modalComponentBSD.dismiss();
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
