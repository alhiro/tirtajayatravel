import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
  selector: 'app-printbsd',
  templateUrl: './printbsd.component.html',
  styleUrls: ['./printbsd.component.scss'],
})
export class PrintbsdComponent implements OnInit, OnDestroy {
  public data: any;
  public dataPackages: any;
  public dataPassengers: any;
  public type: any;

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

    const getData: any = sessionStorage.getItem('printbsd');
    const getType: any = sessionStorage.getItem('type');
    const objData = JSON.parse(getData);
    const objType = JSON.parse(getType);
    console.log(objData);
    console.log(objType);

    this.type = objType;
    this.data = objData;
    this.totalCost = this.data.reduce((acc: any, item: any) => acc + Number(item?.cost), 0);
    this.totalKoli = this.data.reduce((acc: any, item: any) => acc + Number(item?.koli), 0);
    console.log(this.totalCost);
    console.log(this.data);
  }

  ngOnDestroy() {
    sessionStorage.removeItem('printbsd');
    sessionStorage.removeItem('type');
  }
}
