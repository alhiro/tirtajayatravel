import { CarModel } from '@app/pages/master/car/models/car.model';
import { EmployeeyModel } from '@app/pages/master/employee/models/employee.model';
import { PackageModel } from './package.model';
import { PassengerModel } from '../../passenger/models/passenger.model';
import { CostModel } from '@app/pages/finance/bsd/models/cost.model';

export class GoSendModel {
  go_send_id!: number;
  employee_id!: number;
  employee!: EmployeeyModel;
  car_id!: number;
  car!: CarModel;
  city_id!: number;
  package_id!: number;
  packages!: PackageModel;
  passenger_id!: number;
  passengers!: PassengerModel;
  cost_id!: number;
  cost!: CostModel;
  telp!: string;
  send_time!: any;
  send_date!: Date;
  sp_number!: string;
  sp_package!: string;
  sp_passenger!: string;
  bsd!: string;
  bsd_passenger!: string;
  bsd_date!: Date;
  box!: string;
  bsd_box!: string;
  isCreateSP!: boolean;
  go_send: any;
  resi_number!: string;
  description!: string;
  status!: string;

  setGoSend(_gosend: unknown) {
    const gosend = _gosend as GoSendModel;
    this.go_send_id = gosend.go_send_id;
    this.employee_id = gosend.employee_id;
    this.car_id = gosend.car_id;
    this.city_id = gosend.city_id;
    this.package_id = gosend.package_id;
    this.cost_id = gosend.go_send_id;
    this.telp = gosend.telp || '';
    this.send_time = gosend.send_time;
    this.send_date = gosend.send_date || '';
    this.sp_number = gosend.sp_number || '';
    this.sp_package = gosend.sp_package || '';
    this.sp_passenger = gosend.sp_passenger || '';
    this.bsd = gosend.bsd || '';
    this.bsd_passenger = gosend.bsd_passenger || '';
    this.box = gosend.box || '';
    this.bsd_box = gosend.bsd_box || '';
    this.description = gosend.description || '';
    this.status = gosend.status || '';
  }
}
