export class RecipientModel {
  recipient_id!: number;
  customer_id!: number;
  customer: any;
  package_id!: number;
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
