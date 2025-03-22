import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Utils } from '@app/@shared';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { GoSendModel } from '@app/pages/booking/package/models/gosend';
import { PackageService } from '@app/pages/booking/package/package.service';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Observable, Subject, catchError, debounceTime, finalize, forkJoin, map, of, takeUntil } from 'rxjs';
import { CashoutService } from '../cashout/cashout.service';
import { CashoutModel } from '../cashout/models/cashout.model';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { ScheduleService } from '@app/pages/garage/schedule/schedule.service';
import { ScheduleModel } from '@app/pages/garage/schedule/models/schedule.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PassengerModel } from '@app/pages/booking/passenger/models/passenger.model';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
})
export class DepositComponent implements OnInit, OnDestroy {
  public levelrule!: number;
  public city_id!: number;
  public username!: string;

  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];
  public columnsMonthly!: Columns[];

  public configuration: Config = { ...DefaultConfig };

  public data: any;
  public dataPackages: any;
  public dataBsd: any;
  public dataDeposit: any;
  public dataPackage: any[] = [];
  public dataPackageCommission: any[] = [];
  public dataPassenger: any[] = [];
  public dataLunasMonthly: any;
  public dataPackagePaidFilterMlg: any[] = [];
  public dataPackagePaidFilterSby: any[] = [];

  public dataGarage: any;

  public totalDataLunasMonthlyPaid = 0;
  public totalDataLunasMonthlyNotPaid = 0;

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
  public totalPackageCod = 0;
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

  public totalCostMalang: any = 0;
  public totalCostSurabaya: any = 0;
  public cashoutOnderdilService = 0;
  public cashoutCourier = 0;
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

  public startDate: any;
  public endDate: any;

  currentTab = 'Daily';
  isMobile: boolean = false;
  isLoading = false;

  public pagination = {
    limit: 1000,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
    city: '',
    status: '',
  };
  public params = {
    limit: 1000,
    page: 1,
    search: '',
    startDate: '',
    endDate: '',
    city: '',
    status: '',
  };

  date!: NgbDateStruct;
  @ViewChild('datepicker') datePicker!: any;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private packageService: PackageService,
    private cashoutService: CashoutService,
    private scheduleService: ScheduleService,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService,
    private utils: Utils,
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.levelrule = this.utils.getLevel();
    this.city_id = this.utils.getCity();
    this.username = this.utils.getUsername();

    // set min selected date
    const minDate = this.utils.indonesiaDateFormat(new Date());
    var getDate = new Date(minDate);
    this.formatDateNow(getDate);
  }

  ngOnInit() {
    this.breakpointObserver.observe(['(max-width: 440px)']).subscribe((result) => {
      this.isMobile = result.matches;
      if (this.isMobile) {
        console.log('Mobile screen detected');
      } else {
        console.log('Desktop screen detected');
      }
    });

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;

    this.configuration.paginationEnabled = false;
    this.configuration.rows = 10000;
    this.configuration.orderEnabled = false;

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

    this.columnsMonthly = [
      { key: '', title: 'No.', width: '3%' },
      { key: 'resi_number', title: 'No Resi' },
      { key: 'book_date', title: 'Send Date' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'cost', title: 'Cost' },
      { key: 'payment', title: 'Status' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    const inputDate = new Date();
    const { startDate, endDate } = this.utils.singleDate(inputDate);

    this.startDate = startDate;
    this.endDate = endDate;

    forkJoin([this.dataListGosend(), this.dataListGarage(), this.dataListCashout()]).subscribe({
      next: () => {
        console.log('All functions completed');
        this.dataListDeposit();
      },
      error: (err: any) => {
        console.error('Error in one or more functions:', err);
      },
    });
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;

    if (this.currentTab === 'Daily') {
      // const inputDate = new Date();
      // const { startDate, endDate } = this.utils.singleDate(inputDate);

      // this.startDate = startDate;
      // this.endDate = endDate;

      forkJoin([this.dataListGosend(), this.dataListGarage(), this.dataListCashout()]).subscribe({
        next: () => {
          console.log('All functions completed');
          this.dataListDeposit();
        },
        error: (err: any) => {
          console.error('Error in one or more functions:', err);
        },
      });
    } else if (this.currentTab === 'Monthly') {
      // const inputDate = new Date();
      // const { startDate, endDate } = this.utils.singleDate(inputDate);

      // this.startDate = startDate;
      // this.endDate = endDate;

      this.dataListDeposit();
    }
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

  datepicker() {
    this.datePicker?.toggle();
  }

  onDateChange(date: NgbDateStruct): void {
    this.date = date;

    const inputDate = new Date(date.year, date.month - 1, date.day);
    const { startDate, endDate } = this.utils.singleDate(inputDate);
    this.startDate = startDate;
    this.endDate = endDate;

    forkJoin([this.dataListGosend(), this.dataListGarage(), this.dataListCashout()]).subscribe({
      next: () => {
        console.log('All functions completed');
        this.dataListDeposit();
      },
      error: (err: any) => {
        console.error('Error in one or more functions:', err);
      },
    });
  }

  printFilterMonthly(datepicker: any) {
    sessionStorage.setItem('printlistmonthly', JSON.stringify(this.dataPackage));
    window.open('finance/commission/package/printlunasmonthly', '_blank');
  }

  printDeposit() {
    sessionStorage.setItem('data-deposit', JSON.stringify(this.dataDeposit));
    sessionStorage.setItem('data-garage', JSON.stringify(this.dataGarage));
    const commba = {
      totalDepositDriverPackage: this.totalDepositDriverPackage,
      totalDepositDriverPassenger: this.totalDepositDriverPassenger,
      totalPackagePaidSurabaya: this.totalPackagePaidSurabaya,
      totalPackagePaidMalang: this.totalPackagePaidMalang,
      bayarTujuanMalang: this.totalPackageCodMalang,
      bayarTujuanSurabaya: this.totalPackageCodSurabaya,
      totalPassengerPaidMalang: this.totalPassengerPaidMalang,
      totalPassengerPaidSurabaya: this.totalPassengerPaidSurabaya,
      piutangTransition: this.piutangTransition,
      totalCostMalang: this.totalCostMalang,
      totalCostSurabaya: this.totalCostSurabaya,
      cashoutOnderdilService: this.cashoutOnderdilService,
      pengeluaranKomisiMalang: this.cashoutCourierMalang,
      pengeluaranKomisiSurabaya: this.cashoutCourierSurabaya,
      totalReminderPaymentTransfer: this.totalReminderPaymentTransfer,
      totalPaymentMonthly: this.totalPaymentMonthly,
      totalCashInMalangDaily: this.totalCashInMalangDaily,
      totalCashOutMalangDaily: this.totalCashOutMalangDaily,
      totalDepositMalangDaily: this.totalDepositMalangDaily,
      totalCashInSurabayaDaily: this.totalCashInSurabayaDaily,
      totalCashOutSurabayaDaily: this.totalCashOutSurabayaDaily,
      totalDepositSurabayaDaily: this.totalDepositSurabayaDaily,
      totalDepositDaily: this.totalDepositDaily,
      totalcashoutOnderdilService: this.cashoutOnderdilService,
    };
    sessionStorage.setItem('data-comba', JSON.stringify(commba));
    window.open('finance/deposit/daily/printdaily', '_blank');
  }

  printDepositSurabaya() {
    sessionStorage.setItem('data-cashout-sby', JSON.stringify(this.totalCostSurabaya));
    const commba = {
      data: this.data,
      dataPackages: this.dataPackages,
      datacashout: this.dataCashoutSurabaya,
      pengeluaranLunasSurabaya: this.totalPackagePaidSurabaya,
      bayarTujuanMalang: this.totalPackageCodMalang,
      bayarTujuanSurabaya: this.totalPackageCodSurabaya,
      pengeluaranKomisiMalang: this.cashoutCourierMalang,
      pengeluaranKomisiSurabaya: this.cashoutCourierSurabaya,
    };
    sessionStorage.setItem('data-comba', JSON.stringify(commba));

    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Surabaya',
      city_id: 2,
      status: '',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('finance/deposit/daily/printdailysby', '_blank');
  }

  eventEmitted($event: { event: string; value: any }): void {
    console.log($event.value);
  }

  printBSD(val: GoSendModel, item: string) {
    sessionStorage.setItem('printbsd', JSON.stringify(val));
    sessionStorage.setItem('type', JSON.stringify(item));
    window.open('finance/bsd/tirta-jaya/printbsd', '_blank');
  }

  printFilterDatePaymentMlg() {
    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Malang',
      status: 'Lunas (Kantor)',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/package/transaction/printlist', '_blank');
  }

  printFilterDatePaymentSby() {
    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Surabaya',
      status: 'Lunas (Kantor)',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/package/transaction/printlist', '_blank');
  }

  printFilterBaMlg() {
    const paramRange = {
      limit: 10,
      page: 1,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Malang',
      status: '',
      username: '',
    };
    console.log(paramRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(paramRange));
    window.open('finance/commission/package/printcommission', '_blank');
  }

  printFilterBaSby() {
    const paramRange = {
      limit: 10,
      page: 1,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Surabaya',
      status: '',
      username: '',
    };
    console.log(paramRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(paramRange));
    window.open('finance/commission/package/printcommission', '_blank');
  }

  printPassengerPaidMlg() {
    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Malang',
      status: '',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/passenger/transaction/printlist', '_blank');
  }

  printPassengerPaidSby() {
    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Surabaya',
      status: '',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/passenger/transaction/printlist', '_blank');
  }

  printPiutangTransition() {
    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: 'Piutang',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/package/transaction/printlist', '_blank');
  }

  printViaTransfer() {
    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: 'Lunas (Transfer)',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/package/transaction/printlist', '_blank');
  }

  printMonthly() {
    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: 'Customer (Bulanan)',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/package/transaction/printlist', '_blank');
  }

  printCashoutMlg() {
    const dateRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Malang',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('finance/cashout/printcashout', '_blank');
  }

  printCashoutSby() {
    const dateRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: 'Surabaya',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('finance/cashout/printcashout', '_blank');
  }

  printOnderdil() {
    const dateRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
    };
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('finance/cashout/printonderdil', '_blank');
  }

  private dataListCashout(): Observable<void> {
    const params = {
      limit: '',
      page: '',
      search: '',
      startDate: this.startDate,
      endDate: this.endDate,
      city: '',
      status: '',
    };
    console.log(params);

    return this.cashoutService.list(params).pipe(
      takeUntil(this.ngUnsubscribe),
      map((response: any) => {
        const malangData = response.data?.filter((data: CashoutModel) => data.city_id === 1);
        const surabayaData = response.data?.filter((data: CashoutModel) => data.city_id === 2);
        this.dataCashoutMalang = malangData;
        this.dataCashoutSurabaya = surabayaData;

        this.totalCostMalang = this.utils.sumTotal(this.dataCashoutMalang?.map((data: CashoutModel) => data.fee));
        this.totalCostSurabaya = this.utils.sumTotal(this.dataCashoutSurabaya?.map((data: CashoutModel) => data.fee));

        this.configuration.horizontalScroll = true;
      }),
      catchError((err) => {
        console.error('Error in dataListCashout:', err);
        return of(); // Emit an empty observable to prevent errors from propagating
      })
    );
  }

  private dataListGarage(): Observable<void> {
    const params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.startDate,
      endDate: this.endDate,
    };

    return this.scheduleService.list(params).pipe(
      takeUntil(this.ngUnsubscribe),
      map((response: any) => {
        this.dataGarage = response.data;
        this.cashoutOnderdilService = this.utils.sumTotal(this.dataGarage?.map((data: ScheduleModel) => data.cost));
        this.configuration.horizontalScroll = true;
      }),
      catchError((err) => {
        console.error('Error in data list schedule garage:', err);
        return of(); // Emit an empty observable to prevent errors from propagating
      })
    );
  }

  private dataListPackageCom(): Observable<void> {
    const params = {
      limit: '',
      page: '',
      search: 'listcom',
      startDate: this.startDate,
      endDate: this.endDate,
      city: '',
      status: '',
      username: '',
    };

    return this.packageService.listCom(params).pipe(
      takeUntil(this.ngUnsubscribe),
      map((response: any) => {
        const dataKomisiMlg = response.data?.filter(
          (data: PackageModel) => data.check_sp === true && data.city_id === 1
        );
        this.cashoutCourierMalang = this.utils.sumTotal(
          dataKomisiMlg?.map((data: PackageModel) => data.agent_commission)
        );
        console.log(this.cashoutCourierMalang);
        const dataKomisiSby = response.data?.filter(
          (data: PackageModel) => data.check_sp === true && data.city_id === 2
        );
        this.cashoutCourierSurabaya = this.utils.sumTotal(
          dataKomisiSby?.map((data: PackageModel) => data.agent_commission)
        );
        console.log(this.cashoutCourierSurabaya);

        this.configuration.horizontalScroll = true;
      }),
      catchError((err) => {
        console.error('Error in dataListPackageCom:', err);
        return of(); // Emit an empty observable to prevent errors from propagating
      })
    );
  }

  private dataListDeposit() {
    const params = {
      limit: '',
      page: '',
      search: '',
      startDate: this.startDate,
      endDate: this.endDate,
      city: '',
      status: '',
    };
    console.log(params);

    this.configuration.isLoading = true;
    this.packageService
      .depositDaily(params)
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        const data = response.data[0];
        this.dataPackages = data?.packages_paid;
        this.data = data;
        console.log(this.data);

        // Check package paid
        this.totalPackagePaidMalang = this.data?.standalone_package_paid?.total_cost_mlg;
        this.totalPackagePaidSurabaya = this.data?.standalone_package_paid?.total_cost_sby;

        // Check commission mlg and sby
        this.cashoutCourierMalang = this.data?.standalone_commission?.total_commission_mlg;
        this.cashoutCourierSurabaya = this.data?.standalone_commission?.total_commission_sby;

        // Check Ba mlg and sby
        this.totalPackageCodMalang = this.data?.standalone_ba?.total_cost_mlg;
        this.totalPackageCodSurabaya = this.data?.standalone_ba?.total_cost_sby;

        // Check passenger paid mlg and sby
        this.totalPassengerPaidMalang = this.data?.standalone_passenger_paid?.total_cost_mlg;
        this.totalPassengerPaidSurabaya = this.data?.standalone_passenger_paid?.total_cost_sby;

        // Check piutang transition
        this.piutangTransition = 0;

        // Check lunas transfer
        this.totalReminderPaymentTransfer = this.data?.standalone_package_transfer?.total_cost;

        // Check lunas monthly
        this.totalPaymentMonthly =
          Number(this.data?.standalone_package_monthly?.total_cost_sby) +
          Number(this.data?.standalone_package_monthly?.total_cost_mlg);

        this.totalCashInMalangDaily =
          Number(this.totalDepositDriverPackage) +
          Number(this.totalDepositDriverPassenger) +
          Number(this.totalPackagePaidMalang) +
          Number(this.totalPackageCodSurabaya);

        this.totalCashOutMalangDaily =
          Number(this.totalCostMalang) + Number(this.cashoutCourierSurabaya) + Number(this.cashoutOnderdilService);
        this.totalDepositMalangDaily = Number(this.totalCashInMalangDaily) - Number(this.totalCashOutMalangDaily);

        this.totalCashInSurabayaDaily =
          Number(this.totalPackagePaidSurabaya) +
          Number(this.totalPackageCodMalang) +
          Number(this.totalPassengerPaidSurabaya);

        console.log(this.cashoutCourierMalang);
        this.totalCashOutSurabayaDaily = Number(this.totalCostSurabaya) + Number(this.cashoutCourierMalang);
        this.totalDepositSurabayaDaily = Number(this.totalCashInSurabayaDaily) - Number(this.totalCashOutSurabayaDaily);

        this.totalDepositDaily = Number(this.totalDepositMalangDaily) + Number(this.totalDepositSurabayaDaily);

        // Count tab monthly
        const dataMonthly = this.data?.packages_monthly;
        this.dataLunasMonthly = this.data?.packages_monthly
          ?.filter((item: any) => item !== null)
          .sort((a: any, b: any) => {
            if (dataMonthly.includes(a) && !dataMonthly.includes(b)) return -1;
            if (!dataMonthly.includes(a) && dataMonthly.includes(b)) return 1;
            return new Date(a?.created_at).getTime() - new Date(b?.created_at).getTime();
          });
        console.log(this.dataLunasMonthly);

        const dataLunasMonthlyPaid = this.dataLunasMonthly.filter(
          (data: PackageModel) => data?.payment !== null || data?.payment !== 0
        );
        this.totalDataLunasMonthlyPaid = this.utils.sumTotal(
          dataLunasMonthlyPaid?.map((data: PackageModel) => data?.payment)
        );

        const dataLunasMonthlyNotPaid = this.dataLunasMonthly.filter(
          (data: PackageModel) => data?.payment == null || data?.payment === 0
        );
        this.totalDataLunasMonthlyNotPaid = this.utils.sumTotal(
          dataLunasMonthlyNotPaid?.map((data: PackageModel) => data?.cost)
        );

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  getIndex(i: number): number {
    return (this.pagination.offset - 1) * this.pagination.limit + (i + 1);
  }

  async openModalEdit(event: PackageModel) {
    console.log(event);
    const updatePayment: any = {
      package_id: event.package_id,
      go_send_id: event.go_send_id,
      resi_number: event.resi_number,
      payment: event.cost,
    };

    this.translate
      .get(['SWAL.ARE_YOU_SURE', 'SWAL.REVERT_WARNING', 'SWAL.YES_PAID', 'SWAL.BACK_BUTTON'])
      .subscribe((translations) => {
        Swal.fire({
          title: translations['SWAL.ARE_YOU_SURE'],
          text: translations['SWAL.REVERT_WARNING'],
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#22D868FF',
          cancelButtonColor: '#3085d6',
          confirmButtonText: translations['SWAL.YES_PAID'],
          cancelButtonText: translations['SWAL.BACK_BUTTON'],
        }).then((result) => {
          if (result.isConfirmed) {
            // edit package
            this.isLoading = true;
            this.packageService
              .patch(updatePayment)
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
                      duration: 5000,
                    });

                    this.dataListDeposit();
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
        });
      });
  }

  private dataListGosend(): Observable<void> {
    const params = {
      limit: 10000,
      page: 1,
      search: '',
      startDate: this.startDate,
      endDate: this.endDate,
      city: '',
      status: 'Done',
    };

    return this.packageService.listSP(params).pipe(
      takeUntil(this.ngUnsubscribe),
      map((response: any) => {
        this.dataDeposit = response.data;

        this.totalDepositDriverPackage = this.utils.sumTotal(
          this.dataDeposit?.map((data: any) => data?.totalDepositDriverPackage)
        );
        this.totalDepositDriverPassenger = this.utils.sumTotal(
          this.dataDeposit?.map((data: any) => data?.totalDepositDriverPassenger)
        );
      }),
      catchError((err) => {
        console.error('Error in dataListPackage:', err);
        return of();
      })
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('data-deposit');
    sessionStorage.removeItem('data-garage');
    sessionStorage.removeItem('data-deposit-sby');
    sessionStorage.removeItem('data-cashout-sby');
    sessionStorage.removeItem('data-comba');
  }
}
