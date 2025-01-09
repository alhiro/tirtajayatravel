import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '@app/@shared';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { CashoutModel } from '../../cashout/models/cashout.model';
import { PackageModel } from '@app/pages/booking/package/models/package.model';

@Component({
  selector: 'app-printdeposit',
  templateUrl: './printdeposit.component.html',
  styleUrls: ['./printdeposit.component.scss'],
})
export class PrintdepositComponent implements OnInit {
  public levelrule!: number;
  public city_id!: number;
  public username!: string;

  public data: any;
  public dataPackage: any;
  public dataCashout: any;
  public detailDataPackage: any;
  public dataPackageBaMlg: any;
  public dataPackageMlg: any;

  public totalOperationalDeposit: any;

  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public configuration: Config = { ...DefaultConfig };

  lastSegment: string = '';

  public dataDeposit: any;

  // table package
  public totalCost = 0;
  public totalCommissionPackage = 0;
  public totalParkingPackage = 0;
  public totalDebetPackage = 0;
  public totalKreditPackage = 0;
  public totalDepositDriverPackage = 0;
  public totalDepositDriverPassenger = 0;
  // end table package
  public totalPackagePaidMalang = 0;
  public totalPackagePaidSurabaya = 0;
  public totalPackageCodMalang = 0;
  public totalPackageCod = 0;
  public totalReminderPaymentPackage = 0;

  // cashout
  public dataCashoutSurabaya: any;
  public totalCostSurabaya: any = 0;
  public cashoutCourierMalang = 0;

  // daily surabaya
  public totalCashInSurabayaDaily = 0;
  public totalCashOutSurabayaDaily = 0;
  public totalDepositSurabayaDaily = 0;

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
  public totalCostMalang: any = 0;
  public cashoutOnderdilService = 0;
  public cashoutCourier = 0;
  public cashoutCourierSurabaya = 0;

  // daily malang
  public totalCashInMalangDaily = 0;
  public totalCashOutMalangDaily = 0;
  public totalDepositMalangDaily = 0;

  public totalDepositDaily = 0;

  public dataDate: any;

  constructor(private utils: Utils, private router: Router) {
    const url = this.router.url;
    this.lastSegment = url.substring(url.lastIndexOf('/') + 1);
    console.log(this.lastSegment);

    this.levelrule = this.utils.getLevel();
    this.city_id = this.utils.getCity();
    this.username = this.utils.getUsername();
  }

  ngOnInit() {
    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.paginationEnabled = false;
    this.configuration.rows = 100;
    this.configuration.orderEnabled = false;

    this.columnsPackage = [
      { key: '', title: 'No.', width: '5%' },
      { key: 'bsd', title: 'BSD Package', width: '35%' },
      { key: 'car_id', title: 'Driver', width: '20%' },
      { key: 'cost', title: 'Total', width: '40%' },
    ];

    this.columnsPassenger = [
      { key: '', title: 'No.', width: '5%' },
      { key: 'bsd_passenger', title: 'BSD Passenger', width: '35%' },
      { key: 'employee_id', title: 'Driver', width: '20%' },
      { key: 'tariff', title: 'Total', width: '40%' },
    ];

    if (this.lastSegment === 'printdailysby') {
      this.getDataSby();
    } else {
      this.getData();
    }
  }

