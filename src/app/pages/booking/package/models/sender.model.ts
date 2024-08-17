export class SenderModel {
  sender_id!: number;
  customer_id!: number;
  package_id!: number;
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

  setRecipient(_senders: unknown) {
    const sender = _senders as SenderModel;
    this.sender_id = sender.sender_id;
    this.customer_id = sender.customer_id;
    this.package_id = sender.package_id;
    this.name = sender.name || '';
    this.address = sender.address || '';
    this.telp = sender.telp || '';
    this.default = sender.default || false;
    this.longitude = sender.longitude || '';
    this.latitude = sender.latitude || '';
    this.zoom = sender.zoom || '';
    this.description = sender.description || '';
    this.used = sender.used || '';
    this.date = sender.date;
    this.time = sender.time;
  }
}
