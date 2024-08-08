import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-printPackage',
  templateUrl: './printPackage.component.html',
  styleUrls: ['./printPackage.component.scss'],
})
export class PrintPackageComponent implements OnInit, OnDestroy {
  data: any;
  public nowDate!: Date;

  constructor() {}

  ngOnInit() {
    this.nowDate = new Date();
    this.getPrint();
  }

  getPrint() {
    // const currentState = this.router.lastSuccessfulNavigation;
    // this.data = currentState?.extras.state?.['data'];
    // this.dataPackages = this.data.employee?.['packages'];

    const getData: any = sessionStorage.getItem('printpackage');
    const objData = JSON.parse(getData);
    console.log(objData);

    this.data = objData;
  }

  ngOnDestroy() {
    sessionStorage.removeItem('printpackage');
  }
}
