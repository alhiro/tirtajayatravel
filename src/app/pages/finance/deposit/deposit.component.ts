import { Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from '@app/@shared';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { GoSendModel } from '@app/pages/booking/package/models/gosend';
import { PackageService } from '@app/pages/booking/package/package.service';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { CashoutService } from '../cashout/cashout.service';
import { CashoutModel } from '../cashout/models/cashout.model';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
})
export class DepositComponent implements OnInit {
  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public configuration: Config = { ...DefaultConfig };

  public depositData: any;
  public dataPackage: any;
  public dataPassenger: any;

  // table package
  public totalCost = 0;
  public totalCommissionPackage = 0;
  public totalParkingPackage = 0;
  public totalDebetPackage = 0;
  public totalKreditPackage = 0;
  public totalDepositDriverPackage = 0;
  // end table package
  public totalPackagePaidMalang = 0;
  public totalPackagePaidSurabaya = 0;
  public totalPackageCodMalang = 0;
  public totalReminderPaymentPackage = 0;

  // table passenger
  public totalTariff = 0;
  public totalPassenger = 0;
  public totalRemainingPayment = 0;
  public totalCommissionPassenger = 0;
  public mandatoryDeposit = 0;
  public depositDriver = 0;
  public voluntaryDeposit = 0;
  public oldFullKm = 0;
  public currentFullKm = 0;
  public differentInKm = 0;
  public averageKm = 0;
  public bbm = 0;
  public totalParkingPassenger = 0;
  public inToll = 0;
  public outToll = 0;
  public overnight = 0;
  public extra = 0;
  public others = 0;
  public totalDepositOffice = 0;
  public totalDebetPassenger = 0;
  public totalKreditPassenger = 0;
  public totalDepositDriverPassenger = 0;
  // end table passenger
  public totalPassengerPaidMalang = 0;
  public totalPassengerPaidSurabaya = 0;
  public totalPackageCodSurabaya = 0;
  public totalReminderPaymentPassenger = 0;

  public piutangTransition = 0;
  public totalReminderPaymentTransfer = 0;
  public totalPaymentMonthly = 0;

  // cashout
  public dataCashoutMalang: any;
  public dataCashoutSurabaya: any;
  public totalCostMalang: any;
  public totalCostSurabaya: any;
  public cashoutOnderdilService = 0;
  public cashoutCourierMalang = 0;
  public cashoutCourierSurabaya = 0;

  // daily malang
  public totalCashInMalangDaily = 0;
  public totalCashOutMalangDaily = 0;
  public totalDepositMalangDaily = 0;

  // daily surabaya
  public totalCashInSurabayaDaily = 0;
  public totalCashOutSurabayaDaily = 0;
  public totalDepositSurabayaDaily = 0;

  public totalDepositDaily = 0;

  public pagination = {
    limit: 100,
    offset: 0,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };
  public params: any = {
    limit: '',
    page: '',
    search: '',
    startDate: '',
    endDate: '',
  };

