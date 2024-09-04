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

  constructor(private router: Router) {}

  ngOnInit() {
    this.getPrintSP();

    this.nowDate = new Date();

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = false;
    this.configuration.paginationEnabled = false;
    this.configuration.orderEnabled = false;

    this.columnsPassenger = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'sp_package', title: 'SP' },
      { key: 'waybill_id', title: 'Waybill' },
      { key: 'destination_id', title: 'Destination' },
      { key: 'status', title: 'Status' },
      { key: 'position', title: 'Seat' },
    ];

    this.columnsPackage = [
      // { key: 'category_sub_id', title: 'No' },
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
    this.totalKoli = this.data?.reduce((acc: any, item: any) => acc + Number(item?.koli), 0);
    console.log(this.totalCost);
    console.log(this.data);
  }

  ngOnDestroy() {
    sessionStorage.removeItem('printsp');
    sessionStorage.removeItem('detailsp');
    sessionStorage.removeItem('type');
  }
}
