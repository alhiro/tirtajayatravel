export class DestinationModel {
  destination_id!: number;
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

  setWaybill(_destination: unknown) {
    const destination = _destination as DestinationModel;
    this.destination_id = destination.destination_id;
    this.customer_id = destination.customer_id;
    this.name = destination.name || '';
    this.address = destination.address || '';
    this.telp = destination.telp || '';
    this.default = destination.default || false;
    this.longitude = destination.longitude || '';
    this.latitude = destination.latitude || '';
    this.zoom = destination.zoom || '';
    this.description = destination.description || '';
    this.used = destination.used || '';
    this.date = destination.date;
    this.time = destination.time;
  }
}
