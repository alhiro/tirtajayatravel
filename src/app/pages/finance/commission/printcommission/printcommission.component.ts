import { registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { ExtendedPaginationContext } from '@app/@shared/interfaces/pagination';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { PackageService } from '@app/pages/booking/package/package.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { finalize, Subject, takeUntil } from 'rxjs';
import localeId from '@angular/common/locales/id';
import { Router } from '@angular/router';
import { Utils } from '@app/@shared';

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
  public city_id!: number;

  public data: any;
  public dataBa: any;
  public dataPiutang: any;
  public dataMonthly: any;

  public city: any;
  public status: any;
  public username: any;

  public groupAdminCommission: any;
  public groupAdminCommissionTransfer: any;
  public groupAdminCommissionPiutang: any;
  public groupAdminCommissionBa: any;
  public groupAdminCommissionCustomerMonthly: any;
  public groupAdminPiutang: any;
  public groupAdminMonthly: any;

  public startDate: any;
  public endDate: any;
  public startDateDisplay: any;
  public endDateDisplay: any;
  public nowDate!: Date;

  public totalPiutang: any = 0;
  public totalCommission: any = 0;
  public totalCommissionTransfer: any = 0;
  public totalCommissionPackage: any = 0;
  public totalCommissionPiutang: any = 0;
  public totalCommissionBa: any = 0;
  public totalCommissionCustomerMonthly: any = 0;
  public totalMonthly: any = 0;

  public totalKoli: any = 0;
  public totalKoliBa: any = 0;
  public totalKoliPiutang: any = 0;
  public totalKoliMonthly: any = 0;

  public configuration: Config = { ...DefaultConfig };
  public columns!: Columns[];
  public columnsMonthly!: Columns[];

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
    private packageService: PackageService,
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

    this.columnsMonthly = [
      { key: '', title: 'No', width: '3%' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'book_date', title: 'Date' },
      { key: 'cost', title: 'Cost' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'status', title: 'Status Payment' },
      { key: 'sign', title: 'Admin' },
    ];

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

    const params = {
      limit: '',
      page: '',
      search: objDataDate.search,
      startDate: this.startDate,
      endDate: this.endDate,
      city: this.city,
      status: this.status,
      username: this.username,
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
        // Data commission status lunas & bayar tujuan
        // this.data = response.data?.filter(
        //   (data: PackageModel) =>
        //     data.status === 'Piutang' || data.status === 'Lunas (Kantor)' || data.status === 'Bayar Tujuan (COD)'
        // );

        // Data Lunas (Kantor)
        this.data = response?.data?.filter(
          (data: PackageModel) =>
            data.status === 'Lunas (Kantor)' ||
            data.status === 'Lunas (Transfer)' ||
            data.status === 'Piutang' ||
            data.status === 'Customer (Bulanan)'
        );

        const dataCash = response?.data?.filter((data: PackageModel) => data.status === 'Lunas (Kantor)');
        const dataCommission = dataCash?.filter((data: PackageModel) => data.check_sp === true);
        this.totalCommission = this.utils.sumTotal(dataCommission?.map((data: PackageModel) => data.agent_commission));

        const groupedDataCommission: GroupedDataCost[] = Object.values(
          dataCommission.reduce((acc: any, item: any) => {
            if (!acc[item.updated_by]) {
              acc[item.updated_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.updated_by,
                totalCost: 0,
                check_sp: item.check_sp,
                city_id: item.city_id,
              };
            }
            acc[item.updated_by].totalCost += Number(item.agent_commission);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminCommission = groupedDataCommission;
        console.log(groupedDataCommission);

        // Data Lunas (Transfer)
        const dataTransfer = response?.data?.filter((data: PackageModel) => data.status === 'Lunas (Transfer)');
        const dataCommissionTransfer = dataTransfer?.filter((data: PackageModel) => data.check_sp === true);
        this.totalCommissionTransfer = this.utils.sumTotal(
          dataCommissionTransfer?.map((data: PackageModel) => data.agent_commission)
        );

        const groupedDataCommissionTransfer: GroupedDataCost[] = Object.values(
          dataCommissionTransfer.reduce((acc: any, item: any) => {
            if (!acc[item.updated_by]) {
              acc[item.updated_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.updated_by,
                totalCost: 0,
                check_sp: item.check_sp,
                city_id: item.city_id,
              };
            }
            acc[item.updated_by].totalCost += Number(item.agent_commission);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminCommissionTransfer = groupedDataCommissionTransfer;
        console.log(groupedDataCommissionTransfer);

        // Data Piutang
        const dataBa = response?.data?.filter((data: PackageModel) => data.status === 'Piutang');
        const dataCommissionBa = dataBa?.filter((data: PackageModel) => data.check_sp === true);
        this.totalCommissionBa = this.utils.sumTotal(
          dataCommissionBa?.map((data: PackageModel) => data.agent_commission)
        );

        const groupedDataCommissionBa: GroupedDataCost[] = Object.values(
          dataCommissionBa.reduce((acc: any, item: any) => {
            if (!acc[item.updated_by]) {
              acc[item.updated_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.updated_by,
                totalCost: 0,
                check_sp: item.check_sp,
                city_id: item.city_id,
              };
            }
            acc[item.updated_by].totalCost += Number(item.agent_commission);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminCommissionBa = groupedDataCommissionBa;
        console.log(groupedDataCommissionBa);

        // Data Customer (Bulanan)
        const dataCustomerMonthly = response?.data?.filter(
          (data: PackageModel) => data.status === 'Customer (Bulanan)'
        );
        const dataCommissionCustomerMonthly = dataCustomerMonthly?.filter(
          (data: PackageModel) => data.check_sp === true
        );
        this.totalCommissionCustomerMonthly = this.utils.sumTotal(
          dataCommissionCustomerMonthly?.map((data: PackageModel) => data.agent_commission)
        );

        const groupedDataCommissionCustomerMonthly: GroupedDataCost[] = Object.values(
          dataCommissionCustomerMonthly.reduce((acc: any, item: any) => {
            if (!acc[item.updated_by]) {
              acc[item.updated_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.updated_by,
                totalCost: 0,
                check_sp: item.check_sp,
                city_id: item.city_id,
              };
            }
            acc[item.updated_by].totalCost += Number(item.agent_commission);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminCommissionCustomerMonthly = groupedDataCommissionCustomerMonthly;
        console.log(groupedDataCommissionCustomerMonthly);

        // Data ba
        this.dataPiutang = response.data?.filter((data: PackageModel) => data.status === 'Bayar Tujuan (COD)');

        const dataCommissionPiutang = this.dataPiutang?.filter((data: PackageModel) => data.check_payment === true);
        this.totalCommissionPiutang = this.utils.sumTotal(
          dataCommissionPiutang?.map((data: PackageModel) => data.agent_commission)
        );

        const groupedDataCommissionPiutang: GroupedDataCost[] = Object.values(
          dataCommissionPiutang.reduce((acc: any, item: any) => {
            if (!acc[item.updated_by]) {
              acc[item.updated_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.updated_by,
                totalCost: 0,
                check_sp: item.check_sp,
                city_id: item.city_id,
              };
            }
            acc[item.updated_by].totalCost += Number(item.agent_commission);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminCommissionPiutang = groupedDataCommissionPiutang;
        console.log(groupedDataCommissionPiutang);

        const dataPiutang = this.dataPiutang?.filter((data: PackageModel) => data.check_payment === true);
        this.totalPiutang = this.utils.sumTotal(dataPiutang?.map((data: PackageModel) => data.cost));
        this.totalKoliPiutang = this.dataPiutang?.length;

        const groupedDataPiutang: GroupedDataCost[] = Object.values(
          dataPiutang.reduce((acc: any, item: any) => {
            if (!acc[item.updated_by]) {
              acc[item.updated_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.updated_by,
                totalCost: 0,
                check_payment: item.check_payment,
                city_id: item.city_id,
              };
            }
            acc[item.updated_by].totalCost += Number(item.cost);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminPiutang = groupedDataPiutang;
        console.log(groupedDataPiutang);

        // Data bulanan
        this.dataMonthly = response.data?.filter((data: PackageModel) => data.status === 'Customer (Bulanan)');

        const dataMonthly = this.dataMonthly;
        this.totalMonthly = this.utils.sumTotal(dataMonthly?.map((data: PackageModel) => data.cost));
        this.totalKoliMonthly = this.dataMonthly?.length;

        const groupedDataMonthly: GroupedDataCost[] = Object.values(
          dataMonthly.reduce((acc: any, item: any) => {
            if (!acc[item.updated_by]) {
              acc[item.updated_by] = {
                id: Object.keys(acc).length + 1,
                admin: item.updated_by,
                totalCost: 0,
                check_sp: item.check_sp,
                city_id: item.city_id,
              };
            }
            acc[item.updated_by].totalCost += Number(item.cost);
            return acc;
          }, {} as { [key: string]: GroupedDataCost })
        );
        this.groupAdminMonthly = groupedDataMonthly;
        console.log(groupedDataMonthly);

        this.totalCommissionPackage =
          Number(this.totalCommission) +
          Number(this.totalCommissionTransfer) +
          +Number(this.totalCommissionBa) +
          Number(this.totalCommissionPiutang);

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
