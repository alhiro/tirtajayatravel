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
import { DeliveryService } from '../../booking/delivery/delivery.service';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
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
})
export class BsdComponent implements OnInit, OnDestroy {
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

  public dataBSDList: any;
  public dataBSDDone: any;
  public dataLengthBSDList!: number;
  public dataLengthBSDDone!: number;

  public modelEmployee: any;
  public modelCar: any;

  public searchFailed = false;
  public searchingEmployee = false;
  public searchFailedEmployee = false;

  public isPayment!: boolean;
  public isSp!: boolean;
  public isPaymentPassenger!: boolean;
  public isSpPassenger!: boolean;

  public configuration: Config = { ...DefaultConfig };
  @Input() cssClass!: '';
  currentTab = 'Done';
  currentDisplay: boolean = false;
  currentTabModal = 'Cost';
  currentDisplayModal: boolean = false;

  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };
  public params = {
    limit: 10,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  formSP!: FormGroup;
  formPackage!: FormGroup;
  formPassenger!: FormGroup;
  formCost!: FormGroup;

  isLoading = false;

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
    modalTitle: 'Edit BSD',
    // dismissButtonLabel: 'Submit',
    // closeButtonLabel: 'Cancel',
  };
  addClass = 'modal-clean';
  @ViewChild('modalSP') private modalComponentSP!: ModalFullComponent;
  @ViewChild('modalBSD') private modalComponentBSD!: ModalFullComponent;

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
    private utils: Utils
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.dataListBSD(this.params);
    this.city = this.localService.getCity();
    this.level = this.localService.getPosition();

    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.horizontalScroll = false;
    this.configuration.orderEnabled = false;

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
    }; // see https://github.com/typicode/json-server
    this.dataListBSD(params);
  }

  private dataListBSD(params: PaginationContext): void {
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
        if (response) {
          this.configuration.isLoading = false;

          const dataBSDList = response.data?.filter(
            (data: any) =>
              (data.packages.length > 0 || data.passengers.length > 0) &&
              data.bsd === null &&
              data.bsd_passenger === null
          );
          this.dataLengthBSDList = dataBSDList?.length;
          this.dataBSDList = dataBSDList;

          const dataBSDDone = response.data?.filter(
            (data: GoSendModel) => data.bsd !== null || data.bsd_passenger !== null
          );
          this.dataLengthBSDDone = dataBSDDone?.length;
          this.dataBSDDone = dataBSDDone;

          // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
          this.pagination.count =
            this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.configuration.horizontalScroll = false;

          this.dataLengthBSDList = 0;
          this.dataLengthBSDDone = 0;
          this.dataBSDList = [];
          this.dataBSDDone = [];
        }
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

  formatter = (result: { name: string; car_number: string }) => result.car_number;

  checkPayment(item: PackageModel, event: Event) {
    console.log(item);
    const target = event.target as HTMLInputElement;
    item.check_payment = target.checked;

    this.formPackage.patchValue(item);

    if (item.check_payment) {
      this.formPackage.patchValue({
        check_payment: true,
        sender_id: item.sender.sender_id,
        recipient_id: item.recipient.recipient_id,
      });
    } else {
      this.formPackage.patchValue({
        check_payment: false,
        sender_id: item.sender.sender_id,
        recipient_id: item.recipient.recipient_id,
      });
    }
    console.log(this.formPackage.value);
  }

  checkSp(item: PackageModel, event: Event) {
    console.log(item);
    const target = event.target as HTMLInputElement;
    item.check_sp = target.checked;

    this.formPackage.patchValue(item);

    if (item.check_sp) {
      item.agent_commission = item.cost * 0.15;

      this.formPackage.patchValue({
        check_sp: true,
        check_date_sp: new Date(),
        agent_commission: item.cost * 0.15,
        sender_id: item.sender.sender_id,
        recipient_id: item.recipient.recipient_id,
      });
    } else {
      item.agent_commission = 0;

      this.formPackage.patchValue({
        check_sp: false,
        check_date_sp: new Date(),
        agent_commission: 0,
        sender_id: item.sender.sender_id,
        recipient_id: item.recipient.recipient_id,
      });
    }
    console.log(this.formPackage.value);
  }

  checkPaymentPassenger(item: PassengerModel, event: Event) {
    console.log(item);
    const target = event.target as HTMLInputElement;
    item.check_sp = target.checked;

    this.formPassenger.patchValue(item);

    if (item.check_sp) {
      this.formPassenger.patchValue({
        check_payment: true,
      });
    } else {
      this.formPassenger.patchValue({
        check_payment: false,
      });
    }
    console.log(this.formPassenger.value);
  }

  checkSpPassenger(item: PassengerModel, event: Event) {
    console.log(item);
    const target = event.target as HTMLInputElement;
    item.check_sp = target.checked;

    this.formPassenger.patchValue(item);

    if (item.check_sp) {
      item.agent_commission = item.tariff * 0.15;

      this.formPassenger.patchValue({
        check_sp: true,
        check_date_sp: new Date(),
        agent_commission: item.tariff * 0.15,
      });
    } else {
      item.agent_commission = 0;

      this.formPassenger.patchValue({
        check_sp: false,
        check_date_sp: new Date(),
        agent_commission: 0,
      });
    }
    console.log(this.formPassenger.value);
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

    // edit Sp
    this.dataGosend.bsd_date = new Date();
    this.formSP.patchValue(this.dataGosend);

    if (this.type === 'Package') {
      console.log('open package');
      // Edit cost
      this.formCost.patchValue({
        cost_id: val.cost_id,
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
        cost_id: val.cost_id,
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
    } else {
      console.log('create new cost');

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
  }

  dataEditBSD() {
    if (this.type === 'Package') {
      console.log('Package');
      console.log(this.formPackage.value);
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

    if (this.type === 'Passenger') {
      console.log('Passenger');
      console.log(this.formPassenger.value);
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
  }

  printBSD(val: GoSendModel, item: string) {
    sessionStorage.setItem('printbsd', JSON.stringify(val));
    sessionStorage.setItem('type', JSON.stringify(item));
    window.open('#/finance/bsd/tirta-jaya/printbsd', '_blank');
  }
}
