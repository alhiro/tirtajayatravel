import { CarModel } from '@app/pages/master/car/models/car.model';
import { EmployeeyModel } from '@app/pages/master/employee/models/employee.model';
import { PackageModel } from './package.model';
import { PassengerModel } from '../../passenger/models/passenger.model';

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
    const packages = _gosend as GoSendModel;
    this.go_send_id = packages.go_send_id;
    this.employee_id = packages.employee_id;
    this.car_id = packages.car_id;
    this.city_id = packages.city_id;
    this.package_id = packages.package_id;
    this.telp = packages.telp || '';
    this.send_time = packages.send_time;
    this.send_date = packages.send_date || '';
    this.sp_number = packages.sp_number || '';
    this.sp_package = packages.sp_package || '';
    this.sp_passenger = packages.sp_passenger || '';
    this.bsd = packages.bsd || '';
    this.bsd_passenger = packages.bsd_passenger || '';
    this.box = packages.box || '';
    this.bsd_box = packages.bsd_box || '';
    this.description = packages.description || '';
    this.status = packages.status || '';
  }
}
