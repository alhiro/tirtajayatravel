import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
  selector: 'app-printsp',
  templateUrl: './printsp.component.html',
  styleUrls: ['./printsp.component.scss'],
})
export class PrintspComponent implements OnInit {
  public data: any;
  public dataPackages: any;

  public configuration: Config = { ...DefaultConfig };
  public columnsPackage!: Columns[];

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
    const currentState = this.router.lastSuccessfulNavigation;
    this.data = currentState?.extras.state?.['data'];
    this.dataPackages = this.data['packages'];
    this.totalCost = this.dataPackages.reduce((acc: any, item: any) => acc + item.cost, 0);
    this.totalKoli = this.dataPackages.reduce((acc: any, item: any) => acc + item.koli, 0);
    console.log(this.totalCost);
    console.log(this.data);
    console.log(this.dataPackages);
  }
}
