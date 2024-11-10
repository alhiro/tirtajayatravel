import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '@app/@shared';
import { GoSendModel } from '@app/pages/booking/package/models/gosend';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { PassengerModel } from '@app/pages/booking/passenger/models/passenger.model';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
  selector: 'app-printbsd',
  templateUrl: './printbsd.component.html',
  styleUrls: ['./printbsd.component.scss'],
})
export class PrintbsdComponent implements OnInit, OnDestroy {
  public data: any;
  public dataMalangPackage: any;
  public dataSurabayaPackage: any;
  public dataMalangPassenger: any;
  public dataSurabayaPassenger: any;
  public type: any;

  public configuration: Config = { ...DefaultConfig };
  public columnsPackage!: Columns[];
  public columnsPassenger!: Columns[];

  public nowDate!: Date;

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
  public bbmTotal = 0;
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

  constructor(private router: Router, private utils: Utils) {}

  ngOnInit() {
    this.getPrintSP();

    this.nowDate = new Date();

    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = false;
    this.configuration.paginationEnabled = false;
    this.configuration.orderEnabled = false;

    this.columnsPassenger = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Booking Code' },
      { key: 'tariff', title: 'Tariff' },
      { key: 'total_passenger', title: 'Pax' },
      { key: 'payment', title: 'Status Payment' },
      { key: 'check', title: 'Check' },
      { key: 'tariff', title: 'Payment' },
      { key: 'check', title: 'Check' },
      { key: 'agent_commission', title: 'Commission' },
    ];

    this.columnsPackage = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Resi Number' },
      { key: 'address', title: 'Address' },
      { key: 'origin_from', title: 'Status Item' },
      { key: 'status', title: 'status Payment' },
      { key: 'check', title: 'Check' },
      { key: 'cost', title: 'Cost' },
      { key: 'check', title: 'Check' },
      { key: 'agent_commission', title: 'Commission' },
    ];
  }

  getPrintSP() {
    // const currentState = this.router.lastSuccessfulNavigation;
    // this.data = currentState?.extras.state?.['data'];
    // this.dataPackages = this.data.employee?.['packages'];

    const getData: any = sessionStorage.getItem('printbsd');
    const getType: any = sessionStorage.getItem('type');
    const objData = JSON.parse(getData);
    const objType = JSON.parse(getType);
    console.log(objData);
    console.log(objType);

    this.type = objType;

    this.data = objData;
    this.dataMalangPackage = this.data?.packages?.filter((val: GoSendModel) => val.city_id === 1);
    this.dataSurabayaPackage = this.data?.packages?.filter((val: GoSendModel) => val.city_id === 2);
    this.dataMalangPassenger = this.data?.passengers?.filter((val: GoSendModel) => val.city_id === 1);
    this.dataSurabayaPassenger = this.data?.passengers?.filter((val: GoSendModel) => val.city_id === 2);

    // Passenger
    this.totalPassenger = this.utils.sumTotal(
      this.data?.passengers?.map((data: PassengerModel) => data.total_passenger)
    );

    const filterPaymentPassenger = this.data?.passengers.filter((row: any) => row.check_payment === true);
    this.totalTariff = this.utils.sumTotal(filterPaymentPassenger?.map((data: PassengerModel) => data.tariff));

    // Debet
    this.mandatoryDeposit = this.data?.cost?.mandatory_deposit;
    this.depositDriver = this.data?.cost?.driver_deposit;
    this.voluntaryDeposit = this.data?.cost?.voluntary_deposit;
    this.oldFullKm = this.data?.cost?.old_km;
    this.currentFullKm = Number(this.data?.cost?.current_km) - Number(this.data?.cost?.old_km);
    // Cost/L
    this.differentInKm = Number(this.currentFullKm) - Number(this.oldFullKm);
    this.averageKm = this.utils.calculateAverageKmPerLiter(this.oldFullKm, this.currentFullKm, this.bbm);

    // Kredit
    this.totalCommissionPassenger = this.utils.sumTotal(
      this.data?.passengers?.map((data: PassengerModel) => data.agent_commission)
    );
    this.bbm = this.data?.cost?.bbm;
    this.bbmTotal = this.data?.cost?.bbm_cost;
    this.totalParkingPassenger = this.data?.cost?.parking_passenger;
    this.inToll = this.data?.cost?.toll_in;
    this.outToll = this.data?.cost?.toll_out;
    this.extra = this.data?.cost?.extra;
    this.others = this.data?.cost?.others;

    this.totalDebetPassenger = this.utils.sumNumbers(
      this.totalTariff,
      this.mandatoryDeposit,
      this.depositDriver,
      this.voluntaryDeposit
    );
    this.totalKreditPassenger = this.utils.sumNumbers(
      this.totalCommissionPassenger,
      this.bbm,
      this.totalParkingPassenger,
      this.inToll,
      this.outToll,
      this.overnight,
      this.extra,
      this.others
    );
    this.totalDepositDriverPassenger = Number(this.totalDebetPassenger) - Number(this.totalKreditPassenger);
    this.totalDepositOffice = Number(this.totalTariff) - Number(this.totalKreditPassenger);

    // Package
    const filterPaymentPackage = this.data?.packages.filter((row: any) => row.check_payment === true);
    this.totalCost = this.utils.sumTotal(filterPaymentPackage?.map((data: PackageModel) => data.cost));
    this.totalCommissionPackage = this.utils.sumTotal(
      this.data?.packages?.map((data: PackageModel) => data.agent_commission)
    );
    this.totalDebetPackage = this.totalCost;
    this.totalKreditPackage = Number(this.totalCommissionPackage) + Number(this.totalParkingPackage);
    this.totalDepositDriverPackage = Number(this.totalDebetPackage) - Number(this.totalKreditPackage);
  }

  ngOnDestroy() {
    sessionStorage.removeItem('printbsd');
    sessionStorage.removeItem('type');
  }
}
