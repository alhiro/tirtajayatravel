import { registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { ExtendedPaginationContext } from '@app/@shared/interfaces/pagination';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { PackageService } from '@app/pages/booking/package/package.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { finalize, Subject, takeUntil } from 'rxjs';
import localeId from '@angular/common/locales/id';

interface GroupedDataCost {
  id: number;
  admin: string;
  totalCost: number;
}

@Component({
  selector: 'app-printcommission',
  templateUrl: './printcommission.component.html',
  styleUrls: ['./printcommission.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'id' }],
})
export class PrintcommissionComponent implements OnInit, OnDestroy {
  public data: any;
  public dataPiutang: any;

  public city: any;
  public status: any;

  public groupAdminCommission: any;
  public groupAdminPiutang: any;

  public startDate: any;
  public endDate: any;
  public startDateDisplay: any;
  public endDateDisplay: any;
  public nowDate!: Date;

  public totalPiutang: any = 0;
  public totalCommission: any = 0;
  public totalKoli: any = 0;
  public totalKoliPiutang: any = 0;

  public configuration: Config = { ...DefaultConfig };
  public columns!: Columns[];

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
    city: '',
    status: 'Completed',
  };
  public params = {
    limit: '',
    page: '',
    search: '',
    startDate: '',
    endDate: '',
    city: '',
    status: 'Completed',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private packageService: PackageService, private readonly cdr: ChangeDetectorRef) {
    registerLocaleData(localeId, 'id');
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
      { key: 'book_date', title: 'Date' },
      { key: 'cost', title: 'Cost' },
      { key: 'agent_commission', title: 'Commission' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'status', title: 'Status Payment' },
      { key: 'sign', title: 'Admin' },
    ];

    this.nowDate = new Date();
    // this.getPrint();

    const getDataDate: any = sessionStorage.getItem('printlistdate');
    const objDataDate = JSON.parse(getDataDate);

    this.city = Number(objDataDate.city);
    this.status = objDataDate.status;
    this.startDate = objDataDate.fromDate;
    this.startDateDisplay = this.startDate?.split(' ')[0];
    this.endDate = objDataDate.toDate;
    this.endDateDisplay = this.endDate?.split(' ')[0];

    const params = {
      limit: '',
      page: '',
      search: objDataDate.search,
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.city === 1 ? 'Malang' : 'Surabaya',
      status: this.status,
      username: '',
    };
    this.dataListFilter(params);
  }

  getIndex(i: number): number {
    return (this.pagination.offset - 1) * this.pagination.limit + (i + 1);
  }

  private dataListFilter(params: ExtendedPaginationContext): void {
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
        // count malang or surabaya
        if (response.data.length > 0) {
          // Data commission status lunas & bayar tujuan
          // this.data = response.data?.filter(
          //   (data: PackageModel) =>
          //     data.status === 'Piutang' || data.status === 'Lunas (Kantor)' || data.status === 'Bayar Tujuan (COD)'
          // );

          this.data = response.data;
          this.totalKoli = this.data?.length;

          const dataCommission = response.data?.filter((data: any) => data.check_sp === true);
          this.totalCommission = dataCommission?.reduce(
            (acc: any, item: any) => acc + Number(item?.agent_commission),
            0
          );

          const groupedDataCommission: GroupedDataCost[] = Object.values(
            dataCommission.reduce((acc: any, item: any) => {
              if (!acc[item.updated_by]) {
                acc[item.updated_by] = {
                  id: Object.keys(acc).length + 1,
                  admin: item.updated_by,
                  totalCost: 0,
                  check_sp: item.check_sp,
                };
              }
              acc[item.updated_by].totalCost += Number(item.agent_commission);
              return acc;
            }, {} as { [key: string]: GroupedDataCost })
          );
          this.groupAdminCommission = groupedDataCommission;
          console.log(groupedDataCommission);

          // Data piutang status bayar tujuan
          this.dataPiutang = response.data?.filter(
            (data: PackageModel) => data.status === 'Piutang' || data.status === 'Bayar Tujuan (COD)'
          );

          const dataPiutang = this.dataPiutang?.filter((data: any) => data.check_payment === true);
          this.totalPiutang = dataPiutang?.reduce((acc: any, item: any) => acc + Number(item?.cost), 0);
          this.totalKoliPiutang = this.dataPiutang?.length;

          const groupedDataPiutang: GroupedDataCost[] = Object.values(
            dataPiutang.reduce((acc: any, item: any) => {
              if (!acc[item.updated_by]) {
                acc[item.updated_by] = {
                  id: Object.keys(acc).length + 1,
                  admin: item.updated_by,
                  totalCost: 0,
                  check_payment: item.check_payment,
                };
              }
              acc[item.updated_by].totalCost += Number(item.cost);
              return acc;
            }, {} as { [key: string]: GroupedDataCost })
          );
          this.groupAdminPiutang = groupedDataPiutang;
          console.log(groupedDataPiutang);

          this.configuration.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.data = [];
        }
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlistdate');
  }
}
