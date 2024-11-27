import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '@app/@shared';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { CashoutModel } from '../../cashout/models/cashout.model';

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
  public totalOperationalDeposit: any;

  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public configuration: Config = { ...DefaultConfig };

  lastSegment: string = '';

  // end table package
  public totalPackagePaidSurabaya = 0;

  // end table passenger
  public totalPassengerPaidSurabaya = 0;

  // cashout
  public dataCashoutSurabaya: any;
  public totalCostSurabaya: any = 0;
  public cashoutCourierMalang = 0;

  // daily surabaya
  public totalCashInSurabayaDaily = 0;
  public totalCashOutSurabayaDaily = 0;
  public totalDepositSurabayaDaily = 0;

  public totalPackageCodMalang = 0;

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
      { key: '', title: 'No.' },
      { key: 'bsd', title: 'BSD Package' },
      { key: 'car_id', title: 'Driver' },
      { key: 'cost', title: 'Total' },
    ];

    this.columnsPassenger = [
      { key: '', title: 'No.' },
      { key: 'bsd_passenger', title: 'BSD Passenger' },
      { key: 'employee_id', title: 'Driver' },
      { key: 'tariff', title: 'Total' },
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
    console.log(objData);

    this.data = objData;

    this.totalOperationalDeposit =
      this.data?.totalDepositDriverPackage +
      this.data?.totalDepositDriverPassenger +
      this.data?.totalPackagePaidMalang +
      this.data?.totalPackagePaidSurabaya +
      this.data?.totalReminderPaymentTransfer +
      this.data?.totalPaymentMonthly;
  }

  getDataSby() {
    const getCashout: any = sessionStorage.getItem('data-cashout-sby');
    const dataCashout = JSON.parse(getCashout);
    const getData: any = sessionStorage.getItem('data-deposit-sby');
    const data = JSON.parse(getData);

    // cashout operational
    this.totalCostSurabaya = dataCashout;

    this.totalPackageCodMalang = data.reduce((acc: any, item: any) => acc + item.package_ba.total_ba_mlg, 0);

    this.totalPassengerPaidSurabaya = data.reduce(
      (acc: any, item: any) => acc + item.passenger_paid.total_lunas_sby,
      0
    );

    this.totalPackagePaidSurabaya = data.reduce((acc: any, item: any) => acc + item.package_paid.total_lunas_sby, 0);

    this.cashoutCourierMalang = data.reduce(
      (acc: any, item: any) => acc + item.package_commission.total_commission_mlg,
      0
    );

    this.totalCashInSurabayaDaily =
      Number(this.totalPackagePaidSurabaya) +
      Number(this.totalPackageCodMalang) +
      Number(this.totalPassengerPaidSurabaya);

    this.totalCashOutSurabayaDaily = Number(this.totalCostSurabaya) + Number(this.cashoutCourierMalang);
    this.totalDepositSurabayaDaily = Number(this.totalCashInSurabayaDaily) - Number(this.totalCashOutSurabayaDaily);
  }
}
