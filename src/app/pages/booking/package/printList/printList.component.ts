import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { finalize, takeUntil, Subject } from 'rxjs';
import { PackageService } from '../package.service';
import { PackageModel } from '../models/package.model';

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
  public status: any;
  public groupAdmin: any;

  public startDate: any;
  public endDate: any;
  public startDateDisplay: any;
  public endDateDisplay: any;
  public nowDate!: Date;

  public totalCost: any = 0;
  public totalKoli: any = 0;

  public configuration: Config = { ...DefaultConfig };
  public columns!: Columns[];

  public pagination = {
    limit: 5,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private packageService: PackageService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
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
    // this.getPrint();

    const getDataDate: any = sessionStorage.getItem('printlistdate');
    const objDataDate = JSON.parse(getDataDate);

    this.city = objDataDate.city;
    this.status = objDataDate.status;
    this.startDate = objDataDate.fromDate;
    this.startDateDisplay = this.startDate?.split(' ')[0];
    this.endDate = objDataDate.toDate;
    this.endDateDisplay = this.endDate?.split(' ')[0];

    const params = {
      limit: '',
      page: '',
      search: '',
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.city,
      status: '',
    };
    this.dataListFilter(params);
  }

  private dataListFilter(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listAll(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response.data.length > 0) {
          let filterData;
          if (this.status === 'Lunas (Kantor)') {
            filterData = response.data?.filter(
              (data: PackageModel) => data.status === 'Lunas (Kantor)' && data.status_package !== 'Cancel'
            );
            this.data = filterData;
          } else {
            filterData = response.data?.filter((data: PackageModel) => data.status_package !== 'Cancel');
            this.data = response.data;
          }

          // Count calculation total package except cancel
          this.totalCost = filterData?.reduce((acc: any, item: any) => acc + Number(item?.cost), 0);
          this.totalKoli = filterData?.reduce((acc: any, item: any) => acc + Number(item?.koli), 0);

          const groupedDataCost: GroupedDataCost[] = Object.values(
            filterData.reduce((acc: any, item: any) => {
              if (!acc[item.created_by]) {
                acc[item.created_by] = { id: Object.keys(acc).length + 1, admin: item.created_by, totalCost: 0 };
              }
              acc[item.created_by].totalCost += Number(item.cost);
              return acc;
            }, {} as { [key: string]: GroupedDataCost })
          );
          this.groupAdmin = groupedDataCost;
          console.log(groupedDataCost);

          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.configuration.horizontalScroll = false;

          this.data = [];
        }
      });
  }

  // getPrint() {
  //   const getCity: any = sessionStorage.getItem('city');
  //   const objDataCity = JSON.parse(getCity);
  //   const getDataDate: any = sessionStorage.getItem('printlistdate');
  //   const objDataDate = JSON.parse(getDataDate);
  //   const getData: any = sessionStorage.getItem('printlist');
  //   const objData = JSON.parse(getData);
  //   console.log(objData);

  //   this.city = objDataCity;
  //   const dateStart = objDataDate.startDate;
  //   this.startDate = dateStart?.split(' ')[0];
  //   console.log(this.startDate);
  //   const dateEnd = objDataDate.toDate;
  //   this.endDate = dateEnd?.split(' ')[0];
  //   console.log(this.endDate);

  //   this.data = objData;
  //   this.totalCost = this.data?.reduce((acc: any, item: any) => acc + Number(item?.cost), 0);
  //   this.totalKoli = this.data?.reduce((acc: any, item: any) => acc + Number(item?.koli), 0);

  //   const groupedDataCost: GroupedDataCost[] = Object.values(
  //     this.data.reduce((acc: any, item: any) => {
  //       if (!acc[item.created_by]) {
  //         acc[item.created_by] = { id: Object.keys(acc).length + 1, admin: item.created_by, totalCost: 0 };
  //       }
  //       acc[item.created_by].totalCost += Number(item.cost);
  //       return acc;
  //     }, {} as { [key: string]: GroupedDataCost })
  //   );
  //   this.groupAdmin = groupedDataCost;
  //   console.log(groupedDataCost);
  // }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlist');
    sessionStorage.removeItem('printlistdate');
  }
}
