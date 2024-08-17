export class RecipientModel {
  recipient_id!: number;
  customer_id!: number;
  customer: any;
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
  sign!: string;
  received_by!: string;
  received_date!: Date;
  courier!: string;
  user_payment!: string;
  date_payment!: Date;

  setRecipient(_reicipients: unknown) {
    const recipient = _reicipients as RecipientModel;
    this.recipient_id = recipient.recipient_id;
    this.customer_id = recipient.customer_id;
    this.package_id = recipient.package_id;
    this.name = recipient.name || '';
    this.address = recipient.address || '';
    this.telp = recipient.telp || '';
    this.default = recipient.default || false;
    this.longitude = recipient.longitude || '';
    this.latitude = recipient.latitude || '';
    this.zoom = recipient.zoom || '';
    this.description = recipient.description || '';
    this.used = recipient.used || '';
    this.date = recipient.date;
    this.time = recipient.time;
    this.sign = recipient.sign || '';
    this.received_by = recipient.received_by || '';
    this.received_date = recipient.received_date;
    this.courier = recipient.courier || '';
    this.user_payment = recipient.user_payment || '';
    this.date_payment = recipient.date_payment;
  }
}
