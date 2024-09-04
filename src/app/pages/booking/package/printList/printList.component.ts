import { Component, OnDestroy, OnInit } from '@angular/core';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

interface GroupedDataCost {
  id: number;
  admin: string;
  totalCost: number;
}

@Component({
  selector: 'app-printList',
  templateUrl: './printList.component.html',
  styleUrls: ['./printList.component.scss'],
})
export class PrintListPackageComponent implements OnInit, OnDestroy {
  public data: any;
  public city: any;
  public groupAdmin: any;

  public fromDate: any;
  public endDate: any;
  public nowDate!: Date;

  public totalCost: any;
  public totalKoli: any;

  public configuration: Config = { ...DefaultConfig };
  public columns!: Columns[];

  constructor() {}

  ngOnInit() {
    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = false;
    this.configuration.paginationEnabled = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'cost', title: 'Cost' },
      { key: 'origin_from', title: 'Status Package' },
      { key: 'status', title: 'Status Payment' },
      { key: 'level', title: 'Level' },
      { key: 'description', title: 'Description' },
      { key: 'koli', title: 'Koli' },
      { key: 'book_date', title: 'Send Date' },
      { key: 'created_by', title: 'Admin' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'createdAt', title: 'Book Date' },
    ];

    this.nowDate = new Date();
    this.getPrint();
  }

  getPrint() {
    const getCity: any = sessionStorage.getItem('city');
    const objDataCity = JSON.parse(getCity);
    const getDataDate: any = sessionStorage.getItem('printlistdate');
    const objDataDate = JSON.parse(getDataDate);
    const getData: any = sessionStorage.getItem('printlist');
    const objData = JSON.parse(getData);
    console.log(objData);

    this.city = objDataCity;
    const dateStart = objDataDate.fromDate;
    this.fromDate = dateStart?.split(' ')[0];
    console.log(this.fromDate);
    const dateEnd = objDataDate.toDate;
    this.endDate = dateEnd?.split(' ')[0];
    console.log(this.endDate);

    this.data = objData;
    this.totalCost = this.data?.reduce((acc: any, item: any) => acc + Number(item?.cost), 0);
    this.totalKoli = this.data?.reduce((acc: any, item: any) => acc + Number(item?.koli), 0);

    const groupedDataCost: GroupedDataCost[] = Object.values(
      this.data.reduce((acc: any, item: any) => {
        if (!acc[item.created_by]) {
          acc[item.created_by] = { id: Object.keys(acc).length + 1, admin: item.created_by, totalCost: 0 };
        }
        acc[item.created_by].totalCost += Number(item.cost);
        return acc;
      }, {} as { [key: string]: GroupedDataCost })
    );
    this.groupAdmin = groupedDataCost;
    console.log(groupedDataCost);
  }

  ngOnDestroy() {
    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlist');
    sessionStorage.removeItem('printlistdate');
  }
}
