import { registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Dates, ExtendedPaginationContext } from '@app/@shared/interfaces/pagination';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { PackageService } from '@app/pages/booking/package/package.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { finalize, Subject, takeUntil } from 'rxjs';
import localeId from '@angular/common/locales/id';
import { Router } from '@angular/router';
import { CashoutService } from '../../cashout/cashout.service';
import { PassengerModel } from '@app/pages/booking/passenger/models/passenger.model';

interface GroupedDataCost {
  id: number;
  admin: string;
  totalCost: number;
}

@Component({
  selector: 'app-printrecapitulation',
  templateUrl: './printrecapitulation.component.html',
  styleUrls: ['./printrecapitulation.component.scss'],
})
export class PrintrecapitulationComponent implements OnInit {
  public data: any;
  public totalData: any;

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
  public columnsPiutang!: Columns[];
  public columnsBsd!: Columns[];
  public columnsBsdPkt!: Columns[];

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

  lastSegment: string = '';

  public totalSetoran: any = 0;
  public totalCommission: any = 0;
  public totalOmzet: any = 0;

  public totalPiutangSby: any = 0;
  public totalPiutangMlg: any = 0;
  public totalPiutang: any = 0;

  constructor(
    private packageService: PackageService,
    private readonly cdr: ChangeDetectorRef,
    private router: Router,
    private cashoutService: CashoutService
  ) {
    registerLocaleData(localeId, 'id');

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
      // data table recapitulation deposit
      // { key: 'passenger_id', title: 'No' },
      { key: 'date', title: 'Date' },
      { key: 'total_bsd_package', title: 'Total BSD Package' },
      { key: 'total_bsd_passenger', title: 'Total BSD Passenger' },
      { key: 'package_paid_mlg', title: 'Package Paid Malang' },
      { key: 'package_paid_sby', title: 'Package Paid Surabaya' },
      { key: 'pnp_pkt_transfer', title: 'Pnp & Pkt Transfer (Monthly)' },
      { key: 'operational_deposit', title: 'Operational Deposit' },
      { key: 'piutang_package_sby', title: 'Piutang Surabaya' },
      { key: 'piutang_package_mlg', title: 'Piutang Malang' },
      { key: 'commission_package_mlg', title: 'Komisi Malang' },
      { key: 'commission_package_sby', title: 'Komisi Surabaya' },
    ];

    // data table recapitulation piutang
    this.columnsPiutang = [
      { key: '', title: 'No' },
      { key: 'book_date', title: 'Date' },
      { key: '', title: 'Total Piutang SBY' },
      { key: '', title: 'Total Piutang MLG' },
      { key: '', title: 'Total Piutang' },
    ];

    // data table bsd pnp
    this.columnsBsd = [
      { key: '', title: 'No' },
      { key: 'bsd_date', title: 'Date' },
      { key: 'bsd_passenger', title: 'No Bsd Pnp' },
      { key: 'employee.name', title: 'Driver' },
      { key: 'car_number', title: 'No Mobil' },
      { key: 'total_passenger', title: '#PNP' },
      { key: 'mandatory_deposit', title: 'T.Wajib' },
      { key: 'driver_deposit', title: 'T.Driver' },
      { key: 'voluntary_deposit', title: 'T.SKRL' },
      { key: 'agent_commission', title: 'Komisi' },
      { key: 'overnight', title: 'Bermalam' },
      { key: 'extra', title: 'Extra' },
      { key: 'others', title: 'Lainnya' },
    ];

    // data table bsd pkt
    this.columnsBsdPkt = [
      { key: '', title: 'No' },
      { key: 'bsd_date', title: 'Date' },
      { key: 'bsd', title: 'No Bsd Pkt' },
      { key: 'employee.name', title: 'Driver' },
      { key: 'car_number', title: 'No Mobil' },
      { key: 'total_package', title: '#PKT' },
      { key: 'cost', title: 'Setor' },
      { key: 'agent_commission', title: 'Komisi' },
    ];

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.horizontalScroll = false;
    this.configuration.paginationEnabled = false;

    this.nowDate = new Date();
    // this.getPrint();

    const getDataDate: any = sessionStorage.getItem('printrecapitulation');
    const objDataDate = JSON.parse(getDataDate);
    console.log(objDataDate);

