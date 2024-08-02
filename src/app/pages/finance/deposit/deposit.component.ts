import { Component, OnInit } from '@angular/core';
import { Utils } from '@app/@shared';
import {
  Pagination,
  PaginationContext,
  Params,
  defaultPagination,
  defaultParams,
} from '@app/@shared/interfaces/pagination';
import { GoSendModel } from '@app/pages/booking/package/models/gosend';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { PackageService } from '@app/pages/booking/package/package.service';
import { PassengerModel } from '@app/pages/booking/passenger/models/passenger.model';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, catchError, of, takeUntil } from 'rxjs';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
})
export class DepositComponent implements OnInit {
  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public configuration: Config = { ...DefaultConfig };

  public dataPackage: any;
  public dataPassenger: any;

  public totalCost = 0;
  public totalCommissionPackage = 0;
  public totalParkingPackage = 0;
  public totalDebetPackage = 0;
  public totalKreditPackage = 0;
  public totalDepositDriverPackage = 0;

  public totalTariff = 0;
  public totalPassenger = 0;
  public totalRemainingPayment = 0;
  public totalCommissionPassenger = 0;
  public mandatoryDeposit = 0;
  public depositDriver = 0;
  public voluntaryDeposit = 0;
  public oldFullKm = 0;
  public currentFullKm = 0;
  public differentInKm = 0;
  public averageKm = 0;
  public bbm = 0;
  public totalParkingPassenger = 0;
  public inToll = 0;
  public outToll = 0;
  public overnight = 0;
  public extra = 0;
  public others = 0;
  public totalDepositOffice = 0;
  public totalDebetPassenger = 0;
  public totalKreditPassenger = 0;
  public totalDepositDriverPassenger = 0;

  public pagination = {
    limit: 100,
    offset: 0,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };
  public params = {
    limit: '',
    page: '',
    search: '',
    startDate: '',
    endDate: '',
  };

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private packageService: PackageService,
    private handlerResponseService: HandlerResponseService,
    private utils: Utils
  ) {}

  ngOnInit() {
    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.paginationEnabled = false;

    this.columnsPackage = [
      // { key: '', title: 'No.' },
      { key: 'bsd', title: 'BSD Package' },
      { key: 'car_id', title: 'Driver' },
      { key: 'cost', title: 'Total' },
      { key: 'updated_by', title: 'Cashier' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.columnsPassenger = [
      // { key: '', title: 'No.' },
      { key: 'bsd_passenger', title: 'BSD Passenger' },
      { key: 'employee_id', title: 'Driver' },
      { key: 'tariff', title: 'Total' },
      { key: 'updated_by', title: 'Cashier' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];

    this.dataListBSD(this.params);
  }

  eventEmitted($event: { event: string; value: any }): void {
    console.log($event.value);
  }

  printBSD(val: GoSendModel, item: string) {
    sessionStorage.setItem('printbsd', JSON.stringify(val));
    sessionStorage.setItem('type', JSON.stringify(item));
    window.open('#/finance/bsd/tirta-jaya/printbsd', '_blank');
  }

  private dataListBSD(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.packageService
      .listSP(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError((err) => {
          this.configuration.isLoading = false;
          this.handlerResponseService.failedResponse(err);
          return of([]);
        })
      )
      .subscribe((response: any) => {
        if (response) {
          this.configuration.isLoading = false;

          const dataPackage = response.data?.filter((data: GoSendModel) => data.status === 'Box' && data.bsd !== null);
          this.dataPackage = dataPackage;
          console.log(this.dataPackage);

          const dataPassenger = response.data?.filter(
            (data: GoSendModel) => data.status === 'Reguler' && data.bsd_passenger !== null
          );
          this.dataPassenger = dataPassenger;
          console.log(this.dataPassenger);

          const dataBSD = response.data?.filter(
            (data: GoSendModel) => data.bsd !== null || data.bsd_passenger !== null
          );
          const { totalPackagesCost, totalCommissionPackage } = this.utils.sumCostPackages(dataBSD);
          const { totalPassengerCost, totalCommissionPassenger } = this.utils.sumCostPassengers(dataBSD);

          // Package
          this.totalCost = totalPackagesCost;
          this.totalCommissionPackage = totalCommissionPackage;
          this.totalDebetPackage = this.totalCost;
          this.totalKreditPackage = this.totalCommissionPackage + this.totalParkingPackage;
          this.totalDepositDriverPackage = this.totalDebetPackage - this.totalKreditPackage;

          // Passenger
          this.totalTariff = totalPassengerCost;
          this.totalCommissionPassenger = totalCommissionPassenger;
          this.totalDebetPassenger =
            this.totalTariff + this.mandatoryDeposit + this.depositDriver + this.voluntaryDeposit;
          this.totalKreditPassenger =
            this.totalCommissionPassenger +
            this.bbm +
            this.totalParkingPassenger +
            this.inToll +
            this.outToll +
            this.overnight +
            this.extra +
            this.others;
          this.totalDepositDriverPassenger = this.totalDebetPassenger - this.totalKreditPassenger;
        }
      });
  }
}
