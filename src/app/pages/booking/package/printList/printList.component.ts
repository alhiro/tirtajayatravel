import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { finalize, takeUntil, Subject } from 'rxjs';
import { PackageService } from '../package.service';
import { PackageModel } from '../models/package.model';
import { Router } from '@angular/router';
import { Utils } from '@app/@shared';

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
  public dataDriver: any;

  public username!: string;
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
  public displayTitle: any = '';

  public totalCostTransfer: any = 0;
  public totalCostOffice: any = 0;
  public totalCostPiutang: any = 0;
  public totalCostBa: any = 0;
  public totalCostMonthly: any = 0;

  public configuration: Config = { ...DefaultConfig };
  public columns!: Columns[];
  public columnsDriver!: Columns[];

  public pagination = {
    limit: 5,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };

  public lastSegment = '';

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private packageService: PackageService,
    private router: Router,
    private utils: Utils,
    private readonly cdr: ChangeDetectorRef
  ) {
    const url = this.router.url;
    this.lastSegment = url.substring(url.lastIndexOf('/') + 1);
    console.log(this.lastSegment);
  }

  ngOnInit() {
    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
    this.configuration.paginationEnabled = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      { key: '', title: 'No', width: '3%' },
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
    ];

    this.columnsDriver = [
      { key: '', title: 'No', width: '5%' },
      { key: 'name', title: 'Nama Driver' },
      { key: 'send_date', title: 'Tanggal Kirim' },
      { key: 'total_packages', title: 'Jumlah Paket' },
      { key: 'total_cost', title: 'Nominal' },
    ];

    this.nowDate = new Date();
    // this.getPrint();

    const getDataDate: any = sessionStorage.getItem('printlistdate');
    const objDataDate = JSON.parse(getDataDate);

    this.username = objDataDate.username;
    this.city = objDataDate.city;
    this.status = objDataDate.status;
    this.startDate = objDataDate.fromDate;
    this.startDateDisplay = this.startDate?.split(' ')[0];
    this.endDate = objDataDate.toDate;
    this.endDateDisplay = this.endDate?.split(' ')[0];

    this.displayTitle = this.getListTitle(this.lastSegment, this.city, this.status);

    if (this.lastSegment === 'printlistuser') {
      const params = {
        limit: '',
        page: '',
        search: this.status,
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.city,
        status: '',
        username: this.username ? this.username : '',
      };
      this.dataListFilter(params);
    } else {
      const params = {
        limit: '',
        page: '',
        search: this.status,
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.city,
        status: '',
        username: '',
      };
      this.dataListFilter(params);
    }
  }

  getIndex(i: number): number {
    return (this.pagination.offset - 1) * this.pagination.limit + (i + 1);
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

          // if (this.lastSegment === 'printbayartujuan') {
          //   // filter base bayar tujuan url
          //   filterData = response.data?.filter(
          //     (data: PackageModel) => data.status === 'Bayar Tujuan (COD)' && data.status_package !== 'Cancel'
          //   );
          // } else {
          //   // filter base package url
          //   filterData = response.data?.filter((data: PackageModel) => data.status_package !== 'Cancel');
          // }

          this.data = response.data;

          filterData = response.data?.filter((data: PackageModel) => data.status_package !== 'Cancel');

          const uniqueDrivers = Object?.values(
            filterData
              ?.filter((item: any) => item?.go_send) // Keep only items with a driver
              .reduce((acc: any, item: any) => {
                const { go_send_id, send_date, total_cost, total_packages, employee } = item?.go_send;
                if (!acc[go_send_id]) {
                  acc[go_send_id] = { go_send_id, send_date, total_cost, total_packages, employee }; // Add driver to accumulator if not already present
                }
                return acc;
              }, {})
          );

          this.dataDriver = uniqueDrivers;
          console.log(this.dataDriver);

          // Count calculation total package except cancel
          // const totalCost = filterData.filter((data: PackageModel) => data.go_send_id != null);
          this.totalCost = this.utils.sumTotal(filterData?.map((data: any) => data.cost));
          // this.totalCost = filterData?.reduce((acc: any, item: any) => acc + Number(item?.cost), 0);
          // this.totalKoli = filterData?.reduce((acc: any, item: any) => acc + Number(item?.koli), 0);

          const totals = filterData?.reduce(
            (acc: any, data: PackageModel) => {
              const cost = Number(data.cost) || 0;
              switch (data.status) {
                case 'Lunas (Transfer)':
                  acc.totalCostTransfer += cost;
                  break;
                case 'Lunas (Kantor)':
                  acc.totalCostOffice += cost;
                  break;
                case 'Piutang':
                  acc.totalCostPiutang += cost;
                  break;
                case 'Bayar Tujuan (COD)':
                  acc.totalCostBa += cost;
                  break;
                case 'Customer (Bulanan)':
                  acc.totalCostMonthly += cost;
                  break;
              }

              return acc;
            },
            {
              totalCostTransfer: 0,
              totalCostOffice: 0,
              totalCostPiutang: 0,
              totalCostBa: 0,
              totalCostMonthly: 0,
            }
          );

          this.totalCostTransfer = this.utils.sumTotal([totals.totalCostTransfer]);
          this.totalCostOffice = this.utils.sumTotal([totals.totalCostOffice]);
          this.totalCostPiutang = this.utils.sumTotal([totals.totalCostPiutang]);
          this.totalCostBa = this.utils.sumTotal([totals.totalCostBa]);
          this.totalCostMonthly = this.utils.sumTotal([totals.totalCostMonthly]);

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
          console.log(this.groupAdmin);

          // const uniqueDrivers = Object?.values(
          //   filterData
          //     ?.filter((item: any) => item?.go_send) // Keep only items with a driver
          //     .reduce((acc: any, item: any) => {
          //       const { go_send_id, send_date, total_cost, total_packages, employee } = item?.go_send;
          //       if (!acc[go_send_id]) {
          //         acc[go_send_id] = { go_send_id, send_date, total_cost, total_packages, employee }; // Add driver to accumulator if not already present
          //       }
          //       return acc;
          //     }, {})
          // );

          this.configuration.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.data = [];
        }
      });
  }

  getListTitle(lastSegment: string, city: string, status: string): string {
    if (lastSegment === 'printbayartujuan') {
      if (city === 'Malang') {
        return 'DAFTAR PAKET BAYAR TUJUAN (BA) MALANG';
      } else if (city === 'Surabaya') {
        return 'DAFTAR PAKET BAYAR TUJUAN (BA) SURABAYA';
      }
    } else {
      if (city === 'Malang') {
        if (this.username) {
          return status === 'Lunas (Kantor)'
            ? `DAFTAR LUNAS PAKET MALANG (${this.username})`
            : 'DAFTAR SEMUA PAKET MALANG';
        } else {
          return status === 'Lunas (Kantor)' ? 'DAFTAR LUNAS SEMUA PAKET MALANG' : 'DAFTAR SEMUA PAKET MALANG';
        }
      } else if (city === 'Surabaya') {
        if (this.username) {
          return status === 'Lunas (Kantor)'
            ? `DAFTAR LUNAS PAKET SURABAYA (${this.username})`
            : 'DAFTAR SEMUA PAKET SURABAYA';
        } else {
          return status === 'Lunas (Kantor)' ? 'DAFTAR LUNAS SEMUA PAKET SURABAYA' : 'DAFTAR SEMUA PAKET SURABAYA';
        }
      } else {
        if (status === 'Customer (Bulanan)') {
          return 'DAFTAR CUSTOMER (BULANAN)';
        } else if (status === 'Lunas (Transfer)') {
          return 'DAFTAR LUNAS (TRANSFER)';
        }
      }
    }
    return '';
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
