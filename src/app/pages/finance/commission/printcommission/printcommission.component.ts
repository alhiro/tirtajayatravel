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

  public dataPiutangClick: any;
  public dataPiutangNoClick: any;
  public dataCommissionClick: any;
  public dataCommissionNoClick: any;

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

  public groupAdminCommissionNoClick: any;
  public groupAdminCommissionTransferNoClick: any;
  public groupAdminCommissionBaNoClick: any;
  public groupAdminCommissionCustomerMonthlyNoClick: any;
  public groupAdminCommissionPiutangNoClick: any;
  public groupAdminPiutangNoClick: any;

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

  public totalCommissionNoClick: any = 0;
  public totalCommissionTransferNoClick: any = 0;
  public totalCommissionBaNoClick: any = 0;
  public totalCommissionCustomerMonthlyNoClick: any = 0;
  public totalCommissionPiutangNoClick: any = 0;

  public totalCommissionPackageOnly: any = 0;
  public totalCommissionPackageOnlyNoClick: any = 0;

  public totalKoli: any = 0;
  public totalKoliBa: any = 0;
  public totalKoliPiutang: any = 0;
  public totalKoliMonthly: any = 0;

  public totalPiutangNoClick: any = 0;
  public totalKoliPiutangNoClick: any = 0;

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
      { key: 'book_date', title: 'Date' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'sender_id', title: 'Sender' },
      { key: 'recipient_id', title: 'Recipient' },
      { key: 'cost', title: 'Cost' },
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
        const data = response?.data?.filter(
          (data: PackageModel) =>
            data.status === 'Lunas (Kantor)' ||
            data.status === 'Lunas (Transfer)' ||
            data.status === 'Piutang' ||
            data.status === 'Customer (Bulanan)'
        );
        this.data = data;

        this.dataCommissionClick = data?.filter((data: PackageModel) => data.check_sp === true);
        this.dataCommissionNoClick = data?.filter((data: PackageModel) => data.check_sp == null);

        const dataCash = response?.data?.filter((data: PackageModel) => data.status === 'Lunas (Kantor)');
        const dataCommission = dataCash?.filter((data: PackageModel) => data.check_sp === true);
        this.totalCommission = this.utils.sumTotal(
          dataCommission?.map((data: PackageModel) => (data?.discount ? data.discount * 0.15 : data.agent_commission))
        );

        const dataCommissionNoClick = dataCash?.filter((data: PackageModel) => data.check_sp == null);
        this.totalCommissionNoClick = this.utils.sumTotal(
          dataCommissionNoClick?.map((data: PackageModel) => data.agent_commission)
        );

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

        const groupedDataCommissionNoClick: GroupedDataCost[] = Object.values(
          dataCommissionNoClick.reduce((acc: any, item: any) => {
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
        this.groupAdminCommissionNoClick = groupedDataCommissionNoClick;
        console.log(groupedDataCommissionNoClick);

        // Data Lunas (Transfer)
        const dataTransfer = response?.data?.filter((data: PackageModel) => data.status === 'Lunas (Transfer)');
        const dataCommissionTransfer = dataTransfer?.filter((data: PackageModel) => data.check_sp === true);
        this.totalCommissionTransfer = this.utils.sumTotal(
          dataCommissionTransfer?.map((data: PackageModel) =>
            data?.discount ? data.discount * 0.15 : data.agent_commission
          )
        );

        const dataCommissionTransferNoClick = dataTransfer?.filter((data: PackageModel) => data.check_sp == null);
        this.totalCommissionTransferNoClick = this.utils.sumTotal(
          dataCommissionTransferNoClick?.map((data: PackageModel) => data.agent_commission)
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

        const groupedDataCommissionTransferNoClick: GroupedDataCost[] = Object.values(
          dataCommissionTransferNoClick.reduce((acc: any, item: any) => {
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
        this.groupAdminCommissionTransferNoClick = groupedDataCommissionTransferNoClick;
        console.log(groupedDataCommissionTransferNoClick);

        // Data Piutang
        const dataBa = response?.data?.filter((data: PackageModel) => data.status === 'Piutang');
        const dataCommissionBa = dataBa?.filter((data: PackageModel) => data.check_sp === true);
        this.totalCommissionBa = this.utils.sumTotal(
          dataCommissionBa?.map((data: PackageModel) => (data?.discount ? data.discount * 0.15 : data.agent_commission))
        );

        const dataCommissionBaNoClick = dataBa?.filter((data: PackageModel) => data.check_sp == null);
        this.totalCommissionBaNoClick = this.utils.sumTotal(
          dataCommissionBaNoClick?.map((data: PackageModel) => data.agent_commission)
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

        const groupedDataCommissionBaNoClick: GroupedDataCost[] = Object.values(
          dataCommissionBaNoClick.reduce((acc: any, item: any) => {
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
        this.groupAdminCommissionBaNoClick = groupedDataCommissionBaNoClick;
        console.log(groupedDataCommissionBaNoClick);

        // Data Customer (Bulanan)
        const dataCustomerMonthly = response?.data?.filter(
          (data: PackageModel) => data.status === 'Customer (Bulanan)'
        );
        const dataCommissionCustomerMonthly = dataCustomerMonthly?.filter(
          (data: PackageModel) => data.check_sp === true
        );
        this.totalCommissionCustomerMonthly = this.utils.sumTotal(
          dataCommissionCustomerMonthly?.map((data: PackageModel) =>
            data?.discount ? data.discount * 0.15 : data.agent_commission
          )
        );

        const dataCommissionCustomerMonthlyNoClick = dataCustomerMonthly?.filter(
          (data: PackageModel) => data.check_sp == null
        );
        this.totalCommissionCustomerMonthlyNoClick = this.utils.sumTotal(
          dataCommissionCustomerMonthlyNoClick?.map((data: PackageModel) => data.agent_commission)
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

        const groupedDataCommissionCustomerMonthlyNoClick: GroupedDataCost[] = Object.values(
          dataCommissionCustomerMonthlyNoClick.reduce((acc: any, item: any) => {
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
        this.groupAdminCommissionCustomerMonthlyNoClick = groupedDataCommissionCustomerMonthlyNoClick;
        console.log(groupedDataCommissionCustomerMonthlyNoClick);

        // Data ba
        const dataPiutang = response.data?.filter((data: PackageModel) => data.status === 'Bayar Tujuan (COD)');
        this.dataBa = dataPiutang;

        this.dataPiutang = dataPiutang?.filter((data: PackageModel) => data.check_payment === true);
        const dataCommissionPiutang = dataPiutang?.filter((data: PackageModel) => data.check_sp === true);
        this.totalCommissionPiutang = this.utils.sumTotal(
          dataCommissionPiutang?.map((data: PackageModel) =>
            data?.discount ? data.discount * 0.15 : data.agent_commission
          )
        );

        this.dataPiutangNoClick = dataPiutang?.filter((data: PackageModel) => data.check_payment == null);
        const dataCommissionPiutangNoClick = dataPiutang?.filter((data: PackageModel) => data.check_sp == null);
        this.totalCommissionPiutangNoClick = this.utils.sumTotal(
          dataCommissionPiutangNoClick?.map((data: PackageModel) => data.agent_commission)
        );

        this.totalPiutang = this.utils.sumTotal(this.dataPiutang?.map((data: PackageModel) => data.cost));
        this.totalKoliPiutang = this.dataPiutang?.length;
        this.totalPiutangNoClick = this.utils.sumTotal(this.dataPiutangNoClick?.map((data: PackageModel) => data.cost));
        this.totalKoliPiutangNoClick = this.dataPiutangNoClick?.length;

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

        const groupedDataCommissionPiutangNoClick: GroupedDataCost[] = Object.values(
          dataCommissionPiutangNoClick.reduce((acc: any, item: any) => {
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
        this.groupAdminCommissionPiutangNoClick = groupedDataCommissionPiutangNoClick;
        console.log(groupedDataCommissionPiutangNoClick);

        const groupedDataPiutang: GroupedDataCost[] = Object.values(
          this.dataPiutang.reduce((acc: any, item: any) => {
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

        const groupedDataPiutangNoClick: GroupedDataCost[] = Object.values(
          this.dataPiutangNoClick.reduce((acc: any, item: any) => {
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
        this.groupAdminPiutangNoClick = groupedDataPiutangNoClick;
        console.log(groupedDataPiutangNoClick);

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
          Number(this.totalCommissionBa) +
          Number(this.totalCommissionPiutang) +
          Number(this.totalCommissionCustomerMonthly);

        this.totalCommissionPackageOnly =
          Number(this.totalCommission) +
          Number(this.totalCommissionTransfer) +
          Number(this.totalCommissionBa) +
          Number(this.totalCommissionCustomerMonthly);

        this.totalCommissionPackageOnlyNoClick =
          Number(this.totalCommissionNoClick) +
          Number(this.totalCommissionTransferNoClick) +
          Number(this.totalCommissionBaNoClick) +
          Number(this.totalCommissionCustomerMonthlyNoClick);

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  printWithClass(className: string): void {
    const printContents = document.querySelector(`.${className}`)?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      document.body.classList.add('print-mode');
      window.print();
      document.body.classList.remove('print-mode');
      document.body.innerHTML = originalContents;
      location.reload();
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlistdate');
  }
}
