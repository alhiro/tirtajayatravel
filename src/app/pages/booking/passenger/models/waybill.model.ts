export class WaybillModel {
  waybill_id!: number;
  customer_id!: number;
  passenger_id!: number;
  date!: Date;
  time: any;

  setWaybill(_waybill: unknown) {
    const waybill = _waybill as WaybillModel;
    this.waybill_id = waybill.waybill_id;
    this.customer_id = waybill.customer_id;
    this.passenger_id = waybill.passenger_id;
    this.date = waybill.date;
    this.time = waybill.time;
  }
}
