import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Utils } from '@app/@shared';
import { Dates } from '@app/@shared/interfaces/pagination';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, finalize, takeUntil } from 'rxjs';
import { CashoutService } from '../cashout/cashout.service';

@Component({
  selector: 'app-recapitulation',
  templateUrl: './recapitulation.component.html',
  styleUrls: ['./recapitulation.component.scss'],
})
export class RecapitulationComponent implements OnInit, OnDestroy {
  public data: any[] = [];
  public totalSetoran: any = 0;
  public totalCommission: any = 0;
  public totalOmzet: any = 0;

  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];

  calendar = inject(NgbCalendar);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 0);

  startDate: any;
  endDate: any;

  public configuration: Config = { ...DefaultConfig };

  public pagination = {
    limit: '',
    offset: '',
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: 'Completed',
  };
  public params = {
    limit: '',
    page: '',
    search: '',
    startDate: '',
    endDate: '',
    city: 'Malang',
    status: 'Completed',
  };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private cashoutService: CashoutService, private utils: Utils, private readonly cdr: ChangeDetectorRef) {
    // set min selected date
    const minDate = this.utils.indonesiaDateFormat(new Date());
    var getDate = new Date(minDate);

    const valueBookFromDate = new Date(getDate.getFullYear(), getDate.getMonth(), getDate.getDate());
    const { startDate, endDate } = this.utils.rangeDate(valueBookFromDate, valueBookFromDate);
    this.startDate = startDate;
    this.endDate = endDate;
  }

  ngOnInit() {
    this.columns = [
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

    this.configuration.paginationEnabled = false;
    this.configuration.horizontalScroll = false;
  }

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      datepicker.close(); // Close datepicker popup

      const valueBookFromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      const valueBookToDate = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
      const { startDate, endDate } = this.utils.rangeDate(valueBookFromDate, valueBookToDate);
      this.startDate = startDate;
      this.endDate = endDate;

      const params = {
        startDate: this.startDate,
        endDate: this.endDate,
      };
      console.log(params);
      this.dataList(params);
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  printFilterDate(datepicker: any) {
    sessionStorage.setItem('printlist', JSON.stringify(this.data));

    const dateRange = {
      fromDate: this.startDate,
      toDate: this.endDate,
    };
    console.log(dateRange);
    sessionStorage.setItem('printlistdate', JSON.stringify(dateRange));
    window.open('booking/passenger/transaction/printlist', '_blank');
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  private dataList(params: Dates): void {
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
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.data = [];
          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = false;
          this.cdr.detectChanges();
        }
      });
  }

  printRecapitulation() {
    const paramRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: this.pagination.status,
    };
    console.log(paramRange);
    sessionStorage.setItem('printrecapitulation', JSON.stringify(paramRange));
    window.open('finance/recapitulation/deposit/printrecapitulation', '_blank');
  }

  piutangData() {
    const paramRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: this.pagination.status,
    };
    console.log(paramRange);
    sessionStorage.setItem('printrecapitulation', JSON.stringify(paramRange));
    window.open('finance/recapitulation/deposit/printpiutang', '_blank');
  }

  revenueData() {
    const paramRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: this.pagination.status,
    };
    console.log(paramRange);
    sessionStorage.setItem('printrecapitulation', JSON.stringify(paramRange));
    window.open('finance/recapitulation/deposit/printrevenue', '_blank');
  }

  bsdPnpData() {
    const paramRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: this.pagination.status,
    };
    console.log(paramRange);
    sessionStorage.setItem('printrecapitulation', JSON.stringify(paramRange));
    window.open('finance/recapitulation/deposit/printbsdpnp', '_blank');
  }

  bsdPktData() {
    const paramRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: this.pagination.status,
    };
    console.log(paramRange);
    sessionStorage.setItem('printrecapitulation', JSON.stringify(paramRange));
    window.open('finance/recapitulation/deposit/printbsdpkt', '_blank');
  }

  bbmData() {
    const paramRange = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      fromDate: this.startDate,
      toDate: this.endDate,
      city: '',
      status: this.pagination.status,
    };
    console.log(paramRange);
    sessionStorage.setItem('printrecapitulation', JSON.stringify(paramRange));
    window.open('finance/recapitulation/deposit/printbbm', '_blank');
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    sessionStorage.removeItem('printrecapitulation');
    sessionStorage.removeItem('printlistdate');
    sessionStorage.removeItem('printpiutang');
    sessionStorage.removeItem('printbsdpnp');
    sessionStorage.removeItem('printbsdpkt');
  }
}