    this.status = objDataDate.status;
    this.startDate = objDataDate.fromDate;
    this.startDateDisplay = this.startDate?.split(' ')[0];
    this.endDate = objDataDate.toDate;
    this.endDateDisplay = this.endDate?.split(' ')[0];

    if (this.lastSegment === 'printrecapitulation') {
      console.log('run printrecapitulation');
      const params = {
        limit: '',
        page: '',
        search: '',
        startDate: this.startDate,
        endDate: this.endDate,
        city: '',
        status: this.status,
      };

      this.dataListRecapitulation(params);
    } else if (this.lastSegment === 'printpiutang') {
      console.log('run printpiutang');
      const params = {
        limit: '',
        page: '',
        search: objDataDate.search,
        startDate: this.startDate,
        endDate: this.endDate,
        city: '',
        status: this.status,
      };
      this.dataListPiutang(this.params);
    } else if (this.lastSegment === 'printrevenue') {
      console.log('run printrevenue');
    } else if (this.lastSegment === 'printbsdpnp') {
      console.log('run printbsdpnp');

      const params = {
        limit: 100,
        page: 1,
        search: '',
        startDate: this.startDate,
        endDate: this.endDate,
        city: '',
        status: 'bsdDone',
      };

      this.dataListBsdPnp(params);
    } else if (this.lastSegment === 'printbsdpkt') {
      console.log('run printbsdpkt');
      const params = {
        limit: 100,
        page: 1,
        search: '',
        startDate: this.startDate,
        endDate: this.endDate,
        city: '',
        status: 'bsdDone',
      };

      this.dataListBsdPkt(params);
    } else if (this.lastSegment === 'printbbm') {
      console.log('run printbbm');
    }
  }

  // data recapitulation
  private dataListRecapitulation(params: Dates): void {
    this.configuration.isLoading = true;
    this.cashoutService
      .listRecapitulation(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        // count malang or surabaya
        if (response.length > 0) {
          const totals = {
            total_bsd_package_value: 0,
            total_bsd_passenger_value: 0,
            package_paid_mlg_value: 0,
            package_paid_sby_value: 0,
            piutang_package_mlg_value: 0,
            piutang_passenger_mlg_value: 0,
            piutang_package_sby_value: 0,
            piutang_passenger_sby_value: 0,
            commission_package_mlg_value: 0,
            commission_passenger_mlg_value: 0,
            commission_package_sby_value: 0,
            commission_passenger_sby_value: 0,
          };

          // Calculate totals
          response.forEach((item: any) => {
            totals.total_bsd_package_value += parseFloat(item.total_bsd_package);
            totals.total_bsd_passenger_value += parseFloat(item.total_bsd_passenger);
            totals.package_paid_mlg_value += parseFloat(item.package_paid_mlg);
            totals.package_paid_sby_value += parseFloat(item.package_paid_sby);
            totals.piutang_package_mlg_value += parseFloat(item.piutang_package_mlg);
            totals.piutang_passenger_mlg_value += parseFloat(item.piutang_passenger_mlg);
            totals.piutang_package_sby_value += parseFloat(item.piutang_package_sby);
            totals.piutang_passenger_sby_value += parseFloat(item.piutang_passenger_sby);
            totals.commission_package_mlg_value += parseFloat(item.commission_package_mlg);
            totals.commission_passenger_mlg_value += parseFloat(item.commission_passenger_mlg);
            totals.commission_package_sby_value += parseFloat(item.commission_package_sby);
            totals.commission_passenger_sby_value += parseFloat(item.commission_passenger_sby);
          });

          const result = [
            ...response,
            {
              date: 'Total',
              total_bsd_package: totals.total_bsd_package_value,
              total_bsd_passenger: totals.total_bsd_passenger_value,
              package_paid_mlg: totals.package_paid_mlg_value,
              package_paid_sby: totals.package_paid_sby_value,
              count_pnp_pkt_transfer_monthly: 0,
              count_operational_deposit:
                totals.total_bsd_package_value +
                totals.total_bsd_passenger_value +
                totals.package_paid_mlg_value +
                totals.package_paid_sby_value +
                0,
              piutang_package_mlg: totals.piutang_package_mlg_value,
              piutang_passenger_mlg: totals.piutang_passenger_mlg_value,
              piutang_package_sby: totals.piutang_package_sby_value,
              piutang_passenger_sby: totals.piutang_passenger_sby_value,
              commission_package_mlg: totals.commission_package_mlg_value,
              commission_passenger_mlg: totals.commission_passenger_mlg_value,
              commission_package_sby: totals.commission_package_sby_value,
              commission_passenger_sby: totals.commission_passenger_sby_value,
            },
          ];

          const totalPiutang =
            totals.piutang_package_mlg_value +
            totals.piutang_passenger_mlg_value +
            totals.piutang_package_sby_value +
            totals.piutang_passenger_sby_value;
          const totalSetoran =
            totals.total_bsd_package_value +
            totals.total_bsd_passenger_value +
            totals.package_paid_mlg_value +
            totals.package_paid_sby_value +
            0;
          this.totalSetoran = totalSetoran + totalPiutang;
          this.totalCommission =
            totals.commission_package_mlg_value +
            totals.commission_passenger_mlg_value +
            totals.commission_package_sby_value +
            totals.commission_passenger_sby_value;
          this.totalOmzet = this.totalSetoran - this.totalCommission;

          console.log(result);
          this.data = result;

          this.configuration.isLoading = false;
          this.cdr.detectChanges();
        } else {
          this.data = [];
          this.configuration.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private dataListPiutang(params: ExtendedPaginationContext): void {
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
        const piutang = response.data?.filter((data: PackageModel) => data.status === 'Piutang');

        this.data = calculatePiutang(piutang);
        console.log(this.data);

        this.configuration.isLoading = false;
        response?.length > 0
          ? (this.configuration.horizontalScroll = true)
          : (this.configuration.horizontalScroll = false);

        this.cdr.detectChanges();
      });
  }

  private dataListBsdPnp(params: ExtendedPaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        console.log(response.data);

        const filterCommissionPassenger = response.data?.map((data: any) => ({
          ...data,
          passengers: data.passengers?.filter((row: PassengerModel) => row.check_sp === true),
        }));
        console.log(filterCommissionPassenger);
        console.log(filterCommissionPassenger.length);

        // const commissionToll = filterCommissionPassenger?.map(
        //   (data: any) => (Number(data?.cost?.toll_out) * 0.15) / filterCommissionPassenger?.length
        // );

        const remapDataAll = filterCommissionPassenger?.map((item: any) => ({
          ...item,
          total_passengers: item.passengers?.length,
          total_cost: item.passengers
            ?.map((passengers: PassengerModel) => passengers.tariff)
            .reduce((acc: any, value: any) => Number(acc) + Number(value), 0),
          agent_commission: item.passengers
            ?.map((passengers: PassengerModel) => passengers.agent_commission)
            .reduce(
              (acc: any, value: any) =>
                Number(acc) + Number(value) - Number(item.cost?.toll_out * 0.15) / item.passengers?.length,
              0
            ),
          passengers: filterCommissionPassenger?.map((passenger: PassengerModel) => ({
            ...passenger,
            agent_commission: item.cost?.toll_out,
          })),
        }));

        // count total
        const totals = {
          pnp: 0,
          twajib: 0,
          tdriver: 0,
          tskrl: 0,
          komisi: 0,
          bermalam: 0,
          extra: 0,
          lainnya: 0,
        };
        // Calculate totals
        remapDataAll.forEach((item: any) => {
          totals.pnp += parseFloat(item?.total_passengers);
          totals.twajib += parseFloat(item?.cost?.mandatory_deposit);
          totals.tdriver += parseFloat(item?.cost?.driver_deposit);
          totals.tskrl += parseFloat(item?.cost?.voluntary_deposit);
          totals.komisi += parseFloat(item?.agent_commission);
          totals.bermalam += parseFloat(item?.cost?.overnight);
          totals.extra += parseFloat(item?.cost?.extra);
          totals.lainnya += parseFloat(item?.cost?.others);
        });
        console.log(remapDataAll);

        const result = [
          ...remapDataAll,
          {
            bsd_date: 'Total',
            agent_commission: totals.komisi,
            total_passengers: totals.pnp,
            passengers: filterCommissionPassenger,
            cost: {
              mandatory_deposit: totals.twajib,
              driver_deposit: totals.tdriver,
              voluntary_deposit: totals.tskrl,
              overnight: totals.bermalam,
              extra: totals.extra,
              others: totals.lainnya,
            },
          },
        ];
        this.data = result;
        console.log(this.data);

        // // count total
        // const totals = {
        //   twajib: 0,
        //   tdriver: 0,
        //   tskrl: 0,
        //   komisi: 0,
        //   bermalam: 0,
        //   extra: 0,
        //   lainnya: 0,
        // };

        // // Calculate totals
        // remapDataAll.forEach((item: any) => {
        //   totals.twajib += parseFloat(item?.cost?.mandatory_deposit);
        //   totals.tdriver += parseFloat(item?.cost?.driver_deposit);
        //   totals.tskrl += parseFloat(item?.cost?.voluntary_deposit);
        //   totals.komisi += parseFloat(item?.agent_commission);
        //   totals.bermalam += parseFloat(item?.cost?.overnight);
        //   totals.extra += parseFloat(item?.cost?.extra);
        //   totals.lainnya += parseFloat(item?.cost?.others);
        // });

        // const result = [
        //   ...remapDataAll,
        //   {
        //     date: 'Total',
        //     twajib: totals.twajib,
        //     tdriver: totals.tdriver,
        //     tskrl: totals.tskrl,
        //     komisi: totals.komisi,
        //     bermalam: totals.bermalam,
        //     extra: totals.extra,
        //     lainnya: totals.lainnya,
        //   },
        // ];
        // this.totalData = result;

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private dataListBsdPkt(params: ExtendedPaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        console.log(response.data);

        const filterCommissionPackage = response.data?.map((data: any) => ({
          ...data,
          packages: data.packages,
        }));
        console.log(filterCommissionPackage);
        console.log(filterCommissionPackage.length);

        const remapDataAll = filterCommissionPackage?.map((item: any) => ({
          ...item,
          total_packages: item.packages?.length,
          total_cost: item.packages
            ?.map((packages: PackageModel) => packages.cost)
            .reduce((acc: any, value: any) => Number(acc) + Number(value), 0),
          agent_commission: item.packages
            ?.map((packages: PackageModel) => packages.agent_commission)
            .reduce((acc: any, value: any) => Number(acc) + Number(value), 0),
        }));

        // count total
        const totals = {
          pkt: 0,
          cost: 0,
          komisi: 0,
        };
        // Calculate totals
        remapDataAll.forEach((item: any) => {
          totals.pkt += parseFloat(item?.total_packages);
          totals.cost += parseFloat(item?.total_cost);
          totals.komisi += parseFloat(item?.agent_commission);
        });

        const result = [
          ...remapDataAll,
          {
            bsd_date: 'Total',
            total_packages: totals.pkt,
            total_cost: totals.cost,
            agent_commission: totals.komisi,
          },
        ];
        this.data = result;
        console.log(this.data);

        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('printlistdate');
    sessionStorage.removeItem('printbsd');
    sessionStorage.removeItem('printrecapitulation');
    sessionStorage.removeItem('printbsdpnp');
    sessionStorage.removeItem('printbsdpkt');
  }
}

function calculatePiutang(data: any) {
  // Group data by `book_date`
  const groupedByDate = data.reduce((acc: any, item: any) => {
    const date = item.book_date;
    const cityId = item.city_id;
    const piutang = parseFloat(item.cost);

    if (!acc[date]) {
      acc[date] = {
        book_date: date,
        total_piutang_sby: 0,
        total_piutang_mlg: 0,
        total_piutang: 0,
      };
    }

    // Add piutang to respective city and overall totals
    if (cityId === 1) {
      acc[date].total_piutang_sby += piutang;
    } else if (cityId === 2) {
      acc[date].total_piutang_mlg += piutang;
    }
    acc[date].total_piutang += piutang;

    return acc;
  }, {});

  // Convert grouped object to an array
  return Object.values(groupedByDate).map((item: any) => ({
    book_date: item.book_date,
    total_piutang_sby: item.total_piutang_sby.toFixed(2),
    total_piutang_mlg: item.total_piutang_mlg.toFixed(2),
    total_piutang: item.total_piutang.toFixed(2),
  }));
}