  date!: NgbDateStruct;
  @ViewChild('datepicker') datePicker!: any;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private packageService: PackageService,
    private cashoutService: CashoutService,
    private handlerResponseService: HandlerResponseService,
    private utils: Utils
  ) {}

  ngOnInit() {
    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.paginationEnabled = false;
    this.configuration.rows = 100;
    this.configuration.orderEnabled = false;
    this.configuration.horizontalScroll = false;

    this.columnsPackage = [
      // { key: '', title: 'No.' },
      { key: 'bsd', title: 'BSD Package' },
      { key: 'car_id', title: 'Driver' },
      { key: 'cost', title: 'Total' },
      { key: 'updated_by', title: 'Cashier' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsPassenger = [
      // { key: '', title: 'No.' },
      { key: 'bsd_passenger', title: 'BSD Passenger' },
      { key: 'employee_id', title: 'Driver' },
      { key: 'tariff', title: 'Total' },
      { key: 'updated_by', title: 'Cashier' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    const inputDate = new Date();
    const { startDate, endDate } = this.utils.singleDate(inputDate);

    const params = {
      limit: 100,
      page: 1,
      search: '',
      startDate: startDate,
      endDate: endDate,
    };
    console.log(params);
    this.dataListCashout(params);
    this.dataListBSD(params);
  }

  datepicker() {
    this.datePicker?.toggle();
  }

  onDateChange(date: NgbDateStruct): void {
    this.date = date;

    const inputDate = new Date(date.year, date.month - 1, date.day);
    const { startDate, endDate } = this.utils.singleDate(inputDate);

    const params = {
      limit: 100,
      page: 1,
      search: '',
      startDate: startDate,
      endDate: endDate,
    };
    console.log(params);
    this.dataListCashout(params);
    this.dataListBSD(params);
  }

  printDeposit() {
    sessionStorage.setItem('data-deposit', JSON.stringify(this.depositData));
    window.open('#/finance/deposit/daily/printdaily', '_blank');
  }

  eventEmitted($event: { event: string; value: any }): void {
    console.log($event.value);
  }

  printBSD(val: GoSendModel, item: string) {
    sessionStorage.setItem('printbsd', JSON.stringify(val));
    sessionStorage.setItem('type', JSON.stringify(item));
    window.open('#/finance/bsd/tirta-jaya/printbsd', '_blank');
  }

  private dataListCashout(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.cashoutService
      .list(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        const malangData = response.data?.filter((data: CashoutModel) => data.city_id === 1);
        const surabayaData = response.data?.filter((data: CashoutModel) => data.city_id === 2);
        this.dataCashoutMalang = malangData;
        this.dataCashoutSurabaya = surabayaData;

        this.totalCostMalang = this.utils.sumTotal(this.dataCashoutMalang?.map((data: CashoutModel) => data.fee));
        this.totalCostSurabaya = this.utils.sumTotal(this.dataCashoutSurabaya?.map((data: CashoutModel) => data.fee));

        this.configuration.horizontalScroll = true;
      });
  }

  private dataListBSD(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        }),
        catchError((err) => {
          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = false;
          this.handlerResponseService.failedResponse(err);
          return of([]);
        })
      )
      .subscribe((response: any) => {
        this.configuration.isLoading = false;
        this.configuration.horizontalScroll = true;

        if (response) {
          const dataPackage = response.data?.filter((data: GoSendModel) => data.status === 'Box' && data.bsd !== null);
          this.dataPackage = dataPackage;
          console.log(this.dataPackage);

          const dataPassenger = response.data?.filter(
            (data: GoSendModel) => data.status === 'Reguler' && data.bsd_passenger !== null
          );
          this.dataPassenger = dataPassenger;
          console.log(this.dataPassenger);

          const dataBSD = response.data?.filter(
            (data: GoSendModel) => data.bsd !== null || data.bsd_passenger !== null
          );
          const {
            totalPackagesCost,
            totalCommissionPackage,
            totalPackagePaidMalang,
            totalPackagePaidSurabaya,
            totalPackageCodMalang,
            totalPackageCodSurabaya,
            totalReminderPaymentPackage,
            totalPaymentMonthly,
          } = this.utils.sumCostPackages(dataBSD);
          const {
            totalPassengerCost,
            totalCommissionPassenger,
            totalPassengerPaidMalang,
            totalPassengerPaidSurabaya,
            totalReminderPaymentPassenger,
          } = this.utils.sumCostPassengers(dataBSD);

          // Package
          this.totalCost = totalPackagesCost;
          this.totalCommissionPackage = totalCommissionPackage;
          this.totalDebetPackage = this.totalCost;
          this.totalKreditPackage = Number(this.totalCommissionPackage) + Number(this.totalParkingPackage);
          this.totalDepositDriverPackage = Number(this.totalDebetPackage) - Number(this.totalKreditPackage);

          this.totalPackagePaidMalang = totalPackagePaidMalang;
          this.totalPackagePaidSurabaya = totalPackagePaidSurabaya;
          this.totalPackageCodMalang = totalPackageCodMalang;
          this.totalPackageCodSurabaya = totalPackageCodSurabaya;

          this.totalPaymentMonthly = totalPaymentMonthly;

          // Passenger
          this.totalTariff = totalPassengerCost;
          this.totalCommissionPassenger = totalCommissionPassenger;
          this.totalDebetPassenger =
            Number(this.totalTariff) +
            Number(this.mandatoryDeposit) +
            Number(this.depositDriver) +
            Number(this.voluntaryDeposit);
          this.totalKreditPassenger =
            Number(this.totalCommissionPassenger) +
            Number(this.bbm) +
            Number(this.totalParkingPassenger) +
            Number(this.inToll) +
            Number(this.outToll) +
            Number(this.overnight) +
            Number(this.extra) +
            Number(this.others);
          this.totalDepositDriverPassenger = Number(this.totalDebetPassenger) - Number(this.totalKreditPassenger);

          this.totalPassengerPaidMalang = totalPassengerPaidMalang;
          this.totalPassengerPaidSurabaya = totalPassengerPaidSurabaya;

          // reminder payment transfer
          this.totalReminderPaymentPackage = totalReminderPaymentPackage;
          this.totalReminderPaymentPassenger = totalReminderPaymentPassenger;
          this.totalReminderPaymentTransfer =
            Number(this.totalReminderPaymentPackage) + Number(this.totalReminderPaymentPassenger);

          // daily malang
          this.totalCashInMalangDaily =
            Number(this.totalDepositDriverPackage) +
            Number(this.totalDepositDriverPassenger) +
            Number(this.totalPackagePaidMalang) +
            Number(this.totalPackageCodMalang);
          this.totalCashOutMalangDaily = Number(this.totalCostMalang) + Number(this.cashoutCourierMalang);
          this.totalDepositMalangDaily = Number(this.totalCashInMalangDaily) - Number(this.totalCashOutMalangDaily);

          // daily surabaya
          this.totalCashInSurabayaDaily =
            Number(this.totalPackagePaidSurabaya) +
            Number(this.totalPackageCodSurabaya) +
            Number(this.totalPassengerPaidSurabaya);
          this.totalCashOutSurabayaDaily = Number(this.totalCostSurabaya) + Number(this.cashoutCourierSurabaya);
          this.totalDepositSurabayaDaily =
            Number(this.totalCashInSurabayaDaily) - Number(this.totalCashOutSurabayaDaily);

          this.totalDepositDaily = Number(this.totalDepositMalangDaily) + Number(this.totalDepositSurabayaDaily);

          this.depositData = {
            dataPackage: dataPackage,
            dataPassenger: dataPassenger,
            // cashin
            totalDepositDriverPackage: this.totalDepositDriverPackage,
            totalDepositDriverPassenger: this.totalDepositDriverPassenger,
            totalPackagePaidMalang: totalPackagePaidMalang,
            totalPackagePaidSurabaya: totalPackagePaidSurabaya,
            totalPackageCodMalang: totalPackageCodMalang,
            totalPackageCodSurabaya: totalPackageCodSurabaya,
            totalPassengerPaidMalang: totalPassengerPaidMalang,
            totalPassengerPaidSurabaya: totalPassengerPaidSurabaya,
            piutangTransition: this.piutangTransition,
            // cashout
            totalCostMalang: this.totalCostMalang,
            totalCostSurabaya: this.totalCostSurabaya,
            cashoutOnderdilService: this.cashoutOnderdilService,
            cashoutCourierMalang: this.cashoutCourierMalang,
            cashoutCourierSurabaya: this.cashoutCourierSurabaya,
            totalReminderPaymentTransfer: this.totalReminderPaymentTransfer,
            totalPaymentMonthly: this.totalPaymentMonthly,
            // deposit cash malang
            totalCashInMalangDaily: this.totalCashInMalangDaily,
            totalCashOutMalangDaily: this.totalCashOutMalangDaily,
            totalDepositMalangDaily: this.totalDepositMalangDaily,
            // information cash in surabaya:
            totalCashInSurabayaDaily: this.totalCashInSurabayaDaily,
            totalCashOutSurabayaDaily: this.totalCashOutSurabayaDaily,
            totalDepositSurabayaDaily: this.totalDepositSurabayaDaily,
            // deposit cash daily
            totalDepositDaily: this.totalDepositDaily,
          };
        }
      });
  }
}
