import { CarModel } from '@app/pages/master/car/models/car.model';
import { VendorModel } from '../../vendor/models/vendor.model';

export class ScheduleModel {
  garage_id!: number;
  employee_id!: number;
  car_id!: number;
  vendor_garage_id!: number;
  car!: CarModel;
  vendor_garage!: VendorModel;
  go_send_id!: number;
  name!: string;
  service_date!: Date;
  service!: string;
  description!: string;
  reason!: string;
  cost!: number;
  current_km!: number;
  old_km!: number;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;

  setSchedule(_schedule: unknown) {
    const schedule = _schedule as ScheduleModel;
    this.garage_id = schedule.garage_id;
    this.employee_id = schedule.employee_id;
    this.car_id = schedule.car_id;
    this.vendor_garage_id = schedule.vendor_garage_id;
    this.go_send_id = schedule.go_send_id;
    this.name = schedule.name || '';
    this.service_date = schedule.service_date;
    this.service = schedule.service || '';
    this.description = schedule.description || '';
    this.reason = schedule.reason || '';
    this.cost = schedule.cost;
    this.current_km = schedule.current_km;
    this.old_km = schedule.old_km;
    this.createdAt = schedule.createdAt;
    this.updatedAt = schedule.updatedAt;
  }
}
