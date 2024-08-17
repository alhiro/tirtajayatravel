export class WaybillModel {
  waybill_id!: number;
  customer_id!: number;
  name!: string;
  address!: string;
  telp!: string;
  default!: boolean;
  longitude!: any;
  latitude!: any;
  zoom!: any;
  description!: string;
  used!: string;
  date!: Date;
  time: any;

  setWaybill(_waybill: unknown) {
    const waybill = _waybill as WaybillModel;
    this.waybill_id = waybill.waybill_id;
    this.customer_id = waybill.customer_id;
    this.name = waybill.name || '';
    this.address = waybill.address || '';
    this.telp = waybill.telp || '';
    this.default = waybill.default || false;
    this.longitude = waybill.longitude || '';
    this.latitude = waybill.latitude || '';
    this.zoom = waybill.zoom || '';
    this.description = waybill.description || '';
    this.used = waybill.used || '';
    this.date = waybill.date;
    this.time = waybill.time;
  }
}
