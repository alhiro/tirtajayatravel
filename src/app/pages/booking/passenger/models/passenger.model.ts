import { GoSendModel } from '../../package/models/gosend';

export class PassengerModel {
  passenger_id!: number;
  waybill_id!: number;
  waybills: any;
  waybill: any;
  destination_id!: number;
  destinations: any;
  destination: any;
  city_id!: number;
  city: any;
  employee_id!: number;
  go_send_id!: number;
  go_send!: GoSendModel;
  tariff!: number;
  discount!: number;
  agent_commission!: number;
  other_fee!: number;
  book_date!: Date;
  total_passenger!: Date;
  payment!: string;
  status!: string;
  status_passenger!: string;
  note!: string;
  description!: string;
  resi_number!: string;
  cancel!: boolean;
  move!: boolean;
  position!: string;
  charter!: string;
  check_payment!: boolean;
  check_payment_passenger!: boolean;
  check_sp!: boolean;
  check_sp_passenger!: boolean;
  check_date_sp!: Date;

  setPackage(_passenger: unknown) {
    const passenger = _passenger as PassengerModel;
    this.passenger_id = passenger.passenger_id;
    this.waybills = passenger.waybills;
    this.destination_id = passenger.destination_id;
    this.destinations = passenger.destinations;
    this.city_id = passenger.city_id;
    (this.city = passenger.city), (this.employee_id = passenger.employee_id);
    this.go_send_id = passenger.go_send_id;
    this.tariff = passenger.tariff;
    this.discount = passenger.discount;
    this.agent_commission = passenger.agent_commission;
    this.other_fee = passenger.other_fee;
    this.book_date = passenger.book_date;
    this.total_passenger = passenger.total_passenger || '';
    this.payment = passenger.payment || '';
    this.status = passenger.status || '';
    this.note = passenger.note;
    this.description = passenger.description || '';
    this.status = passenger.status || '';
    this.status_passenger = passenger.status_passenger || '';
    this.resi_number = passenger.resi_number || '';
    this.cancel = passenger.cancel || false;
    this.move = passenger.move || false;
    this.position = passenger.position || '';
    this.charter = passenger.charter || '';
    this.check_payment = passenger.check_payment || false;
    this.check_sp = passenger.check_sp || false;
    this.check_date_sp = passenger.check_date_sp;
  }
}