  getData() {
    const getData: any = sessionStorage.getItem('data-deposit');
    const objData = JSON.parse(getData);
    const getDataComba: any = sessionStorage.getItem('data-comba');
    const dataComba = JSON.parse(getDataComba);

    this.dataDeposit = objData;
    this.totalCostMalang = dataComba?.totalCostMalang;
    this.totalCostSurabaya = dataComba?.totalCostSurabaya;
    this.totalPackagePaidMalang = dataComba?.totalPackagePaidMalang;
    this.totalPackagePaidSurabaya = dataComba?.totalPackagePaidSurabaya;
    this.totalPackageCodMalang = dataComba?.bayarTujuanMalang;
    this.totalPackageCodSurabaya = dataComba?.bayarTujuanSurabaya;
    this.totalPassengerPaidMalang = dataComba?.totalPassengerPaidMalang;
    this.totalPassengerPaidSurabaya = dataComba?.totalPassengerPaidSurabaya;
    this.piutangTransition = dataComba?.piutangTransition;
    this.totalCostMalang = dataComba?.totalCostMalang;
    this.totalCostSurabaya = dataComba?.totalCostSurabaya;
    this.cashoutOnderdilService = dataComba?.cashoutOnderdilService;
    this.cashoutCourierMalang = dataComba?.pengeluaranKomisiMalang;
    this.cashoutCourierSurabaya = dataComba?.pengeluaranKomisiSurabaya;
    this.totalReminderPaymentTransfer = dataComba?.totalReminderPaymentTransfer;
    this.totalPaymentMonthly = dataComba?.totalPaymentMonthly;
    this.totalCashInMalangDaily = dataComba?.totalCashInMalangDaily;
    this.totalCashOutMalangDaily = dataComba?.totalCashOutMalangDaily;
    this.totalDepositMalangDaily = dataComba?.totalDepositMalangDaily;
    this.totalCashInSurabayaDaily = dataComba?.totalCashInSurabayaDaily;
    this.totalCashOutSurabayaDaily = dataComba?.totalCashOutSurabayaDaily;
    this.totalDepositSurabayaDaily = dataComba?.totalDepositSurabayaDaily;
    this.totalDepositDaily = dataComba?.totalDepositDaily;

    this.totalDepositDriverPackage = dataComba?.totalDepositDriverPackage;
    this.totalDepositDriverPassenger = dataComba?.totalDepositDriverPassenger;

    const safeNumber = (value: Number) => Number(value) || 0;

    this.totalOperationalDeposit =
      safeNumber(this.totalDepositDriverPackage) +
      safeNumber(this.totalDepositDriverPassenger) +
      safeNumber(this.totalPackagePaidMalang) +
      safeNumber(this.totalPackagePaidSurabaya) +
      safeNumber(this.totalReminderPaymentTransfer) +
      safeNumber(this.totalPaymentMonthly);
  }

  getDataSby() {
    const getCashoutSby: any = sessionStorage.getItem('data-cashout-sby');
    const dataCashoutSby = JSON.parse(getCashoutSby);
    const getDataComba: any = sessionStorage.getItem('data-comba');
    const dataComba = JSON.parse(getDataComba);
    const getDataDate: any = sessionStorage.getItem('printlistdate');
    this.dataDate = JSON.parse(getDataDate);

    // Check ba & commission
    const detailDataPackage = Array.from(
      dataComba?.data
        .flatMap((item: any) => item?.standalone_packages)
        .reduce((map: any, packageItem: PackageModel) => {
          if (!map.has(packageItem?.package_id)) {
            map.set(packageItem?.package_id, packageItem);
          }
          return map;
        }, new Map())
        .values()
    );
    console.log(detailDataPackage);
    this.detailDataPackage = detailDataPackage;

    this.dataPackageMlg = this.detailDataPackage?.filter(
      (data: PackageModel) => data?.check_sp === true && data?.city_id === 1
    );
    this.dataPackageBaMlg = this.detailDataPackage?.filter(
      (data: PackageModel) =>
        data?.status === 'Bayar Tujuan (COD)' && data.check_payment === true && data?.city_id === 1
    );

    this.dataPackage = dataComba?.data;
    this.dataCashout = dataComba?.datacashout;

    // cashout operational
    this.totalCostSurabaya = dataCashoutSby;

    this.totalPackageCodMalang = dataComba?.bayarTujuanMalang;
    this.cashoutCourierMalang = dataComba?.pengeluaranKomisiMalang;

    this.totalPassengerPaidSurabaya = 0;
    this.totalPackagePaidSurabaya = dataComba?.pengeluaranLunasSurabaya;

    this.totalCashInSurabayaDaily =
      Number(this.totalPackagePaidSurabaya) +
      Number(this.totalPackageCodMalang) +
      Number(this.totalPassengerPaidSurabaya);

    this.totalCashOutSurabayaDaily = Number(this.totalCostSurabaya) + Number(this.cashoutCourierMalang);
    this.totalDepositSurabayaDaily = Number(this.totalCashInSurabayaDaily) - Number(this.totalCashOutSurabayaDaily);
  }
}
