import { registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { PackageService } from '@app/pages/booking/package/package.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { finalize, Subject, takeUntil } from 'rxjs';
import localeId from '@angular/common/locales/id';
import { Router } from '@angular/router';
import { Utils } from '@app/@shared';
import { CashoutService } from '../cashout.service';
import { CashoutModel } from '../models/cashout.model';
import { ScheduleService } from '@app/pages/garage/schedule/schedule.service';
import { ScheduleModel } from '@app/pages/garage/schedule/models/schedule.model';

interface GroupedDataCost {
  id: number;
  admin: string;
  totalCost: number;
}

@Component({
  selector: 'app-printcashout',
  templateUrl: './printcashout.component.html',
  styleUrls: ['./printcashout.component.scss'],
})
export class PrintcashoutComponent implements OnInit {
  public city_id!: number;

  public data: any;
  public dataBa: any;
  public dataPiutang: any;
  public dataMonthly: any;
  public dataOnderdil: any;

  public city: any;
  public status: any;
  public username: any;

  public groupAdminCommission: any;
  public groupAdminPiutang: any;
  public groupAdminMonthly: any;
  public groupAdminOnderdil: any;

  public startDate: any;
  public endDate: any;
  public startDateDisplay: any;
  public endDateDisplay: any;
  public nowDate!: Date;

  public totalPiutang: any = 0;
  public totalCashout: any = 0;
  public totalMonthly: any = 0;
  public totalOnderdil: any = 0;

  public totalKoli: any = 0;
  public totalKoliBa: any = 0;
  public totalKoliPiutang: any = 0;
  public totalKoliMonthly: any = 0;

  public configuration: Config = { ...DefaultConfig };
  public columns!: Columns[];
  public columnsOnderdil!: Columns[];

  lastSegment: string = '';

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
    city: '',
    status: '',
  };
  public params = {
    limit: '',
    page: '',
    search: '',
    startDate: '',
    endDate: '',
    city: '',
    status: '',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private cashoutService: CashoutService,
    private scheduleService: ScheduleService,
    private router: Router,
    private utils: Utils,
    private readonly cdr: ChangeDetectorRef
  ) {
    registerLocaleData(localeId, 'id');

    const url = this.router.url;
    this.lastSegment = url.substring(url.lastIndexOf('/') + 1);
    console.log(this.lastSegment);

    this.city_id = this.utils.getCity();
  }

  ngOnInit() {
    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
    this.configuration.paginationEnabled = false;
    this.configuration.orderEnabled = false;

    this.nowDate = new Date();
    // this.getPrint();

    const getDataDate: any = sessionStorage.getItem('printlistdate');
    const objDataDate = JSON.parse(getDataDate);
    console.log(objDataDate);

    this.city = objDataDate.city;
    this.status = objDataDate.status;
    this.startDate = objDataDate.fromDate;
    this.startDateDisplay = this.startDate?.split(' ')[0];
    this.endDate = objDataDate.toDate;
    this.endDateDisplay = this.endDate?.split(' ')[0];
    this.username = objDataDate.username;

    if (this.lastSegment === 'printonderdil') {
      this.columnsOnderdil = [
        { key: '', title: 'No', width: '3%' },
        { key: 'name', title: 'Name' },
        { key: 'service_date', title: 'Date' },
        { key: 'service', title: 'Service' },
        { key: 'description', title: 'Description' },
        { key: 'cost', title: 'Cost' },
        { key: 'createdAt', title: 'Created At' },
        { key: 'created_by', title: 'Admin' },
      ];

      const params = {
        limit: this.pagination.limit,
        page: this.pagination.offset,
        search: this.pagination.search,
        startDate: this.startDate,
        endDate: this.endDate,
      };
      this.dataListOnderdil(params);
    } else {
      this.columns = [
        { key: '', title: 'No', width: '3%' },
        { key: 'date', title: 'Date' },
        { key: 'type', title: 'Type' },
        { key: 'fee', title: 'Cost' },
        { key: 'description', title: 'Description' },
        { key: 'created_by', title: 'Admin' },
      ];

      const params = {
        limit: '',
        page: '',
        search: objDataDate.search,
        startDate: this.startDate,
        endDate: this.endDate,
        city: this.city,
      };
      this.dataListCashout(params);
    }
  }

  getIndex(i: number): number {
    return (this.pagination.offset - 1) * this.pagination.limit + (i + 1);
  }

  private dataListCashout(params: ExtendedPaginationContext): void {
    this.configuration.isLoading = true;
    this.cashoutService
      .listExtended(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        this.data = response?.data;
        this.totalCashout = this.utils.sumTotal(this.data?.map((data: CashoutModel) => data.fee));

        const groupedDataCommission: GroupedDataCost[] = Object.values(
          this.data.reduce((acc: any, item: any) => {
            if (!acc[item.created_by]) {
              acc[item.created_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.created_by,
                totalCost: 0,
                city_id: item.city_id,
              };
            }
            acc[item.created_by].totalCost += Number(item.fee);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminCommission = groupedDataCommission;
        console.log(groupedDataCommission);

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private dataListOnderdil(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.scheduleService
      .list(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        this.dataOnderdil = response?.data;
        this.totalOnderdil = this.utils.sumTotal(this.data?.map((data: ScheduleModel) => data.cost));

        const groupedDataCommission: GroupedDataCost[] = Object.values(
          this.dataOnderdil.reduce((acc: any, item: any) => {
            if (!acc[item.created_by]) {
              acc[item.created_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.created_by,
                totalCost: 0,
              };
            }
            acc[item.created_by].totalCost += Number(item.cost);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminOnderdil = groupedDataCommission;
        console.log(groupedDataCommission);

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlistdate');
  }
}
