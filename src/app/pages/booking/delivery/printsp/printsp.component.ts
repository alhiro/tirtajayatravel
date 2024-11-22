import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
  selector: 'app-printsp',
  templateUrl: './printsp.component.html',
  styleUrls: ['./printsp.component.scss'],
})
export class PrintspComponent implements OnInit, OnDestroy {
  public data: any;
  public dataPackages: any;
  public dataPassengers: any;
  public type: any;
  public detail: any;

  public configuration: Config = { ...DefaultConfig };
  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public nowDate!: Date;

  public totalCost: any;
  public totalKoli: any;
  public totalTariff: any;
  public totalPassenger: any;

  lastSegment: string = '';

  constructor(private router: Router) {
    const url = this.router.url;
    this.lastSegment = url.substring(url.lastIndexOf('/') + 1);
    console.log(this.lastSegment);
  }

  ngOnInit() {
    document.documentElement.setAttribute('data-bs-theme', 'light');

    this.getPrintSP();

    this.nowDate = new Date();

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;

    this.configuration.paginationEnabled = false;
    this.configuration.orderEnabled = false;

    this.columnsPassenger = [
      { key: '', title: 'No', width: '3%' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'waybill_id', title: 'Waybill' },
      { key: 'destination_id', title: 'Destination' },
      { key: 'tariff', title: 'Tariff' },
      { key: 'status', title: 'Status' },
      { key: 'total_passenger', title: 'Total Passenger' },
      { key: 'position', title: 'Seat' },
      { key: 'description', title: 'Description' },
    ];

    this.columnsPackage = [
      { key: '', title: 'No', width: '3%' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'address', title: 'Address' },
      { key: 'cost', title: 'Cost' },
      { key: 'note', title: 'Status Item' },
      { key: 'status', title: 'status Payment' },
      { key: 'koli', title: 'Koli' },
      { key: 'description', title: 'Description' },
    ];
  }

  getPrintSP() {
    // const currentState = this.router.lastSuccessfulNavigation;
    // this.data = currentState?.extras.state?.['data'];
    // this.dataPackages = this.data.employee?.['packages'];

    const getData: any = sessionStorage.getItem('printsp');
    const getType: any = sessionStorage.getItem('type');
    const getDetail: any = sessionStorage.getItem('detailsp');
    const objData = JSON.parse(getData);
    const objType = JSON.parse(getType);
    const objDetail = JSON.parse(getDetail);
    console.log(objData);
    console.log(objType);
    console.log(objDetail);

    this.detail = objDetail;
    this.type = objType;
    this.data = objData;

    this.totalCost = this.data?.reduce((acc: any, item: any) => acc + Number(item?.cost), 0);
    // this.totalKoli = this.data?.reduce((acc: any, item: any) => acc + Number(item?.koli), 0);

    this.totalTariff = this.data?.reduce((acc: any, item: any) => acc + Number(item?.tariff), 0);
    // this.totalPassenger = this.data?.reduce((acc: any, item: any) => acc + Number(item?.total_passenger), 0);
    console.log(this.totalCost);
    console.log(this.data);
  }

  ngOnDestroy() {
    sessionStorage.removeItem('printsp');
    sessionStorage.removeItem('detailsp');
    sessionStorage.removeItem('type');
  }
}
