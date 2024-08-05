export class CashoutModel {
  cashout_id!: number;
  package_id!: number;
  passenger_id!: number;
  city_id!: number;
  date!: any;
  type!: string;
  fee!: Date;
  description!: Date;

  setCar(_cashout: unknown) {
    const cashout = _cashout as CashoutModel;
    this.cashout_id = cashout.cashout_id;
    this.package_id = cashout.package_id;
    this.passenger_id = cashout.passenger_id;
    this.city_id = cashout.city_id;
    this.date = cashout.date;
    this.type = cashout.type || '';
    this.fee = cashout.fee;
    this.description = cashout.description || '';
  }
}
