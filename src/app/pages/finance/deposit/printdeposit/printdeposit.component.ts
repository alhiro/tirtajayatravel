import { Component, OnInit } from '@angular/core';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
  selector: 'app-printdeposit',
  templateUrl: './printdeposit.component.html',
  styleUrls: ['./printdeposit.component.scss'],
})
export class PrintdepositComponent implements OnInit {
  public data: any;
  public totalOperationalDeposit: any;

  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public configuration: Config = { ...DefaultConfig };

  constructor() {}

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

    this.getData();
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
}
