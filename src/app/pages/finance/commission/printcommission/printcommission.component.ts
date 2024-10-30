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
  public city: any;
  public status: any;
  public groupAdmin: any;

  public startDate: any;
  public endDate: any;
  public startDateDisplay: any;
  public endDateDisplay: any;
  public nowDate!: Date;

  public totalCost: any = 0;
  public totalKoli: any;

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
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'book_date', title: 'Send Date' },
      { key: 'cost', title: 'Cost' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'status', title: 'Status Payment' },
      { key: 'created_by', title: 'Admin' },
    ];

    this.nowDate = new Date();
    // this.getPrint();

    const getDataDate: any = sessionStorage.getItem('printlistdate');
    const objDataDate = JSON.parse(getDataDate);

    (this.city = objDataDate.city), (this.status = objDataDate.status), (this.startDate = objDataDate.fromDate);
    this.startDateDisplay = this.startDate?.split(' ')[0];
    this.endDate = objDataDate.toDate;
    this.endDateDisplay = this.endDate?.split(' ')[0];

    const params = {
      limit: '',
      page: '',
      search: objDataDate.search,
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.city,
      status: this.status,
    };
    this.dataListFilter(params);
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
          this.data = response.data?.filter(
            (data: PackageModel) =>
              data.city_id === this.city &&
              data.status_package === 'Completed' &&
              (data.status === 'Lunas (Kantor)' || data.status === 'Bayar Tujuan (COD)')
          );

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

          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.configuration.horizontalScroll = false;

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
